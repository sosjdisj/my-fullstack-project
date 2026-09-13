import logging
from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from langchain_openai import ChatOpenAI
from motor.motor_asyncio import AsyncIOMotorClient

import config

logger = logging.getLogger(__name__)

# 标题生成提示词：要求简短、与提问同语言、不输出多余内容
_TITLE_PROMPT = (
    "请根据用户的提问生成一个简短的对话标题，要求：\n"
    "- 不超过 15 个字\n"
    "- 使用与提问相同的语言\n"
    "- 直接输出标题本身，不要任何引号、前缀或解释\n\n"
    "用户提问：{message}"
)

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


async def generate_conversation_title(conversation_id: str, message: str) -> Optional[str]:
    """
    调用 LLM 根据用户首条消息生成对话标题，并更新会话标题

    Args:
        conversation_id: 对话 ID
        message: 用户首条消息内容

    Returns:
        生成的标题；生成失败时返回 None（保留默认标题）
    """
    try:
        llm = ChatOpenAI(
            model=config.LLM_CHAT_MODEL,
            base_url=config.LLM_BASE_URL,
            api_key=config.LLM_API_KEY,
            temperature=0.3,
            max_tokens=30,
            streaming=False,
        )
        resp = await llm.ainvoke(_TITLE_PROMPT.format(message=message[:200]))
        title = str(resp.content).strip().strip('"“”').strip()
        if not title:
            return None
        # 兜底截断，避免模型不守规矩输出过长标题
        title = title[:20]

        db = _get_mongo_db()
        await db.conversations.update_one(
            {"_id": ObjectId(conversation_id)},
            {"$set": {"title": title}},
        )
        return title
    except Exception as e:
        logger.warning(f"生成对话标题失败: {e}")
        return None


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
