"""
ReAct Agent 实现

基于原生 Function Calling 的 AI Agent：
模型通过 tool_calls 决定调用哪些工具，支持一轮并行调用多个工具，
工具结果以 ToolMessage 追加回对话，循环直到模型给出最终回答。

流程：
  用户问题 → 模型选择工具（tool_calls）→ 并行执行 → 结果回传
           → 模型再思考 → ... → 最终回答（token 级流式输出）
"""

import asyncio
import logging
from typing import AsyncGenerator

from langchain_core.messages import (
    AIMessageChunk,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)
from langchain_core.tools import BaseTool
from langchain_openai import ChatOpenAI

import config

logger = logging.getLogger(__name__)

# ── 系统提示词模板 ──────────────────────────────────────────────

SYSTEM_PROMPT = """你是一个友好、活泼的博客 AI 助手，可以用工具帮用户查文章、找音乐、看标签、刷歌单等。说话要自然亲切，像朋友聊天一样，可以加语气词和表情，让对话有温度。

**回答规则：**
1. 涉及博客内容（文章、歌曲、标签、歌单等）时，必须调用工具查询，不要凭记忆编造。
2. 工具返回了数据就要完整列出来，别只说"找到了"却不告诉用户具体有哪些。
3. 工具没找到结果时，说"暂时没有找到相关内容"，不要提及数据库、收录、系统等内部实现细节。
4. 返回的 JSON 别直接贴，整理成自然的话说给用户听，关键信息（标题、名称等）要列全。
5. 用户聊闲天、问通用知识、写代码之类的，不用调工具，直接回答就行。
6. 信息不够就大方说"这个我也不太确定"，别硬编。
7. 最多进行 5 轮工具调用循环，避免无限调用工具。
8. 当用户问题涉及多个不同类型的查询（如同时问文章和歌单），尽量在一次回复中并行调用多个工具，节省轮数。
9. 绝对不要提及"数据库""收录""系统""索引"等技术实现细节，始终从用户视角自然地回答。

**可用工具列表：**
{tool_names_with_description}"""


def _format_tool_list(tools: list[BaseTool], indent: int = 2) -> str:
    """格式化一组工具为带参数说明的文本"""
    lines = []
    pad = " " * indent
    for t in tools:
        params = ""
        if t.args_schema:
            schema = t.args_schema.model_json_schema()
            properties = schema.get("properties", {})
            required = schema.get("required", [])
            param_parts = []
            for name, info in properties.items():
                req = "必填" if name in required else "可选"
                desc = info.get("description", "")
                param_parts.append(f"{pad}    - {name}({req}): {desc}")
            params = "\n".join(param_parts) if param_parts else f"{pad}    无参数"
        lines.append(f"{pad}- {t.name}: {t.description}\n{params}")
    return "\n".join(lines)


def _build_tool_descriptions(tools: list[BaseTool]) -> str:
    """构建工具名称和描述的扁平文本（向后兼容）"""
    return _format_tool_list(tools, indent=2)


def _build_grouped_tool_descriptions(
    tool_groups: list[tuple[str, list[BaseTool]]],
) -> str:
    """按业务域分组构建工具描述，帮助模型更快定位所需工具"""
    sections = []
    for group_name, group_tools in tool_groups:
        section = f"【{group_name}】\n{_format_tool_list(group_tools, indent=2)}"
        sections.append(section)
    return "\n\n".join(sections)


class ReActAgent:
    """
    基于原生 Function Calling 的 AI Agent

    每轮对话中，Agent 会：
    1. 模型决定是否调用工具（可能一次并行调用多个）
    2. 并行执行所有工具，结果以 ToolMessage 追加回对话
    3. 重复 1-2 直到模型不再调用工具，此时内容流式输出给前端
    """

    MAX_ITERATIONS = 5  # 最大推理轮数，防止无限循环

    def __init__(
        self,
        tools: list[BaseTool],
        system_prompt: str = "",
        tool_groups: list[tuple[str, list[BaseTool]]] | None = None,
        temperature: float = 0.7,
    ):
        self.tools = tools
        self.tool_map: dict[str, BaseTool] = {t.name: t for t in tools}

        # 构建System Prompt
        # 优先使用分组描述，帮助模型按业务域快速选工具；
        # 未提供分组时退化为扁平列表，保持向后兼容
        if tool_groups:
            tool_desc = _build_grouped_tool_descriptions(tool_groups)
        else:
            tool_desc = _build_tool_descriptions(tools)
        self.system_prompt = SYSTEM_PROMPT.format(
            tool_names_with_description=tool_desc
        )
        # 如果有额外自定义 system_prompt，追加到末尾
        if system_prompt:
            self.system_prompt += f"\n\n{system_prompt}"

        self.llm = ChatOpenAI(
            model=config.LLM_CHAT_MODEL,
            base_url=config.LLM_BASE_URL,
            api_key=config.LLM_API_KEY,
            temperature=temperature,
            streaming=True,
        )

    async def _call_tool(self, name: str, args: dict, token: str = "") -> str:
        """调用指定工具并返回结果字符串"""
        tool = self.tool_map.get(name)
        if not tool:
            available = ", ".join(self.tool_map.keys())
            return f"错误：未知工具 '{name}'。可用工具：{available}"

        try:
            # 注入 token（业务工具靠它调 Java 后端）。
            # Function Calling 模式下模型能看到 token 参数，可能传空串占位，
            # 因此用服务端的真实 token 强制覆盖，而不是 setdefault
            if token:
                args["token"] = token
            # 过滤掉工具不接受的参数，避免 TypeError
            tool_args = self._filter_tool_args(tool, args)
            return str(await tool.ainvoke(tool_args))
        except Exception as e:
            logger.error(f"工具调用失败: {name}({args}), 错误: {e}")
            return f"工具调用出错：{str(e)}。请不要重复调用此工具，请直接回答用户。"

    @staticmethod
    def _filter_tool_args(tool: BaseTool, args: dict) -> dict:
        """过滤掉工具签名中不存在的参数，避免 TypeError"""
        if not tool.args_schema:
            return args
        schema = tool.args_schema.model_json_schema()
        accepted = set(schema.get("properties", {}).keys())
        return {k: v for k, v in args.items() if k in accepted}

    async def run_stream(
        self,
        user_input: str,
        chat_history: list[BaseMessage] | None = None,
        token: str = "",
        trace: list[dict] | None = None,
    ) -> AsyncGenerator[str, None]:
        """
        以流式方式运行 Agent

        工具调用阶段不输出，最终答案 token 级流式输出，
        保持与前端 SSE 接口的兼容。

        Args:
            user_input: 用户输入
            chat_history: 对话历史
            token: 用户认证令牌
            trace: 可选的工具调用轨迹收集列表，每次工具调用后原地追加
                {"tool", "args", "iteration", "result_preview"}，供评测等场景使用

        Yields:
            最终回答的文本片段
        """
        messages: list[BaseMessage] = [SystemMessage(content=self.system_prompt)]

        if chat_history:
            messages.extend(chat_history)

        messages.append(HumanMessage(content=user_input))

        llm_with_tools = self.llm.bind_tools(self.tools)

        for iteration in range(self.MAX_ITERATIONS):
            logger.info(f"[ReAct Stream] 第 {iteration + 1} 轮推理")

            # 流式收集：content 实时透传（DeepSeek 调工具时 content 为空，
            # 有 content 即为最终回答），tool_call_chunks 逐步合并
            collected: AIMessageChunk | None = None
            async for chunk in llm_with_tools.astream(messages):
                if chunk.content:
                    yield chunk.content
                collected = chunk if collected is None else collected + chunk

            if collected is None:
                return
            tool_calls = collected.tool_calls

            # 无 tool_calls：content 已流式输出完毕，直接结束
            if not tool_calls:
                return

            # 有 tool_calls：记录 AI 消息，并行执行所有工具
            logger.info(
                f"[ReAct Stream] 调用工具: "
                f"{[tc['name'] for tc in tool_calls]}"
            )
            messages.append(collected)

            tasks = [
                self._call_tool(tc["name"], tc.get("args") or {}, token=token)
                for tc in tool_calls
            ]
            results = await asyncio.gather(*tasks)

            # 工具结果作为 ToolMessage 追加，进入下一轮
            for tc, result in zip(tool_calls, results):
                logger.info(
                    f"[ReAct Stream] 工具 {tc['name']}: {result[:200]}..."
                )
                if trace is not None:
                    trace.append({
                        "tool": tc["name"],
                        "args": {
                            k: v for k, v in (tc.get("args") or {}).items()
                            if k != "token"
                        },
                        "iteration": iteration + 1,
                        "result_preview": result[:200],
                    })
                messages.append(
                    ToolMessage(
                        content=result,
                        tool_call_id=tc.get("id") or tc["name"],
                    )
                )

        # 达到最大轮数，不带工具强制总结（保证不再产生新的工具调用）
        logger.warning(f"[ReAct Stream] 达到最大推理轮数 {self.MAX_ITERATIONS}，强制总结")
        messages.append(
            HumanMessage(content="请根据已获取的信息，直接给出最终回答，不要再调用工具。")
        )
        async for chunk in self.llm.astream(messages):
            if chunk.content:
                yield chunk.content
