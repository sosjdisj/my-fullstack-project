import logging
import re
from typing import Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    FilterSelector,
    MatchValue,
    PayloadSchemaType,
    PointStruct,
    VectorParams,
)

import config
from services.embedding import embed_texts, get_embedding_vector_size

logger = logging.getLogger(__name__)

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


def split_by_fixed_window(
    content: str, window_size: int = None, overlap: int = None
) -> list[dict]:
    """
    使用固定窗口大小分割文本内容

    Args:
        content: 要分割的文本内容
        window_size: 窗口大小（字符数）
        overlap: 窗口重叠大小（字符数）

    Returns:
        分割后的文本块列表，每个元素包含 content、heading 和 chunk_index
    """
    window_size = window_size or config.CHUNK_WINDOW_SIZE
    overlap = overlap or config.CHUNK_OVERLAP

    if not content or len(content) <= window_size:
        return [{"content": content, "heading": "", "chunk_index": 0}]

    chunks = []
    start = 0
    chunk_index = 0
    while start < len(content):
        end = start + window_size
        chunk_content = content[start:end]
        chunks.append({
            "content": chunk_content,
            "heading": "",
            "chunk_index": chunk_index,
        })
        chunk_index += 1
        start = end - overlap

    return chunks


def split_by_markdown_headings(content: str) -> list[dict]:
    """
    根据 Markdown 标题分割文本内容

    Args:
        content: 要分割的 Markdown 格式文本

    Returns:
        分割后的文本块列表，每个元素包含 content、heading 和 chunk_index
    """
    heading_pattern = re.compile(r"^(#{1,6})\s+(.+)$", re.MULTILINE)
    splits = list(heading_pattern.finditer(content))

    if not splits:
        return split_by_fixed_window(content)

    chunks = []
    chunk_index = 0

    for i, match in enumerate(splits):
        heading = match.group(2).strip()
        start = match.start()
        end = splits[i + 1].start() if i + 1 < len(splits) else len(content)
        section_content = content[start:end].strip()

        if len(section_content) > config.CHUNK_WINDOW_SIZE:
            sub_chunks = split_by_fixed_window(
                section_content, config.CHUNK_WINDOW_SIZE, config.CHUNK_OVERLAP
            )
            for sub in sub_chunks:
                sub["heading"] = heading
                sub["chunk_index"] = chunk_index
                chunks.append(sub)
                chunk_index += 1
        else:
            chunks.append({
                "content": section_content,
                "heading": heading,
                "chunk_index": chunk_index,
            })
            chunk_index += 1

    return chunks


def split_article(article: dict) -> list[dict]:
    """
    将文章内容分割成多个文本块

    Args:
        article: 文章字典，包含 content、_id、title 等字段

    Returns:
        分割后的文本块列表
    """
    content = article.get("content", "")
    if not content:
        return []

    markdown_headings = re.compile(r"^#{1,6}\s+", re.MULTILINE)
    if markdown_headings.search(content):
        chunks = split_by_markdown_headings(content)
    else:
        chunks = split_by_fixed_window(content)

    article_id = str(article.get("_id", ""))
    article_title = article.get("title", "")

    for chunk in chunks:
        chunk["article_id"] = article_id
        chunk["article_title"] = article_title

    return chunks


async def rebuild_chunks_for_article(article_id: str) -> int:
    """
    重建指定文章的文本块索引

    Args:
        article_id: 文章 ID

    Returns:
        成功索引的文本块数量
    """
    db = _get_mongo_db()
    try:
        oid = ObjectId(article_id)
    except Exception:
        oid = article_id

    article = await db.articles.find_one({"_id": oid})
    if not article:
        logger.warning(f"Article not found: {article_id}")
        return 0

    chunks = split_article(article)
    if not chunks:
        return 0

    qdrant_client.delete(
        collection_name=config.QDRANT_COLLECTION,
        points_selector=FilterSelector(
            filter=Filter(
                must=[
                    FieldCondition(
                        key="article_id",
                        match=MatchValue(value=article_id)
                    )
                ]
            )
        ),
    )

    texts = [c["content"] for c in chunks]
    vectors = await embed_texts(texts)

    points = []
    for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
        point_id = hash(f"{article_id}:{i}") & 0x7FFFFFFFFFFFFFFF
        points.append(PointStruct(
            id=point_id,
            vector=vector,
            payload={
                "article_id": article_id,
                "article_title": chunk.get("article_title", ""),
                "content": chunk["content"],
                "heading": chunk.get("heading", ""),
                "chunk_index": chunk.get("chunk_index", i),
            },
        ))

    qdrant_client.upsert(
        collection_name=config.QDRANT_COLLECTION,
        points=points,
    )

    return len(points)


async def rebuild_all_chunks() -> int:
    """
    重建所有文章的文本块索引

    Returns:
        成功索引的文本块总数
    """
    db = _get_mongo_db()
    articles = db.articles.find({})
    total = 0
    async for article in articles:
        article_id = str(article["_id"])
        count = await rebuild_chunks_for_article(article_id)
        total += count
        logger.info(f"Rebuilt {count} chunks for article {article_id}")
    return total


async def init_rag_knowledge_base():
    """
    初始化 RAG 知识库，创建向量集合并索引所有文章

    Returns:
        索引的文本块总数
    """
    try:
        vector_size = await get_embedding_vector_size()
    except Exception as e:
        logger.error(f"Failed to get embedding vector size: {e}")
        vector_size = 768

    collections = qdrant_client.get_collections().collections
    collection_names = [c.name for c in collections]

    if config.QDRANT_COLLECTION not in collection_names:
        qdrant_client.create_collection(
            collection_name=config.QDRANT_COLLECTION,
            vectors_config=VectorParams(
                size=vector_size,
                distance=Distance.COSINE,
            ),
        )
        logger.info(f"Created Qdrant collection: {config.QDRANT_COLLECTION} with vector size {vector_size}")
    else:
        logger.info(f"Qdrant collection already exists: {config.QDRANT_COLLECTION}")

    # 创建 payload 索引以支持按 article_id 过滤
    try:
        qdrant_client.create_payload_index(
            collection_name=config.QDRANT_COLLECTION,
            field_name="article_id",
            field_schema=PayloadSchemaType.KEYWORD,
        )
        logger.info("Created payload index for article_id")
    except Exception as e:
        logger.warning(f"Payload index creation skipped: {e}")

    total = await rebuild_all_chunks()
    logger.info(f"Knowledge base initialized with {total} chunks")
    return total
