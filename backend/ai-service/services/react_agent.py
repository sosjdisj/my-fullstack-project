"""
ReAct Agent 实现

基于 ReAct (Reasoning + Acting) 模式的 AI Agent，
让模型在每一步先进行思考（Thought），再选择工具行动（Action），
观察结果（Observation），循环直到得出最终答案。

流程：
  用户问题 → Thought(思考) → Action(调用工具) → Observation(观察结果)
         → Thought(再思考) → ... → Final Answer(最终回答)
"""

import asyncio
import json
import logging
import re
from typing import AsyncGenerator

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_core.tools import BaseTool
from langchain_ollama import ChatOllama

import config

logger = logging.getLogger(__name__)

# ── ReAct 提示词模板 ──────────────────────────────────────────────

REACT_SYSTEM_PROMPT = """你是一个友好、活泼的博客 AI 助手，可以用工具帮用户查文章、找音乐、看标签、刷歌单等。说话要自然亲切，像朋友聊天一样，可以加语气词和表情，让对话有温度。

你必须严格按照 ReAct 格式思考和回答，每一步都先思考再行动：

**格式要求（严格遵守）：**

当你需要调用工具时，必须输出：
Thought: 你对当前情况的思考和分析
Action 1: 工具名称
Action Input 1: 工具参数（JSON 格式）
Action 2: 工具名称
Action Input 2: 工具参数（JSON 格式）
...（如需同时调用多个工具，依次编号；只调用一个工具时编号为 1 即可）

当你已经有了足够信息可以回答用户时，必须输出：
Thought: 我已经得到了需要的信息，可以回答用户了
Final Answer: 你的最终回答

**回答规则：**
1. 涉及博客内容（文章、歌曲、标签、歌单等）时，必须调用工具查询，不要凭记忆编造。
2. 工具返回了数据就要完整列出来，别只说"找到了"却不告诉用户具体有哪些。
3. 工具没找到结果时，说"暂时没有找到相关内容"，不要提及数据库、收录、系统等内部实现细节。
4. 返回的 JSON 别直接贴，整理成自然的话说给用户听，关键信息（标题、名称等）要列全。
5. 用户聊闲天、问通用知识、写代码之类的，不用调工具，直接用 Final Answer 回答就行。
6. 信息不够就大方说"这个我也不太确定"，别硬编。
7. 最多进行 5 轮 Thought-Action-Observation 循环，避免无限调用工具。
8. 当用户问题涉及多个不同类型的查询（如同时问文章和歌单），尽量在一次中并行调用多个工具，节省轮数。
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
            schema = t.args_schema.schema()
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
    ReAct 模式的 AI Agent

    每轮对话中，Agent 会：
    1. 思考（Thought）：分析当前状态，决定下一步
    2. 行动（Action）：选择并调用工具
    3. 观察（Observation）：获取工具返回结果
    4. 重复 1-3 直到得出最终答案（Final Answer）
    """

    MAX_ITERATIONS = 5  # 最大推理轮数，防止无限循环

    def __init__(
        self,
        tools: list[BaseTool],
        system_prompt: str = "",
        tool_groups: list[tuple[str, list[BaseTool]]] | None = None,
    ):
        self.tools = tools
        self.tool_map: dict[str, BaseTool] = {t.name: t for t in tools}

        # 构建 ReAct 专用 System Prompt
        # 优先使用分组描述，帮助模型按业务域快速选工具；
        # 未提供分组时退化为扁平列表，保持向后兼容
        if tool_groups:
            tool_desc = _build_grouped_tool_descriptions(tool_groups)
        else:
            tool_desc = _build_tool_descriptions(tools)
        self.system_prompt = REACT_SYSTEM_PROMPT.format(
            tool_names_with_description=tool_desc
        )
        # 如果有额外自定义 system_prompt，追加到末尾
        if system_prompt:
            self.system_prompt += f"\n\n{system_prompt}"

        self.llm = ChatOllama(
            model=config.OLLAMA_CHAT_MODEL,
            base_url=config.OLLAMA_BASE_URL,
            temperature=0.7,
        )

    def _parse_actions(self, text: str) -> list[dict]:
        """
        从模型输出中解析所有 Action 和 Action Input

        支持的格式：
        - Action 1: tool_name / Action Input 1: {"key": "value"}  （编号格式）
        - Action: tool_name / Action Input: {"key": "value"}       （无编号格式，向后兼容）

        Returns:
            解析出的 action 列表，每项为 {"action": str, "action_input": str}
            解析失败返回空列表
        """
        results: dict[int, dict] = {}  # {编号: {action, action_input}}
        next_unnumbered_idx = 0  # 无编号格式的递增索引

        # 逐行扫描，匹配 Action [N]: name 和 Action Input [N]: value
        for line in text.strip().split("\n"):
            stripped = line.strip()

            # 编号格式：Action 1: tool_name
            m = re.match(r"Action\s+(\d+)\s*:\s*(.+)", stripped, re.IGNORECASE)
            if m:
                idx = int(m.group(1))
                results.setdefault(idx, {})["action"] = m.group(2).strip()
                next_unnumbered_idx = max(next_unnumbered_idx, idx + 1)
                continue

            # 无编号格式：Action: tool_name
            m = re.match(r"Action\s*:\s*(.+)", stripped, re.IGNORECASE)
            if m:
                results.setdefault(next_unnumbered_idx, {})["action"] = m.group(1).strip()
                next_unnumbered_idx += 1
                continue

            # 编号格式：Action Input 1: value
            m = re.match(r"Action\s+Input\s+(\d+)\s*:\s*(.+)", stripped, re.IGNORECASE)
            if m:
                idx = int(m.group(1))
                raw = m.group(2).strip()
                try:
                    parsed = json.loads(raw)
                except (json.JSONDecodeError, TypeError):
                    parsed = raw
                results.setdefault(idx, {})["action_input"] = parsed
                next_unnumbered_idx = max(next_unnumbered_idx, idx + 1)
                continue

            # 无编号格式：Action Input: value
            m = re.match(r"Action\s+Input\s*:\s*(.+)", stripped, re.IGNORECASE)
            if m:
                raw = m.group(1).strip()
                try:
                    parsed = json.loads(raw)
                except (json.JSONDecodeError, TypeError):
                    parsed = raw
                results.setdefault(next_unnumbered_idx, {})["action_input"] = parsed
                next_unnumbered_idx += 1
                continue

        # 按编号排序，组装结果列表
        actions = []
        for idx in sorted(results.keys()):
            entry = results[idx]
            if "action" in entry:
                actions.append({
                    "action": entry["action"],
                    "action_input": entry.get("action_input", ""),
                })

        return actions

    def _format_scratchpad(self, scratchpad: list[dict]) -> str:
        """将历史推理过程格式化为文本"""
        parts = []
        for entry in scratchpad:
            if entry["type"] == "thought":
                parts.append(entry["content"])
            elif entry["type"] == "observation":
                parts.append(f"Observation: {entry['content']}")
        return "\n".join(parts)

    async def _call_tool(self, action: str, action_input, token: str = "") -> str:
        """调用指定工具并返回结果字符串"""
        tool = self.tool_map.get(action)
        if not tool:
            available = ", ".join(self.tool_map.keys())
            return f"错误：未知工具 '{action}'。可用工具：{available}"

        try:
            # 处理不同类型的 action_input
            if isinstance(action_input, dict):
                # 注入 token（如果工具接受 token 参数）
                if token:
                    action_input.setdefault("token", token)
                # 过滤掉工具不接受的参数，避免 TypeError
                tool_args = self._filter_tool_args(tool, action_input)
                result = await tool.ainvoke(tool_args)
            elif isinstance(action_input, str):
                # 尝试 JSON 解析
                try:
                    parsed = json.loads(action_input)
                    if isinstance(parsed, dict):
                        if token:
                            parsed.setdefault("token", token)
                        tool_args = self._filter_tool_args(tool, parsed)
                        result = await tool.ainvoke(tool_args)
                    else:
                        result = await tool.ainvoke({"__arg1": action_input})
                except (json.JSONDecodeError, TypeError):
                    result = await tool.ainvoke({"__arg1": action_input})
            else:
                result = await tool.ainvoke({"__arg1": str(action_input)})

            return str(result)
        except Exception as e:
            logger.error(f"工具调用失败: {action}({action_input}), 错误: {e}")
            return f"工具调用出错：{str(e)}。请不要重复调用此工具，请直接用 Final Answer 回答用户。"

    @staticmethod
    def _filter_tool_args(tool: BaseTool, args: dict) -> dict:
        """过滤掉工具签名中不存在的参数，避免 TypeError"""
        if not tool.args_schema:
            return args
        schema = tool.args_schema.schema()
        accepted = set(schema.get("properties", {}).keys())
        return {k: v for k, v in args.items() if k in accepted}

    @staticmethod
    def _clean_non_action_text(text: str) -> str:
        """清理没有 Action 的模型输出，去掉 Thought/Action/Action Input 行

        如果清理后为空，回退到原始文本（去除首尾空白），
        与原 run_stream 中 parsed is None 分支的行为保持一致。
        """
        if "Thought:" in text:
            lines = text.split("\n")
            content_lines = [
                l for l in lines
                if not l.strip().startswith("Thought:")
                   and not re.match(r"Action\s*\d*\s*:", l.strip())
                   and not re.match(r"Action\s+Input\s*\d*\s*:", l.strip())
            ]
            cleaned = "\n".join(content_lines).strip()
            if cleaned:
                return cleaned
        return text.strip()

    @staticmethod
    def _simulate_stream(text: str, chunk_size: int = 8):
        """将已完整生成的文本分片输出，模拟流式体验

        仅用于无法走 LLM astream 的降级路径（如模型未按 ReAct 格式输出），
        保证前端始终收到多个 token 事件，避免"一次性输出"的不一致体验。
        """
        for i in range(0, len(text), chunk_size):
            yield text[i:i + chunk_size]

    async def run_stream(
        self,
        user_input: str,
        chat_history: list[BaseMessage] | None = None,
        token: str = "",
    ) -> AsyncGenerator[str, None]:
        """
        以流式方式运行 ReAct Agent

        思考和工具调用阶段不输出，只在最终答案阶段流式输出文本，
        保持与前端 SSE 接口的兼容。

        所有可能产生最终输出的路径都通过 LLM 的 astream 真正流式输出，
        避免出现"有时流式、有时一次性"的不一致体验。

        Args:
            user_input: 用户输入
            chat_history: 对话历史
            token: 用户认证令牌

        Yields:
            最终回答的文本片段
        """
        messages: list[BaseMessage] = [SystemMessage(content=self.system_prompt)]

        if chat_history:
            messages.extend(chat_history)

        messages.append(HumanMessage(content=user_input))

        scratchpad: list[dict] = []

        FINAL_MARKER = "Final Answer:"
        # 匹配 Action: 或 Action 1: 等编号格式
        ACTION_PATTERN = re.compile(r"Action\s*\d*\s*:")

        for iteration in range(self.MAX_ITERATIONS):
            logger.info(f"[ReAct Stream] 第 {iteration + 1} 轮推理")

            if scratchpad:
                scratchpad_text = self._format_scratchpad(scratchpad)
                context_msgs = [SystemMessage(content=self.system_prompt)]
                if chat_history:
                    context_msgs.extend(chat_history)
                full_context = f"{user_input}\n\n{scratchpad_text}"
                context_msgs.append(HumanMessage(content=full_context))
                messages = context_msgs

            # 流式调用 LLM，边接收边检测 Final Answer / Action 标记
            full_text = ""
            buffer = ""                  # 标记检测前的缓冲区
            final_answer_started = False
            action_detected = False

            async for chunk in self.llm.astream(messages):
                chunk_text = chunk.content or ""
                if not chunk_text:
                    continue

                full_text += chunk_text

                # 已经进入 Final Answer 阶段：直接把后续 chunk 透传给前端
                if final_answer_started:
                    yield chunk_text
                    continue

                # 已经识别到 Action：后续内容只需要缓冲，不需要输出
                if action_detected:
                    continue

                # 标记检测阶段：累积到 buffer 中再判断，避免标记被拆分到多个 chunk
                buffer += chunk_text

                # 优先检测 Final Answer（与原实现保持一致的优先级）
                idx = buffer.find(FINAL_MARKER)
                if idx != -1:
                    after_marker = buffer[idx + len(FINAL_MARKER):]
                    if after_marker.strip():
                        # 去掉 marker 后的前导空白，避免开头多一个空格/换行
                        yield after_marker.lstrip()
                    final_answer_started = True
                    continue

                # 检测 Action
                if ACTION_PATTERN.search(buffer):
                    action_detected = True
                    continue

            logger.info(f"[ReAct Stream] LLM 输出:\n{full_text}")

            # 路径 1：识别到 Final Answer，已经流式输出完毕，直接返回
            if final_answer_started:
                return

            # 路径 2：识别到 Action，解析并调用工具，进入下一轮
            if action_detected:
                parsed_list = self._parse_actions(full_text)
                if not parsed_list:
                    # 标记存在但解析失败，降级为输出清理后的文本（分片模拟流式）
                    cleaned = self._clean_non_action_text(full_text)
                    if cleaned:
                        for piece in self._simulate_stream(cleaned):
                            yield piece
                    return

                scratchpad.append({"type": "thought", "content": full_text})

                # 并行调用所有工具，将 token 通过参数传递
                tasks = [
                    self._call_tool(p["action"], p["action_input"], token=token)
                    for p in parsed_list
                ]
                observations = await asyncio.gather(*tasks)

                # 逐个追加 Observation
                for i, obs in enumerate(observations):
                    action_name = parsed_list[i]["action"]
                    logger.info(
                        f"[ReAct Stream] 工具 {i+1}/{len(parsed_list)} "
                        f"{action_name}: {obs[:200]}..."
                    )
                    scratchpad.append({"type": "observation", "content": obs})

                continue

            # 路径 3：既没有 Final Answer 也没有 Action（模型没按 ReAct 格式输出）
            # 降级为输出清理后的文本（分片模拟流式），保持前端体验一致
            cleaned = self._clean_non_action_text(full_text)
            if cleaned:
                for piece in self._simulate_stream(cleaned):
                    yield piece
            return

        # 路径 4：达到最大轮数，流式输出强制总结
        logger.warning(f"[ReAct Stream] 达到最大推理轮数 {self.MAX_ITERATIONS}，强制总结")
        scratchpad_text = self._format_scratchpad(scratchpad)

        force_prompt = f"""根据以下推理过程和观察结果，给出最终回答：

{scratchpad_text}

请直接给出 Final Answer:"""

        context_msgs = [SystemMessage(content=self.system_prompt)]
        if chat_history:
            context_msgs.extend(chat_history)
        context_msgs.append(HumanMessage(content=f"{user_input}\n\n{force_prompt}"))

        # 流式输出最终总结
        async for chunk in self.llm.astream(context_msgs):
            if chunk.content:
                yield chunk.content