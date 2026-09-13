import asyncio
import hashlib
import json
import logging

from redis import Redis
from sentence_transformers import SentenceTransformer

import config

logger = logging.getLogger(__name__)

redis_client = Redis.from_url(config.REDIS_URL, decode_responses=True)

# 懒加载：模型首次调用时在独立线程中加载，避免 import 时同步加载
# 阻塞事件循环，也让服务重启更快
embedding_model = None
_model_load_lock = asyncio.Lock()


def _load_model():
    global embedding_model
    if embedding_model is None:
        embedding_model = SentenceTransformer(config.EMBEDDING_MODEL)
    return embedding_model


async def _get_model():
    async with _model_load_lock:
        return await asyncio.to_thread(_load_model)


def _cache_key(text: str) -> str:
    """生成文本嵌入的缓存键"""
    text_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
    return f"embedding:{text_hash}"


async def embed_text(text: str) -> list[float]:
    """
    将单个文本转换为嵌入向量（查询侧，带 query prompt）

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

    # encode 是 CPU 密集的同步调用，放线程池执行，避免阻塞事件循环
    model = await _get_model()
    result = (await asyncio.to_thread(model.encode, text, prompt_name="query")).tolist()

    try:
        redis_client.setex(cache_key, config.EMBEDDING_CACHE_TTL, json.dumps(result))
    except Exception as e:
        logger.warning(f"Redis cache write failed: {e}")

    return result


async def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    批量将多个文本转换为嵌入向量（文档侧，带 document prompt）

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
        # encode 是 CPU 密集的同步调用，放线程池执行，避免阻塞事件循环
        model = await _get_model()
        new_embeddings = await asyncio.to_thread(
            model.encode, uncached_texts, prompt_name="document"
        )
        for idx, (orig_i, text) in enumerate(zip(uncached_indices, uncached_texts)):
            emb = new_embeddings[idx].tolist()
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
