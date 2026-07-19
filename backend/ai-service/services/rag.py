from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue
from redis import Redis
from motor.motor_asyncio import AsyncIOMotorClient
import json
import hashlib
import logging
from typing import Optional

import config
from services.embedding import embed_text
from services.reranker import rerank_candidates

logger = logging.getLogger(__name__)

redis_client = Redis.from_url(config.REDIS_URL, decode_responses=True)
qdrant_client = QdrantClient(
    url=config.QDRANT_URL,
    api_key=config.QDRANT_API_KEY,
    check_compatibility=False,
    )

mongo_client: Optional[AsyncIOMotorClient] = None


def _get_mongo_db():
    """获取 MongoDB 数据库连接实例"""
    global mongo_client
    if mongo_client is None:
        mongo_client = AsyncIOMotorClient(config.MONGODB_URI)
    db_name = config.MONGODB_URI.split("/")[-1].split("?")[0]
    return mongo_client[db_name]


def _rag_cache_key(query: str, top_k: int) -> str:
    """生成 RAG 查询结果的缓存键"""
    text_hash = hashlib.sha256(query.encode("utf-8")).hexdigest()
    return f"rag:{text_hash}:{top_k}"


async def retrieve_relevant_chunks(
    query: str, top_k: int = 5, threshold: float = 0.5
) -> list[dict]:
    """
    检索与查询相关的文档块

    Args:
        query: 用户查询文本
        top_k: 返回的顶部结果数量
        threshold: 向量检索相似度阈值，低于此值的结果将被过滤（0.5 较严格，避免召回无关内容）

    Returns:
        相关文档块列表，每个元素包含 chunk 信息和 score
    """
    cache_key = _rag_cache_key(query, top_k)
    try:
        cached = redis_client.get(cache_key)
        if cached:
            cached_result = json.loads(cached)
            # 校验缓存格式：应为 list[dict]，每个 item 含 "chunk" 键
            if isinstance(cached_result, list) and all(isinstance(item, dict) and "chunk" in item for item in cached_result):
                return cached_result
            else:
                logger.warning("RAG cache format invalid, skipping cache")
    except Exception as e:
        logger.warning(f"RAG Redis cache read failed: {e}")

    query_vector = await embed_text(query)

    search_results = qdrant_client.query_points(
        collection_name=config.QDRANT_COLLECTION,
        query=query_vector,
        limit=top_k * 3,
        score_threshold=threshold,
    ).points

    if not search_results:
        return []

    db = _get_mongo_db()
    candidates = []
    for result in search_results:
        payload = result.payload or {}
        # 防护：payload 必须是 dict
        if not isinstance(payload, dict):
            payload = {}
        article_id = payload.get("article_id")
        chunk_index = payload.get("chunk_index", 0)

        if article_id:
            article = await db.articles.find_one({"_id": article_id})
            if article:
                chunk = {
                    "article_id": str(article["_id"]),
                    "article_title": article.get("title", ""),
                    "content": payload.get("content", ""),
                    "chunk_index": chunk_index,
                    "heading": payload.get("heading", ""),
                }
                candidates.append({
                    "chunk": chunk,
                    "score": result.score,
                })

    if not candidates:
        return []

    reranked = await rerank_candidates(query, candidates, top_k=top_k)

    # reranker 二次过滤：融合分数低于 0.3 的认为不相关，直接丢弃
    # reranker 分数范围通常在 0-1 之间，0.3 是经验阈值
    filtered = [r for r in reranked if r.get("score", 0.0) >= 0.3]
    if not filtered:
        logger.info(f"RAG: all candidates filtered out by reranker threshold (query: {query[:50]})")

    try:
        redis_client.setex(
            cache_key, config.RAG_CACHE_TTL, json.dumps(filtered, ensure_ascii=False)
        )
    except Exception as e:
        logger.warning(f"RAG Redis cache write failed: {e}")

    return filtered


async def build_rag_context(chunks: list[dict]) -> tuple[str, list[dict]]:
    """
    根据检索到的文档块构建上下文字符串和来源列表

    Args:
        chunks: 检索到的文档块列表

    Returns:
        元组，包含上下文字符串和来源信息列表
    """
    if not chunks:
        return "", []

    context_parts = []
    sources = []
    for i, item in enumerate(chunks):
        chunk = item.get("chunk", {})
        article_title = chunk.get("article_title", "未知文章")
        content = chunk.get("content", "")
        heading = chunk.get("heading", "")

        section_label = f"[{i + 1}] {article_title}"
        if heading:
            section_label += f" - {heading}"

        context_parts.append(f"{section_label}\n{content}")

        sources.append({
            "article_id": chunk.get("article_id", ""),
            "article_title": article_title,
            "heading": heading,
            "score": item.get("score", 0.0),
        })

    context = "\n\n---\n\n".join(context_parts)
    return context, sources


async def build_rag_prompt(query: str, context: str) -> str:
    """
    构建包含上下文的 RAG 提示词

    Args:
        query: 用户问题
        context: 检索到的上下文内容

    Returns:
        完整的 RAG 提示词
    """
    prompt = f"""基于以下参考资料回答用户的问题。如果参考资料中没有相关信息，请根据你的知识回答，但要说明这不是来自知识库的信息。

参考资料：
{context}

用户问题：{query}

请给出详细、准确的回答，并在适当的地方引用参考资料的编号（如 [1]、[2]）。"""
    return prompt


async def build_multi_turn_query(
    current_message: str, history_messages: list[dict]
) -> str:
    """
    根据对话历史构建多轮查询，用于 RAG 检索

    Args:
        current_message: 当前用户消息
        history_messages: 历史消息列表

    Returns:
        结合历史上下文的查询文本
    """
    if not history_messages:
        return current_message

    # 取最近 3 轮（6 条消息）的关键信息拼接到查询中
    history_parts = []
    for msg in history_messages[-6:]:
        role = msg.get("role", "")
        content = msg.get("content", "")
        # 只取用户消息的关键内容（截断过长的消息）
        if role == "user" and content:
            history_parts.append(content[:100])

    if history_parts:
        return " ".join(history_parts) + " " + current_message
    return current_message
