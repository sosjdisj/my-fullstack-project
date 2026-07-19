from langchain_ollama import OllamaEmbeddings
from redis import Redis
import json
import hashlib
import logging

import config

logger = logging.getLogger(__name__)

redis_client = Redis.from_url(config.REDIS_URL, decode_responses=True)

embeddings = OllamaEmbeddings(
    model=config.OLLAMA_EMBEDDING_MODEL,
    base_url=config.OLLAMA_BASE_URL,
)


def _cache_key(text: str) -> str:
    """生成文本嵌入的缓存键"""
    text_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
    return f"embedding:{text_hash}"


async def embed_text(text: str) -> list[float]:
    """
    将单个文本转换为嵌入向量

    Args:
        text: 要嵌入的文本内容

    Returns:
        文本的嵌入向量（浮点数列表）
    """
    cache_key = _cache_key(text)
    try:
        cached = redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
    except Exception as e:
        logger.warning(f"Redis cache read failed: {e}")

    result = await embeddings.aembed_query(text)

    try:
        redis_client.setex(cache_key, config.EMBEDDING_CACHE_TTL, json.dumps(result))
    except Exception as e:
        logger.warning(f"Redis cache write failed: {e}")

    return result


async def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    批量将多个文本转换为嵌入向量

    Args:
        texts: 要嵌入的文本列表

    Returns:
        嵌入向量列表，每个元素是对应文本的嵌入向量
    """
    results = []
    uncached_indices = []
    uncached_texts = []

    for i, text in enumerate(texts):
        cache_key = _cache_key(text)
        try:
            cached = redis_client.get(cache_key)
            if cached:
                results.append((i, json.loads(cached)))
                continue
        except Exception as e:
            logger.warning(f"Redis cache read failed: {e}")

        uncached_indices.append(i)
        uncached_texts.append(text)

    if uncached_texts:
        new_embeddings = await embeddings.aembed_documents(uncached_texts)
        for idx, (orig_i, text) in enumerate(zip(uncached_indices, uncached_texts)):
            emb = new_embeddings[idx]
            results.append((orig_i, emb))
            cache_key = _cache_key(text)
            try:
                redis_client.setex(cache_key, config.EMBEDDING_CACHE_TTL, json.dumps(emb))
            except Exception as e:
                logger.warning(f"Redis cache write failed: {e}")

    results.sort(key=lambda x: x[0])
    return [r[1] for r in results]


async def get_embedding_vector_size() -> int:
    """
    获取嵌入向量的维度大小

    Returns:
        嵌入向量的维度
    """
    vec = await embed_text("test")
    return len(vec)
