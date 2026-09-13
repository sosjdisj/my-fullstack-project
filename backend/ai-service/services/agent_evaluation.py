"""
Agent 层评测模块

评测 ReAct Agent 的工具选择与端到端回答质量，与 evaluation.py
（RAG 检索质量评测）互补。指标：
  - 工具选择准确率：实际调用的工具是否覆盖预期（expected_tools ⊆ 实际调用集合）；
    expected_tools 为空的用例要求零调用（闲聊/通用知识不该调工具）
  - 误调率：不应调工具的用例中调用了工具的比例
  - 推理轮数：工具调用循环的轮数（trace 中的最大 iteration）
  - 端到端耗时与 LLM-as-judge 相关性评分（复用 evaluation.py 的 judge）

评测使用独立的 ReActAgent 实例（temperature=0 保证可复现），
与生产单例（temperature=0.7）互不影响。评测走真实 Agent 推理
路径（run_stream），本地模型下全量约需数分钟。

使用方式：
  python -m services.agent_evaluation
"""

import asyncio
import logging
import time

from services.agent import TOOL_GROUPS, all_tools
from services.evaluation import count_keyword_hits, judge_answer
from services.react_agent import ReActAgent

logger = logging.getLogger(__name__)

# ── 测试用例 ──────────────────────────────────────────────────
# expected_tools 为空表示"不应调用任何工具"；
# expected_keywords 可选，用于统计回答关键词命中率。
# 不含需要登录 token 和具体资源 ID 的互动类工具（无真实凭据，无法稳定评测）。
AGENT_TEST_CASES = [
    # ── 单工具：业务查询 ──
    {"query": "帮我找一下关于 Vue 的文章", "expected_tools": ["search_articles"]},
    {"query": "有没有标题带'旅行'的文章？", "expected_tools": ["get_article_titles"]},
    {"query": "现在有什么热门歌曲？看看排行榜", "expected_tools": ["get_music_charts"]},
    {"query": "有什么热门歌单推荐吗？", "expected_tools": ["get_hot_playlists"]},
    {"query": "今天有什么推荐的歌单？", "expected_tools": ["get_daily_playlists"]},
    {"query": "博客里都有哪些标签？", "expected_tools": ["get_tags_list"]},
    {"query": "'前端'标签下有哪些文章？", "expected_tools": ["get_articles_by_tag"]},
    {"query": "博客的文章都有哪些分类？", "expected_tools": ["get_categories_list"]},
    {"query": "博客时间线是什么样的？文章都是什么时候发的？", "expected_tools": ["get_timeline"]},
    {"query": "看看树洞里大家都在聊什么", "expected_tools": ["get_treehole_messages"]},
    {"query": "来一句今日语录", "expected_tools": ["get_daily_quotes"]},
    # ── 博客知识库（RAG 工具）──
    {
        "query": "龙猫的伞那篇文章讲了什么？",
        "expected_tools": ["search_blog_knowledge"],
        "expected_keywords": ["龙猫"],
    },
    {
        "query": "博客里有哪些关于美食治愈的内容？作者写了什么？",
        "expected_tools": ["search_blog_knowledge"],
    },
    {
        "query": "作者是怎么看遗憾这件事的？",
        "expected_tools": ["search_blog_knowledge"],
    },
    # ── 多工具并行 ──
    {
        "query": "推荐几个热门歌单，顺便看看现在有什么热门歌曲",
        "expected_tools": ["get_hot_playlists", "get_music_charts"],
    },
    {
        "query": "博客有哪些分类和标签？",
        "expected_tools": ["get_categories_list", "get_tags_list"],
    },
    # ── 混淆判别：找文章列表 vs 问文章内容 ──
    {"query": "找一下关于遗憾的文章列表", "expected_tools": ["search_articles"]},
    {
        "query": "作者在文章里是怎么描述遗憾的？",
        "expected_tools": ["search_blog_knowledge"],
    },
    # ── 闲聊/通用知识：不应调用任何工具 ──
    {"query": "你好呀，你是谁？", "expected_tools": []},
    {"query": "谢谢你之前的帮助！", "expected_tools": []},
    {"query": "用 Python 写一个快速排序", "expected_tools": []},
]


async def evaluate_agent_case(agent: ReActAgent, case: dict) -> dict:
    """
    评测单个用例

    Args:
        agent: 待评测的 ReActAgent 实例
        case: 用例，含 query / expected_tools / expected_keywords(可选)

    Returns:
        单用例评估结果（含完整 trace 供人工审查）
    """
    query = case["query"]
    expected_tools = case.get("expected_tools", [])
    keywords = case.get("expected_keywords", [])

    trace: list[dict] = []
    start = time.perf_counter()
    answer_parts: list[str] = []
    async for chunk in agent.run_stream(user_input=query, trace=trace):
        answer_parts.append(chunk)
    elapsed = time.perf_counter() - start
    answer = "".join(answer_parts)

    # 去重但保留首次调用顺序
    called_tools: list[str] = []
    for entry in trace:
        if entry["tool"] not in called_tools:
            called_tools.append(entry["tool"])

    expected_set = set(expected_tools)
    called_set = set(called_tools)
    # 期望工具都被调用即判过；期望为空时要求零调用；
    # 多调的工具记入 extra_tools 供人工审查，不扣分
    tool_hit = expected_set.issubset(called_set) if expected_tools else not called_tools

    return {
        "query": query,
        "expected_tools": expected_tools,
        "called_tools": called_tools,
        "tool_hit": tool_hit,
        "missing_tools": sorted(expected_set - called_set),
        "extra_tools": sorted(called_set - expected_set),
        "rounds": max((e["iteration"] for e in trace), default=0),
        "total_time_ms": round(elapsed * 1000, 2),
        "answer": answer,
        "keyword_hits": count_keyword_hits(answer, keywords),
        "judge": await judge_answer(query, answer, None),
        "trace": trace,
    }


async def evaluate_all(cases: list[dict]) -> list[dict]:
    """
    批量评测：构建独立的评测 Agent（temperature=0）并逐条运行

    Args:
        cases: 用例列表

    Returns:
        评估结果列表（与用例顺序一致）
    """
    agent = ReActAgent(tools=all_tools, tool_groups=TOOL_GROUPS, temperature=0.0)
    results = []
    for i, case in enumerate(cases, 1):
        logger.info(f"评测进度: {i}/{len(cases)} - {case['query'][:40]}")
        try:
            results.append(await evaluate_agent_case(agent, case))
        except Exception as e:
            logger.error(f"用例评测失败: {case['query']}, 错误: {e}", exc_info=True)
            results.append({
                "query": case["query"],
                "expected_tools": case.get("expected_tools", []),
                "called_tools": [],
                "tool_hit": False,
                "missing_tools": sorted(set(case.get("expected_tools", []))),
                "extra_tools": [],
                "rounds": 0,
                "total_time_ms": 0,
                "answer": "",
                "keyword_hits": count_keyword_hits("", case.get("expected_keywords", [])),
                "judge": {"relevance": None, "reason": f"评测异常: {e}"},
                "trace": [],
            })
    return results


def print_agent_report(results: list[dict]) -> None:
    """打印全量评测报告：逐用例明细 + 汇总指标"""
    print("\n" + "=" * 96)
    print("Agent 层评测明细")
    print("=" * 96)

    for r in results:
        mark = "PASS" if r["tool_hit"] else "FAIL"
        expected = "+".join(r["expected_tools"]) or "（零调用）"
        called = "+".join(r["called_tools"]) or "（无）"
        relevance = r["judge"].get("relevance")
        relevance_str = "-" if relevance is None else str(relevance)
        print(f"\n[{mark}] {r['query']}")
        print(f"  期望工具: {expected}")
        print(f"  实际调用: {called}  轮数: {r['rounds']}  耗时: {r['total_time_ms']}ms  相关性: {relevance_str}/5")
        if r["missing_tools"]:
            print(f"  漏调: {', '.join(r['missing_tools'])}")
        if r["extra_tools"]:
            print(f"  多调: {', '.join(r['extra_tools'])}")
        answer = r["answer"]
        print(f"  回答: {answer[:150]}{'...' if len(answer) > 150 else ''}")

    print("\n" + "#" * 96)
    print("# 汇总")
    print("#" * 96)

    total = len(results)
    hits = sum(1 for r in results if r["tool_hit"])
    print(f"\n  工具选择准确率:   {hits}/{total} ({hits / total:.1%})" if total else "  无用例")

    # 误调率：期望零调用的用例中实际调了工具的比例
    no_tool_cases = [r for r in results if not r["expected_tools"]]
    if no_tool_cases:
        false_positives = sum(1 for r in no_tool_cases if r["called_tools"])
        print(
            f"  闲聊误调率:       {false_positives}/{len(no_tool_cases)} "
            f"({false_positives / len(no_tool_cases):.1%})"
        )

    with_tools = [r for r in results if r["called_tools"]]
    if with_tools:
        avg_rounds = sum(r["rounds"] for r in with_tools) / len(with_tools)
        print(f"  平均推理轮数:     {avg_rounds:.2f}（有工具调用的 {len(with_tools)} 例）")

    if total:
        avg_time = sum(r["total_time_ms"] for r in results) / total
        print(f"  平均端到端耗时:   {avg_time:.0f} ms")

    judged = [
        r["judge"] for r in results
        if isinstance(r.get("judge"), dict) and r["judge"].get("relevance") is not None
    ]
    if judged:
        avg_rel = sum(j["relevance"] for j in judged) / len(judged)
        print(f"  平均相关性评分:   {avg_rel:.2f} / 5（{len(judged)} 例）")

    failures = [r for r in results if not r["tool_hit"]]
    if failures:
        print(f"\n  失败用例（{len(failures)} 个）:")
        for r in failures:
            reason = []
            if r["missing_tools"]:
                reason.append(f"漏调 {', '.join(r['missing_tools'])}")
            if r["extra_tools"]:
                reason.append(f"多调 {', '.join(r['extra_tools'])}")
            if not r["called_tools"] and r["expected_tools"]:
                reason.append("未调用任何工具")
            print(f"    - {r['query']}（{'；'.join(reason)}）")

    print("\n" + "#" * 96 + "\n")


async def _demo():
    """直接运行本模块即执行全量评测"""
    results = await evaluate_all(AGENT_TEST_CASES)
    print_agent_report(results)


if __name__ == "__main__":
    logging.basicConfig(level=logging.WARNING)  # 减少日志干扰，只看评测输出
    asyncio.run(_demo())
