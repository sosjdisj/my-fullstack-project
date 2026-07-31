"""
RAG 评估模块

用于对比三种模式下回答质量与耗时的差异：
  1. RAG + 重排序（向量召回 → reranker 二次排序）
  2. RAG 无重排序（仅向量召回）
  3. 无 RAG（直接让模型回答）

仅用于本地调试和评估，不属于业务代码。
评估时不走 Agent/工具调用，直接用 LLM 生成回答，以隔离 RAG 本身的效果差异。

使用方式：
  # 方式一：运行示例
  python -m services.evaluation

  # 方式二：在代码中调用
  import asyncio
  from services.evaluation import evaluate_single_query, print_evaluation_report
  result = asyncio.run(evaluate_single_query("博客里有哪些关于 Vue 的文章？", expected_keywords=["Vue"]))
  print_evaluation_report(result)
"""

import asyncio
import logging
import re
import time
from typing import Optional

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_ollama import ChatOllama
from motor.motor_asyncio import AsyncIOMotorClient
from qdrant_client import QdrantClient

import config
from services.embedding import embed_text
from services.rag import build_multi_turn_query, build_rag_context, build_rag_prompt
from services.reranker import rerank_candidates

logger = logging.getLogger(__name__)

# 评估用的 Qdrant 客户端（与 rag.py 配置一致）
_qdrant_client = QdrantClient(
    url=config.QDRANT_URL,
    api_key=config.QDRANT_API_KEY,
    check_compatibility=False,
)

# 评估用的 MongoDB 连接
_mongo_client: Optional[AsyncIOMotorClient] = None

# 评估专用 LLM：temperature=0 保证可复现，避免 Agent/工具调用的额外耗时干扰
_eval_llm = ChatOllama(
    model=config.OLLAMA_CHAT_MODEL,
    base_url=config.OLLAMA_BASE_URL,
    temperature=0.0,
)


def _get_mongo_db():
    """获取 MongoDB 数据库连接实例"""
    global _mongo_client
    if _mongo_client is None:
        _mongo_client = AsyncIOMotorClient(config.MONGODB_URI)
    db_name = config.MONGODB_URI.split("/")[-1].split("?")[0]
    return _mongo_client[db_name]


def _count_keyword_hits(answer: str, keywords: list[str]) -> dict:
    """统计期望关键词在回答中的命中情况（大小写不敏感）"""
    if not keywords:
        return {"hit_count": 0, "total": 0, "hit_rate": 0.0, "hits": []}
    lower_answer = answer.lower()
    hits = [k for k in keywords if k.lower() in lower_answer]
    return {
        "hit_count": len(hits),
        "total": len(keywords),
        "hit_rate": round(len(hits) / len(keywords), 4),
        "hits": hits,
    }


def _count_citations(answer: str) -> int:
    """统计回答中引用编号（如 [1]、[2]）的数量"""
    return len(re.findall(r"\[\d+\]", answer))


async def _vector_recall(
    query: str, top_k: int, threshold: float = 0.5
) -> tuple[list[dict], float]:
    """
    纯向量召回，不做重排序

    Args:
        query: 查询文本
        top_k: 返回结果数量
        threshold: 相似度阈值

    Returns:
        (候选结果列表, 召回耗时秒)
    """
    start = time.perf_counter()

    query_vector = await embed_text(query)

    search_results = _qdrant_client.query_points(
        collection_name=config.QDRANT_COLLECTION,
        query=query_vector,
        limit=top_k,
        score_threshold=threshold,
    ).points

    if not search_results:
        return [], time.perf_counter() - start

    db = _get_mongo_db()
    candidates = []
    for result in search_results:
        payload = result.payload or {}
        if not isinstance(payload, dict):
            payload = {}
        article_id = payload.get("article_id")
        if not article_id:
            continue
        article = await db.articles.find_one({"_id": article_id})
        if not article:
            continue
        chunk = {
            "article_id": str(article["_id"]),
            "article_title": article.get("title", ""),
            "content": payload.get("content", ""),
            "chunk_index": payload.get("chunk_index", 0),
            "heading": payload.get("heading", ""),
        }
        candidates.append({"chunk": chunk, "score": result.score})

    return candidates, time.perf_counter() - start


async def _retrieve_with_reranker(
    query: str, top_k: int = 5, threshold: float = 0.5
) -> tuple[list[dict], float, float]:
    """
    向量召回 + 重排序（复刻 rag.py 的主流程逻辑，但独立实现以便评估）

    Args:
        query: 查询文本
        top_k: 最终返回结果数量
        threshold: 向量相似度阈值

    Returns:
        (重排序后的候选列表, 召回耗时秒, 重排序耗时秒)
    """
    # 召回 top_k * 3 个候选，与 rag.py 保持一致
    candidates, retrieval_time = await _vector_recall(
        query, top_k=top_k * 3, threshold=threshold
    )

    if not candidates:
        return [], retrieval_time, 0.0

    start_rerank = time.perf_counter()
    reranked = await rerank_candidates(query, candidates, top_k=top_k)
    rerank_time = time.perf_counter() - start_rerank

    # 与 rag.py 一致：融合分数低于 0.3 的过滤掉
    filtered = [r for r in reranked if r.get("score", 0.0) >= 0.3]
    return filtered, retrieval_time, rerank_time


async def _generate_answer(
    prompt: str, history: Optional[list[dict]] = None
) -> tuple[str, float]:
    """
    用 LLM 生成回答

    Args:
        prompt: 输入提示词
        history: 对话历史

    Returns:
        (回答文本, 生成耗时秒)
    """
    messages: list = [
        SystemMessage(
            content="你是一个博客 AI 助手，请基于提供的资料回答用户问题。"
            "如果资料中没有相关信息，请根据你的知识回答，并说明这不是来自知识库的信息。"
        )
    ]
    if history:
        for msg in history:
            role = msg.get("role", "")
            content = msg.get("content", "")
            if role == "user":
                messages.append(HumanMessage(content=content))
            elif role == "assistant":
                messages.append(AIMessage(content=content))
    messages.append(HumanMessage(content=prompt))

    start = time.perf_counter()
    response = await _eval_llm.ainvoke(messages)
    return response.content, time.perf_counter() - start


async def evaluate_single_query(
    query: str,
    expected_keywords: Optional[list[str]] = None,
    history: Optional[list[dict]] = None,
    top_k: int = 5,
) -> dict:
    """
    对单个查询评估三种模式：RAG+重排序 / RAG无重排序 / 无RAG

    Args:
        query: 用户查询
        expected_keywords: 期望在回答中出现的关键词列表（用于命中率计算）
        history: 对话历史消息列表
        top_k: RAG 检索返回的顶部结果数量

    Returns:
        包含三种模式评估结果的字典，结构：
        {
            "query": str,
            "multi_turn_query": str,
            "expected_keywords": list[str],
            "modes": {
                "rag_with_reranker": {...},
                "rag_without_reranker": {...},
                "no_rag": {...},
            }
        }
        每个 mode 包含：chunks_count, top_score, avg_score, sources,
            retrieval_time_ms, rerank_time_ms, generation_time_ms, total_time_ms,
            answer_length, citation_count, answer, keyword_hits
    """
    keywords = expected_keywords or []
    multi_turn_query = await build_multi_turn_query(query, history or [])

    result = {
        "query": query,
        "multi_turn_query": multi_turn_query,
        "expected_keywords": keywords,
        "modes": {},
    }

    # ── 模式 1：RAG + 重排序 ─────────────────────────
    try:
        chunks, retrieval_time, rerank_time = await _retrieve_with_reranker(
            multi_turn_query, top_k=top_k
        )
        context, sources = await build_rag_context(chunks)
        prompt = await build_rag_prompt(query, context) if context else query
        answer, gen_time = await _generate_answer(prompt, history)

        result["modes"]["rag_with_reranker"] = _build_mode_result(
            chunks=chunks,
            sources=sources,
            answer=answer,
            retrieval_time=retrieval_time,
            rerank_time=rerank_time,
            gen_time=gen_time,
            keywords=keywords,
        )
    except Exception as e:
        logger.error(f"rag_with_reranker 评估失败: {e}", exc_info=True)
        result["modes"]["rag_with_reranker"] = {"error": str(e)}

    # ── 模式 2：RAG 无重排序 ─────────────────────────
    try:
        chunks, retrieval_time = await _vector_recall(multi_turn_query, top_k=top_k)
        context, sources = await build_rag_context(chunks)
        prompt = await build_rag_prompt(query, context) if context else query
        answer, gen_time = await _generate_answer(prompt, history)

        result["modes"]["rag_without_reranker"] = _build_mode_result(
            chunks=chunks,
            sources=sources,
            answer=answer,
            retrieval_time=retrieval_time,
            rerank_time=0.0,
            gen_time=gen_time,
            keywords=keywords,
        )
    except Exception as e:
        logger.error(f"rag_without_reranker 评估失败: {e}", exc_info=True)
        result["modes"]["rag_without_reranker"] = {"error": str(e)}

    # ── 模式 3：无 RAG（直接让模型回答） ─────────────────────────
    try:
        answer, gen_time = await _generate_answer(query, history)

        result["modes"]["no_rag"] = _build_mode_result(
            chunks=[],
            sources=[],
            answer=answer,
            retrieval_time=0.0,
            rerank_time=0.0,
            gen_time=gen_time,
            keywords=keywords,
        )
    except Exception as e:
        logger.error(f"no_rag 评估失败: {e}", exc_info=True)
        result["modes"]["no_rag"] = {"error": str(e)}

    return result


def _build_mode_result(
    chunks: list[dict],
    sources: list[dict],
    answer: str,
    retrieval_time: float,
    rerank_time: float,
    gen_time: float,
    keywords: list[str],
) -> dict:
    """构建单个模式的评估结果字典"""
    total_time = retrieval_time + rerank_time + gen_time
    scores = [c.get("score", 0.0) for c in chunks]
    return {
        "chunks_count": len(chunks),
        "top_score": round(scores[0], 4) if scores else 0.0,
        "avg_score": round(sum(scores) / len(scores), 4) if scores else 0.0,
        "sources": sources,
        "retrieval_time_ms": round(retrieval_time * 1000, 2),
        "rerank_time_ms": round(rerank_time * 1000, 2),
        "generation_time_ms": round(gen_time * 1000, 2),
        "total_time_ms": round(total_time * 1000, 2),
        "answer_length": len(answer),
        "citation_count": _count_citations(answer),
        "answer": answer,
        "keyword_hits": _count_keyword_hits(answer, keywords),
    }


async def evaluate_batch(queries: list[dict]) -> list[dict]:
    """
    批量评估多个查询

    Args:
        queries: 查询列表，每个元素格式：
            {"query": str, "expected_keywords": list[str], "history": list[dict]}
            其中 expected_keywords 和 history 可选

    Returns:
        评估结果列表
    """
    results = []
    total = len(queries)
    for i, q in enumerate(queries, 1):
        logger.info(f"评估进度: {i}/{total} - {q.get('query', '')[:50]}")
        result = await evaluate_single_query(
            query=q["query"],
            expected_keywords=q.get("expected_keywords"),
            history=q.get("history"),
        )
        results.append(result)
    return results


def print_evaluation_report(result: dict) -> None:
    """
    打印单个查询的评估报告，方便直接查看

    Args:
        result: evaluate_single_query 返回的结果
    """
    print("\n" + "=" * 90)
    print(f"查询: {result['query']}")
    print(f"多轮查询: {result['multi_turn_query']}")
    print(f"期望关键词: {result['expected_keywords']}")
    print("=" * 90)

    modes = result.get("modes", {})
    mode_names = ["rag_with_reranker", "rag_without_reranker", "no_rag"]
    mode_labels = ["RAG+重排序", "RAG无重排序", "无RAG"]

    # 指标对比表
    print(f"\n{'指标':<18} {'RAG+重排序':<18} {'RAG无重排序':<18} {'无RAG':<18}")
    print("-" * 90)

    def _get(mode_name, key, fmt=None):
        data = modes.get(mode_name, {})
        if "error" in data:
            return "ERROR"
        v = data.get(key, "-")
        if fmt and isinstance(v, (int, float)):
            return fmt.format(v)
        return str(v)

    rows = [
        ("召回数量", "chunks_count"),
        ("Top 分数", "top_score"),
        ("平均分数", "avg_score"),
        ("检索耗时(ms)", "retrieval_time_ms"),
        ("重排序耗时(ms)", "rerank_time_ms"),
        ("生成耗时(ms)", "generation_time_ms"),
        ("总耗时(ms)", "total_time_ms"),
        ("回答长度", "answer_length"),
        ("引用编号数", "citation_count"),
    ]
    for label, key in rows:
        print(
            f"{label:<18} "
            f"{_get(mode_names[0], key):<18} "
            f"{_get(mode_names[1], key):<18} "
            f"{_get(mode_names[2], key):<18}"
        )

    # 关键词命中
    print(f"{'关键词命中':<18}", end="")
    for mn in mode_names:
        data = modes.get(mn, {})
        if "error" in data:
            print(f"{'ERROR':<18}", end="")
        else:
            h = data.get("keyword_hits", {})
            print(f"{h.get('hit_count', 0)}/{h.get('total', 0)}".ljust(18), end="")
    print()
    print(f"{'命中率':<18}", end="")
    for mn in mode_names:
        data = modes.get(mn, {})
        if "error" in data:
            print(f"{'ERROR':<18}", end="")
        else:
            h = data.get("keyword_hits", {})
            print(f"{h.get('hit_rate', 0):.2%}".ljust(18), end="")
    print()

    # 各模式回答内容（截断显示）
    for mn, ml in zip(mode_names, mode_labels):
        data = modes.get(mn, {})
        print(f"\n--- {ml} 回答 ---")
        if "error" in data:
            print(f"[错误] {data['error']}")
        else:
            answer = data.get("answer", "")
            display = answer if len(answer) <= 400 else answer[:400] + "..."
            print(display)

    print("\n" + "=" * 90 + "\n")


def print_batch_summary(results: list[dict]) -> None:
    """
    打印批量评估的汇总报告

    Args:
        results: evaluate_batch 返回的结果列表
    """
    print("\n" + "#" * 90)
    print("# 批量评估汇总")
    print("#" * 90)

    mode_names = ["rag_with_reranker", "rag_without_reranker", "no_rag"]
    mode_labels = ["RAG+重排序", "RAG无重排序", "无RAG"]

    for mn, ml in zip(mode_names, mode_labels):
        valid = [
            r["modes"][mn]
            for r in results
            if mn in r.get("modes", {}) and "error" not in r["modes"][mn]
        ]
        if not valid:
            print(f"\n--- {ml}: 无有效数据 ---")
            continue

        n = len(valid)
        avg = lambda key: sum(r.get(key, 0) for r in valid) / n
        avg_hit = sum(
            r.get("keyword_hits", {}).get("hit_rate", 0) for r in valid
        ) / n

        print(f"\n--- {ml} ({n} 个查询) ---")
        print(f"  平均召回数量:     {avg('chunks_count'):.2f}")
        print(f"  平均检索耗时:     {avg('retrieval_time_ms'):.2f} ms")
        print(f"  平均重排序耗时:   {avg('rerank_time_ms'):.2f} ms")
        print(f"  平均生成耗时:     {avg('generation_time_ms'):.2f} ms")
        print(f"  平均总耗时:       {avg('total_time_ms'):.2f} ms")
        print(f"  平均回答长度:     {avg('answer_length'):.0f} 字符")
        print(f"  平均引用编号数:   {avg('citation_count'):.2f}")
        print(f"  平均关键词命中率: {avg_hit:.2%}")

    print("\n" + "#" * 90 + "\n")


# ── 示例：直接运行本模块即可查看评估结果 ──────────────────────────────
async def _demo():
    """示例：用一组测试查询对比三种模式"""
    test_queries = [
        {
            "query": "博客里有哪些关于 Vue 的文章？",
            "expected_keywords": ["Vue"],
        },
        {
            "query": "RAG 是什么？有什么用？",
            "expected_keywords": ["RAG", "检索"],
        },
        {
            "query": "项目用到了哪些技术栈？",
            "expected_keywords": [],
        },
    ]

    results = await evaluate_batch(test_queries)

    for r in results:
        print_evaluation_report(r)

    print_batch_summary(results)


if __name__ == "__main__":
    logging.basicConfig(level=logging.WARNING)  # 减少其他日志干扰，只看评估输出
    asyncio.run(_demo())
