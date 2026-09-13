"""聊天流接口"""

import asyncio
import json
import logging
import traceback

from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse

from models.schemas import ChatRequest
from services.agent import run_agent_stream
from services.chat import (
    generate_conversation_title as _generate_conversation_title,
    get_history_messages as _get_history_messages,
    save_message as _save_message,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["chat"])


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """SSE 流式版本的聊天接口

    RAG 检索已封装为 Agent 的工具（tools/rag_tools.py），
    由模型自主决定是否检索以及检索关键词，这里只负责
    会话历史管理、流式转发和消息持久化。
    """
    async def event_generator():
        """SSE 事件生成器，逐步返回聊天回复"""
        try:
            logger.info(
                f"收到消息: conversation_id={request.conversation_id}, "
                f"message={request.message}"
            )
            # 获取历史消息（先于保存用户消息，避免当前消息被重复计入历史）
            history = await _get_history_messages(request.conversation_id, limit=20)

            # 首条消息时并行生成对话标题，不阻塞回复流；标题在流结束前推送
            title_task = None
            if not history:
                title_task = asyncio.create_task(
                    _generate_conversation_title(
                        request.conversation_id, request.message
                    )
                )

            # 流式调用 Agent
            full_reply = ""
            async for chunk in run_agent_stream(
                user_input=request.message,
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

            # 推送生成的标题（失败静默跳过，保留默认标题）
            if title_task is not None:
                title = await title_task
                if title:
                    yield {
                        "event": "title",
                        "data": json.dumps({"title": title}, ensure_ascii=False),
                    }

            # 发送完成事件
            yield {
                "event": "done",
                "data": json.dumps(
                    {"conversation_id": request.conversation_id},
                    ensure_ascii=False,
                ),
            }
        except Exception as e:
            # 中断时取消可能还在运行的标题生成任务
            if title_task is not None and not title_task.done():
                title_task.cancel()
            logger.error(f"Stream chat error: {e}\n{traceback.format_exc()}")
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)}, ensure_ascii=False),
            }
    #EventSourceResponse(event_generator())
    # 把 Python 异步生成器“包装”成一个符合 SSE 标准的长连接 HTTP 流式响应，
    # 让前端可以用 EventSource API 轻松、实时地接收 AI 逐字输出的内容。
    return EventSourceResponse(event_generator())
