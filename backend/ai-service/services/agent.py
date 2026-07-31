import logging

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage

from services.react_agent import ReActAgent
from tools.article_tools import article_tools
from tools.categories_tools import categories_tools
from tools.interaction_tools import interaction_tools
from tools.playlists_tools import playlists_tools
from tools.quotes_tools import quotes_tools
from tools.songs_tools import songs_tools
from tools.tags_tools import tags_tools
from tools.timeline_tools import timeline_tools
from tools.treehole_tools import treehole_tools

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

# 工具按业务域分组，用于生成更清晰的 System Prompt
# 分组只影响提示词呈现，不改变工具的注册和调用逻辑
TOOL_GROUPS = [
    ("文章检索", article_tools),
    ("音乐与歌单", songs_tools + playlists_tools),
    ("标签与分类", tags_tools + categories_tools),
    ("社区动态", timeline_tools + treehole_tools + quotes_tools),
    ("用户互动（点赞/收藏，需登录）", interaction_tools),
]

# 使用 ReAct Agent 替代原来的 create_agent
react_agent = ReActAgent(tools=all_tools, tool_groups=TOOL_GROUPS)


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


async def run_agent_stream(
    user_input: str,
    chat_history: list[dict] = None,
    token: str = "",
):
    """
    以流式方式运行 ReAct Agent，逐步返回回复内容

    思考和工具调用阶段不输出，只在最终答案阶段流式输出，
    保持与前端 SSE 接口的兼容。

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
    async for chunk in react_agent.run_stream(
        user_input=user_input,
        chat_history=history_messages,
        token=token,
    ):
        yield chunk