import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(conversations_router)
app.include_router(system_router)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
