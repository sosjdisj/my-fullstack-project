"""聊天流接口"""

import json
import logging
import traceback

from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse

from models.schemas import ChatRequest
from services.agent import run_agent_stream
from services.chat import (
    get_history_messages as _get_history_messages,
    save_message as _save_message,
)
from services.rag import (
    build_multi_turn_query,
    build_rag_context,
    retrieve_relevant_chunks,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["chat"])

# 不需要 RAG 检索的查询模式：
# - 纯问候/闲聊（你好、谢谢、你是谁）
# - 明确的工具操作指令（点赞、收藏、取消）
# - 过短的消息（<3 字符）
# 这些场景跑向量检索纯属浪费，直接交给 Agent 即可
_RAG_SKIP_KEYWORDS = (
    "你好", "您好", "嗨", "hello", "hi", "hey",
    "谢谢", "感谢", "thanks", "thank you",
    "你是谁", "你叫什么", "自我介绍",
    "再见", "拜拜", "bye",
    "点赞", "取消点赞", "收藏", "取消收藏",  # 操作类，Agent 直接调工具
)


def _should_use_rag(message: str) -> bool:
    """判断当前消息是否需要走 RAG 检索

    对问候、闲聊、纯操作类指令跳过检索，避免无意义的
    embedding + Qdrant + reranker 开销。
    其余查询默认走 RAG，保留知识库召回能力。
    """
    msg = message.strip().lower()
    if len(msg) < 3:
        return False
    for kw in _RAG_SKIP_KEYWORDS:
        if kw in msg:
            return False
    return True


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """SSE 流式版本的聊天接口"""
    async def event_generator():
        """SSE 事件生成器，逐步返回聊天回复"""
        try:
            logger.info(
                f"收到消息: conversation_id={request.conversation_id}, "
                f"message={request.message}"
            )
            # 获取历史消息（先于保存用户消息，避免当前消息被重复计入历史）
            history = await _get_history_messages(request.conversation_id, limit=20)

            # RAG 检索：仅对可能涉及知识库内容的查询执行检索，
            # 问候/闲聊/纯操作类指令直接跳过，节省 embedding + Qdrant + reranker 开销
            if _should_use_rag(request.message):
                multi_turn_query = await build_multi_turn_query(request.message, history)
                chunks = await retrieve_relevant_chunks(multi_turn_query, top_k=5)
                context, sources = await build_rag_context(chunks)
            else:
                context, sources = "", []
                logger.info(
                    f"Skip RAG for message (greeting/operation): "
                    f"{request.message[:30]}"
                )

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
                yield {
                    "event": "token",
                    "data": json.dumps({"token": chunk}, ensure_ascii=False),
                }

            # Agent 成功后才保存用户消息和 AI 回复
            await _save_message(request.conversation_id, "user", request.message)
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
            logger.error(f"Stream chat error: {e}\n{traceback.format_exc()}")
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)}, ensure_ascii=False),
            }

    return EventSourceResponse(event_generator())
