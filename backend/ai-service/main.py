import logging
import os
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from middleware.security import IpWhitelistMiddleware
from routers.chat import router as chat_router
from routers.conversations import router as conversations_router
from routers.system import router as system_router
from services.article_chunk import init_rag_knowledge_base

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI 应用生命周期管理，启动时初始化知识库，关闭时清理资源"""
    logger.info("AI Service starting up...")
    try:
        total = await init_rag_knowledge_base()
        logger.info(f"RAG knowledge base initialized with {total} chunks")
    except Exception as e:
        logger.warning(
            f"RAG knowledge base initialization failed: {e}. "
            "Service will start without pre-loaded knowledge."
        )
    yield
    logger.info("AI Service shutting down...")


app = FastAPI(
    title="AI Service",
    description="Python AI/Agent service providing RAG, chat, and tool-calling capabilities",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS：AI 服务仅供 Java 后端内部调用，来源固定为本地后端
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# IP 白名单：AI 服务仅供 Java 后端内部调用，仅允许回环地址；如需跨机部署通过 AI_SERVICE_ALLOWED_IPS 扩展
_extra_ips = os.getenv("AI_SERVICE_ALLOWED_IPS")
app.add_middleware(
    IpWhitelistMiddleware,
    allowed_ips=_extra_ips.split(",") if _extra_ips else None,
)

app.include_router(chat_router)
app.include_router(conversations_router)
app.include_router(system_router)


if __name__ == "__main__":
    # 默认仅监听回环地址，避免暴露到外网；如需对外可通过环境变量覆盖
    host = os.getenv("AI_SERVICE_HOST", "127.0.0.1")
    port = int(os.getenv("AI_SERVICE_PORT", "8000"))
    uvicorn.run(app, host=host, port=port)
