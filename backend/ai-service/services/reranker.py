import logging

from sentence_transformers import CrossEncoder

import config

logger = logging.getLogger(__name__)

reranker_model = CrossEncoder(config.RERANKER_MODEL)


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

    scores = reranker_model.predict(pairs)

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
