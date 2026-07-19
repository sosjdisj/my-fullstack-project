from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from typing import Optional

from models.schemas import (
    ChatRequest,
    Conversation,
    HistoryResponse,
    KnowledgeRebuildResponse,
)
from services.chat import (
    get_conversations as _get_conversations,
    create_conversation as _create_conversation,
    save_message as _save_message,
    get_history_messages as _get_history_messages,
    get_chat_history as _get_chat_history,
)
from services.rag import (
    retrieve_relevant_chunks,
    build_rag_context,
    build_rag_prompt,
    build_multi_turn_query,
)
from services.agent import run_agent_stream
from services.article_chunk import init_rag_knowledge_base, rebuild_all_chunks

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
        logger.warning(f"RAG knowledge base initialization failed: {e}. Service will start without pre-loaded knowledge.")
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



@app.post("/api/ai/chat/stream")
async def chat_stream(request: ChatRequest):
    """SSE 流式版本的聊天接口"""
    from sse_starlette.sse import EventSourceResponse
    import json

    async def event_generator():
        """SSE 事件生成器，逐步返回聊天回复"""
        try:
            logger.info(f"收到消息: conversation_id={request.conversation_id}, message={request.message}")
            await _save_message(request.conversation_id, "user", request.message)
            # 获取历史消息
            history = await _get_history_messages(request.conversation_id, limit=20)

            # RAG 检索：召回知识库相关内容作为参考资料
            multi_turn_query = await build_multi_turn_query(request.message, history)
            chunks = await retrieve_relevant_chunks(multi_turn_query, top_k=5)
            context, sources = await build_rag_context(chunks)

            # 构建给 Agent 的输入：
            # - 用户原话始终保留在显眼位置，确保模型理解真实意图
            # - RAG 上下文作为补充资料，并明确告诉模型如何使用
            # - 如果 RAG 召回的内容与用户问题无关，模型应忽略它并调用工具
            if context:
                user_input = f"""用户问题：{request.message}

知识库参考资料（仅当与用户问题相关时参考，如果无关请忽略并直接调用工具查询）：
{context}"""
            else:
                user_input = request.message

            # 流式调用 Agent
            full_reply = ""
            async for chunk in run_agent_stream(
                user_input=user_input,
                chat_history=history,
                token=request.token,
            ):
                full_reply += chunk
                yield {"event": "token", "data": json.dumps({"token": chunk}, ensure_ascii=False)}

            # 只有 Agent 成功后才保存 AI 回复
            await _save_message(request.conversation_id, "assistant", full_reply)

            # 发送完成事件
            yield {
                "event": "done",
                "data": json.dumps(
                    {
                        "conversation_id": request.conversation_id,
                        "sources": sources,
                    },
                    ensure_ascii=False,
                ),
            }
        except Exception as e:
            import traceback
            logger.error(f"Stream chat error: {e}\n{traceback.format_exc()}")
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)}, ensure_ascii=False),
            }

    return EventSourceResponse(event_generator())


@app.get("/api/ai/conversations")
async def get_conversations(user_id: int):
    """获取用户的对话列表"""
    conversations = await _get_conversations(user_id)
    return {"data": {"conversations": conversations}}


@app.post("/api/ai/conversations")
async def create_conversation(user_id: int, title: str = "新对话"):
    """创建新对话"""
    conversation = await _create_conversation(user_id, title)
    return {"data": conversation}


@app.get("/api/ai/conversations/{conversation_id}/history")
async def get_history(
    conversation_id: str, size: int = 20, cursor: Optional[str] = None
):
    """获取对话历史消息（分页）"""
    result = await _get_chat_history(conversation_id, size, cursor)
    return {"data": result}


@app.post("/api/ai/knowledge/rebuild", response_model=KnowledgeRebuildResponse)
async def rebuild_knowledge():
    """重建 RAG 知识库"""
    try:
        total = await rebuild_all_chunks()
        return KnowledgeRebuildResponse(
            success=True,
            message=f"知识库重建完成",
            chunks_count=total,
        )
    except Exception as e:
        logger.error(f"Knowledge rebuild error: {e}")
        return KnowledgeRebuildResponse(
            success=False,
            message=f"知识库重建失败: {str(e)}",
            chunks_count=0,
        )


@app.get("/api/ai/health")
async def health_check():
    """健康检查"""
    return {"status": "ok", "service": "ai-service"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
