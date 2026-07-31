import logging
from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

import config

logger = logging.getLogger(__name__)

mongo_client: Optional[AsyncIOMotorClient] = None


def _get_mongo_db():
    """获取 MongoDB 数据库连接实例"""
    global mongo_client
    if mongo_client is None:
        mongo_client = AsyncIOMotorClient(config.MONGODB_URI)
    db_name = config.MONGODB_URI.split("/")[-1].split("?")[0]
    return mongo_client[db_name]


async def get_conversations(user_id: int) -> list[dict]:
    """
    获取用户的所有对话列表

    Args:
        user_id: 用户 ID

    Returns:
        对话列表，按更新时间降序排列
    """
    db = _get_mongo_db()
    conversations = []
    cursor = db.conversations.find({"userId": user_id}).sort("updatedAt", -1)
    async for conv in cursor:
        conv["id"] = str(conv.pop("_id"))
        conversations.append(conv)
    return conversations


async def create_conversation(user_id: int, title: str = "新对话") -> dict:
    """
    创建新的对话

    Args:
        user_id: 用户 ID
        title: 对话标题

    Returns:
        创建的对话信息，包含 id、userId、title、createdAt、updatedAt
    """
    db = _get_mongo_db()
    now = datetime.now(timezone.utc)
    doc = {
        "userId": user_id,
        "title": title,
        "createdAt": now,
        "updatedAt": now,
    }
    result = await db.conversations.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return doc


async def save_message(conversation_id: str, role: str, content: str) -> dict:
    """
    保存消息到数据库

    Args:
        conversation_id: 对话 ID
        role: 消息角色（user 或 assistant）
        content: 消息内容

    Returns:
        保存的消息信息，包含 id、conversation_id、role、content、created_at
    """
    db = _get_mongo_db()
    now = datetime.now(timezone.utc)
    doc = {
        "conversationId": ObjectId(conversation_id),
        "role": role,
        "content": content,
        "createdAt": now,
    }
    result = await db.ai_messages.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc["conversationId"] = conversation_id

    try:
        await db.conversations.update_one(
            {"_id": ObjectId(conversation_id)},
            {"$set": {"updatedAt": now}},
        )
    except Exception as e:
        logger.warning(f"Failed to update conversation timestamp: {e}")

    return doc


async def get_history_messages(
    conversation_id: str, limit: int = 20
) -> list[dict]:
    """
    获取对话的历史消息

    Args:
        conversation_id: 对话 ID
        limit: 返回的消息数量限制

    Returns:
        消息列表，按时间升序排列
    """
    db = _get_mongo_db()
    messages = []
    cursor = db.ai_messages.find(
        {"conversationId": ObjectId(conversation_id)}
    ).sort("createdAt", -1).limit(limit)

    async for msg in cursor:
        msg["id"] = str(msg.pop("_id"))
        msg["conversationId"] = str(msg["conversationId"])
        messages.append(msg)

    messages.reverse()
    return messages


async def get_chat_history(
    conversation_id: str, size: int = 20, cursor: Optional[str] = None
) -> dict:
    """
    获取对话历史消息（支持分页）

    Args:
        conversation_id: 对话 ID
        size: 每页消息数量
        cursor: 分页游标（消息 ID）

    Returns:
        包含 messages、next_cursor、has_more 的字典
    """
    db = _get_mongo_db()

    query = {"conversationId": ObjectId(conversation_id)}
    if cursor:
        try:
            cursor_time = await db.ai_messages.find_one({"_id": ObjectId(cursor)})
            if cursor_time:
                query["createdAt"] = {"$lt": cursor_time["createdAt"]}
        except Exception:
            pass

    messages = []
    msg_cursor = db.ai_messages.find(query).sort("createdAt", -1).limit(size + 1)

    async for msg in msg_cursor:
        msg["id"] = str(msg.pop("_id"))
        msg["conversationId"] = str(msg["conversationId"])
        messages.append(msg)

    has_more = len(messages) > size
    if has_more:
        messages = messages[:size]

    next_cursor = None
    if has_more and messages:
        next_cursor = messages[-1]["id"]

    messages.reverse()

    return {
        "messages": messages,
        "next_cursor": next_cursor,
        "has_more": has_more,
    }
