"""系统管理接口：知识库重建、健康检查"""

import logging

from fastapi import APIRouter

from models.schemas import KnowledgeRebuildResponse
from services.article_chunk import rebuild_all_chunks

logger = logging.getLogger(__name__)

router = APIRouter(tags=["system"])


@router.post("/api/ai/knowledge/rebuild", response_model=KnowledgeRebuildResponse)
async def rebuild_knowledge():
    """重建 RAG 知识库"""
    try:
        total = await rebuild_all_chunks()
        return KnowledgeRebuildResponse(
            success=True,
            message="知识库重建完成",
            chunks_count=total,
        )
    except Exception as e:
        logger.error(f"Knowledge rebuild error: {e}")
        return KnowledgeRebuildResponse(
            success=False,
            message=f"知识库重建失败: {str(e)}",
            chunks_count=0,
        )


@router.get("/api/ai/health")
async def health_check():
    """健康检查"""
    return {"status": "ok", "service": "ai-service"}
