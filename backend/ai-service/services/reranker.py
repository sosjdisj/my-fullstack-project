import asyncio
import logging

from sentence_transformers import CrossEncoder

import config

logger = logging.getLogger(__name__)

# 懒加载：模型首次调用时在独立线程中加载，避免 import 时同步加载
# 阻塞事件循环（首次可能触发联网检查，耗时数分钟）
reranker_model = None
_model_load_lock = asyncio.Lock()


def _load_model():
    global reranker_model
    if reranker_model is None:
        reranker_model = CrossEncoder(config.RERANKER_MODEL)
    return reranker_model


async def _get_model():
    async with _model_load_lock:
        return await asyncio.to_thread(_load_model)


async def rerank_candidates(
    query: str, candidates: list[dict], top_k: int = 5
) -> list[dict]:
    """
    对检索到的候选结果进行重排序

    Args:
        query: 用户查询文本
        candidates: 候选结果列表，每个元素包含 chunk 和 score
        top_k: 返回的顶部结果数量

    Returns:
        重排序后的候选结果列表，按分数降序排列
    """
    if not candidates:
        return []

    pairs = []
    for c in candidates:
        chunk = c.get("chunk", {})
        content = chunk.get("content", "")
        pairs.append((query, content))

    # predict 是 CPU 密集的同步调用，放到线程池执行，避免阻塞事件循环
    model = await _get_model()
    scores = await asyncio.to_thread(model.predict, pairs)

    results = []
    for i, candidate in enumerate(candidates):
        original_score = candidate.get("score", 0.0)
        reranker_score = float(scores[i])
        final_score = reranker_score * 0.7 + original_score * 0.3
        results.append({
            "chunk": candidate["chunk"],
            "score": final_score,
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_k]
