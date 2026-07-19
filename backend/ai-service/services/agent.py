from langchain_ollama import ChatOllama
from langchain.agents import create_agent
from langchain_core.messages import AIMessage, HumanMessage, BaseMessage
import logging

import config
from tools.article_tools import article_tools
from tools.songs_tools import songs_tools
from tools.playlists_tools import playlists_tools
from tools.tags_tools import tags_tools
from tools.categories_tools import categories_tools
from tools.timeline_tools import timeline_tools
from tools.treehole_tools import treehole_tools
from tools.quotes_tools import quotes_tools
from tools.interaction_tools import interaction_tools

logger = logging.getLogger(__name__)

all_tools = (
    article_tools
    + songs_tools
    + playlists_tools
    + tags_tools
    + categories_tools
    + timeline_tools
    + treehole_tools
    + quotes_tools
    + interaction_tools
)

llm = ChatOllama(
    model=config.OLLAMA_CHAT_MODEL,
    base_url=config.OLLAMA_BASE_URL,
    temperature=0.7,
)

SYSTEM_PROMPT = """你是一个友好、活泼的博客 AI 助手，可以用工具帮用户查文章、找音乐、看标签、刷歌单等。说话要自然亲切，像朋友聊天一样，可以加语气词和表情，让对话有温度。

回答规则：
1. 涉及博客内容（文章、歌曲、标签、歌单等）时，记得调用工具查数据库，不要凭记忆编造哦。
2. 工具返回了数据就要完整列出来，别只说"找到了"却不告诉用户具体有哪些。
3. 工具没找到结果就诚实说"暂时没有找到"，别自己编。
4. 返回的 JSON 别直接贴，整理成自然的话说给用户听，关键信息（标题、名称等）要列全。
5. 用户聊闲天、问通用知识、写代码之类的，不用调工具，直接聊就行。
6. 信息不够就大方说"这个我也不太确定"，别硬编。"""

agent_executor = create_agent(
    model=llm,
    tools=all_tools,
    system_prompt=SYSTEM_PROMPT,
)


def _convert_history(messages: list[dict]) -> list[BaseMessage]:
    """将消息字典列表转换为 LangChain 消息对象列表"""
    result = []
    for msg in messages:
        role = msg.get("role", "")
        content = msg.get("content", "")
        if role == "user":
            result.append(HumanMessage(content=content))
        elif role == "assistant":
            result.append(AIMessage(content=content))
    return result


def _extract_output(messages: list[BaseMessage]) -> str:
    """从消息列表中提取最后一条 AI 回复内容"""
    for msg in reversed(messages):
        if isinstance(msg, AIMessage) and msg.content:
            return msg.content
    return "抱歉，我无法处理您的请求。"


async def run_agent(
    user_input: str,
    chat_history: list[dict] = None,
    token: str = "",
) -> str:
    """
    运行 AI Agent 处理用户输入并返回回复

    Args:
        user_input: 用户输入内容
        chat_history: 对话历史消息列表
        token: 用户认证令牌

    Returns:
        AI 的回复内容

    Raises:
        Exception: Agent 执行失败时抛出
    """
    history_messages = _convert_history(chat_history or [])
    messages = history_messages + [HumanMessage(content=user_input)]

    result = await agent_executor.ainvoke({"messages": messages})
    return _extract_output(result["messages"])


async def run_agent_stream(
    user_input: str,
    chat_history: list[dict] = None,
    token: str = "",
):
    """
    以流式方式运行 AI Agent，逐步返回回复内容

    Args:
        user_input: 用户输入内容
        chat_history: 对话历史消息列表
        token: 用户认证令牌

    Yields:
        AI 回复的文本片段

    Raises:
        Exception: Agent 执行失败时抛出
    """
    history_messages = _convert_history(chat_history or [])
    messages = history_messages + [HumanMessage(content=user_input)]

    async for event in agent_executor.astream_events(
        {"messages": messages},
        version="v2",
    ):
        kind = event.get("event", "")
        if kind == "on_chat_model_stream":
            data = event.get("data", {})
            # 确保 data 是 dict 类型
            if isinstance(data, dict):
                chunk = data.get("chunk")
                if chunk and hasattr(chunk, "content") and chunk.content:
                    yield chunk.content