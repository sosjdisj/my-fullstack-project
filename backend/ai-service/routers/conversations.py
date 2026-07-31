"""对话管理接口"""

from typing import Optional

from fastapi import APIRouter

from services.chat import (
    create_conversation as _create_conversation,
    get_chat_history as _get_chat_history,
    get_conversations as _get_conversations,
)

router = APIRouter(prefix="/api/ai/conversations", tags=["conversations"])


@router.get("")
async def get_conversations(user_id: int):
    """获取用户的对话列表"""
    conversations = await _get_conversations(user_id)
    return {"data": {"conversations": conversations}}


@router.post("")
async def create_conversation(user_id: int, title: str = "新对话"):
    """创建新对话"""
    conversation = await _create_conversation(user_id, title)
    return {"data": conversation}


@router.get("/{conversation_id}/history")
async def get_history(
    conversation_id: str, size: int = 20, cursor: Optional[str] = None
):
    """获取对话历史消息（分页）"""
    result = await _get_chat_history(conversation_id, size, cursor)
    return {"data": result}
