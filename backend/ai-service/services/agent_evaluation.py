"""
Agent 层评测模块

评测 ReAct Agent 的工具选择与端到端回答质量，与 evaluation.py
（RAG 检索质量评测）互补。指标：
  - 工具选择准确率：实际调用的工具是否覆盖预期（expected_tools ⊆ 实际调用集合）；
    expected_tools 为空的用例要求零调用（闲聊/通用知识不该调工具）
  - 误调率：不应调工具的用例中调用了工具的比例
  - 推理轮数：工具调用循环的轮数（trace 中的最大 iteration）
  - 端到端耗时与 LLM-as-judge 相关性评分（复用 evaluation.py 的 judge）

用例分七类（category 字段）：单工具 / 知识库RAG / 多工具并行 /
混淆判别 / 闲聊通用 / 参数组合 / 多轮上下文。

评测使用独立的 ReActAgent 实例（temperature=0 保证可复现），
与生产单例（temperature=0.7）互不影响。评测走真实 Agent 推理
路径（run_stream），并发执行（默认 5）以缩短总耗时。

使用方式：
  python -m services.agent_evaluation
"""

import asyncio
import logging
import time

from services.agent import TOOL_GROUPS, all_tools, convert_history
from services.evaluation import count_keyword_hits, judge_answer
from services.react_agent import ReActAgent

logger = logging.getLogger(__name__)

# 并发评测数：过大会触发 API 限流，5 是耗时与稳定性的平衡点
EVAL_CONCURRENCY = 5

# ── 测试用例（100 条，7 类）────────────────────────────────────
# expected_tools 为空表示"不应调用任何工具"；
# expected_keywords 可选，用于统计回答关键词命中率；
# history 可选，用于多轮上下文用例（指代消解）。
# 不含需要具体资源 ID 的互动类工具（无真实凭据，无法稳定评测）。
AGENT_TEST_CASES = [
    # ── 单工具（38 条）：每个业务工具 2-5 种表述 ──
    {"category": "单工具", "query": "帮我找一下关于 Vue 的文章", "expected_tools": ["search_articles"]},
    {"category": "单工具", "query": "有没有标题带'旅行'的文章？", "expected_tools": ["get_article_titles"]},
    {"category": "单工具", "query": "现在有什么热门歌曲？看看排行榜", "expected_tools": ["get_music_charts"]},
    {"category": "单工具", "query": "有什么热门歌单推荐吗？", "expected_tools": ["get_hot_playlists"]},
    {"category": "单工具", "query": "今天有什么推荐的歌单？", "expected_tools": ["get_daily_playlists"]},
    {"category": "单工具", "query": "博客里都有哪些标签？", "expected_tools": ["get_tags_list"]},
    {"category": "单工具", "query": "'前端'标签下有哪些文章？", "expected_tools": ["get_articles_by_tag"]},
    {"category": "单工具", "query": "博客的文章都有哪些分类？", "expected_tools": ["get_categories_list"]},
    {"category": "单工具", "query": "博客时间线是什么样的？文章都是什么时候发的？", "expected_tools": ["get_timeline"]},
    {"category": "单工具", "query": "看看树洞里大家都在聊什么", "expected_tools": ["get_treehole_messages"]},
    {"category": "单工具", "query": "来一句今日语录", "expected_tools": ["get_daily_quotes"]},
    {"category": "单工具", "query": "搜一下和'遗憾'有关的文章", "expected_tools": ["search_articles"]},
    {"category": "单工具", "query": "博客里有没有写美食的文章？搜来看看", "expected_tools": ["search_articles"]},
    {"category": "单工具", "query": "帮我找几篇写成长的博客文章", "expected_tools": ["search_articles"]},
    {"category": "单工具", "query": "有没有写雨和伞的文章？搜搜看", "expected_tools": ["search_articles"]},
    {"category": "单工具", "query": "找找标题里有'龙猫'的文章", "expected_tools": ["get_article_titles"]},
    {"category": "单工具", "query": "标题包含'遗憾'的文章有哪些？", "expected_tools": ["get_article_titles"]},
    {"category": "单工具", "query": "来点日语歌，看看排行榜里有什么", "expected_tools": ["get_music_charts"]},
    {"category": "单工具", "query": "热门音乐都有啥？", "expected_tools": ["get_music_charts"]},
    {"category": "单工具", "query": "看看华语标签的热门歌曲排行榜", "expected_tools": ["get_music_charts"]},
    {"category": "单工具", "query": "推荐几个大家都在听的歌单", "expected_tools": ["get_hot_playlists"]},
    {"category": "单工具", "query": "每日推荐歌单是啥？给我看看", "expected_tools": ["get_daily_playlists"]},
    {"category": "单工具", "query": "有什么好听的歌单？来点每日推荐的", "expected_tools": ["get_daily_playlists"]},
    {"category": "单工具", "query": "看看文章都有些什么标签", "expected_tools": ["get_tags_list"]},
    {"category": "单工具", "query": "博客里有多少个标签？分别是什么？", "expected_tools": ["get_tags_list"]},
    {"category": "单工具", "query": "治愈标签下都有什么文章？", "expected_tools": ["get_articles_by_tag"]},
    {"category": "单工具", "query": "帮我看看二次元标签里的文章", "expected_tools": ["get_articles_by_tag"]},
    {"category": "单工具", "query": "列一下博客的分类呗", "expected_tools": ["get_categories_list"]},
    {"category": "单工具", "query": "'暖途拾光'分类下有哪些文章？", "expected_tools": ["get_articles_by_category"]},
    {"category": "单工具", "query": "半生浅悟分类里都有什么？", "expected_tools": ["get_articles_by_category"]},
    {"category": "单工具", "query": "二次元脑洞分类下的文章有哪些？", "expected_tools": ["get_articles_by_category"]},
    {"category": "单工具", "query": "看看'其他'分类下的文章", "expected_tools": ["get_articles_by_category"]},
    {"category": "单工具", "query": "看看博客的更新历史", "expected_tools": ["get_timeline"]},
    {"category": "单工具", "query": "时间轴上最早的文章是哪一篇？", "expected_tools": ["get_timeline"]},
    {"category": "单工具", "query": "树洞最近有什么新消息？", "expected_tools": ["get_treehole_messages"]},
    {"category": "单工具", "query": "树洞里有人在吐槽学习吗？", "expected_tools": ["get_treehole_messages"]},
    {"category": "单工具", "query": "今天的一句话是什么？", "expected_tools": ["get_daily_quotes"]},
    {"category": "单工具", "query": "我点赞过哪些歌？", "expected_tools": ["get_user_liked_songs"]},

    # ── 知识库 RAG（15 条）：文章内容细节问答 ──
    {"category": "知识库RAG", "query": "龙猫的伞那篇文章讲了什么？", "expected_tools": ["search_blog_knowledge"], "expected_keywords": ["龙猫"]},
    {"category": "知识库RAG", "query": "博客里有哪些关于美食治愈的内容？作者写了什么？", "expected_tools": ["search_blog_knowledge"]},
    {"category": "知识库RAG", "query": "作者是怎么看遗憾这件事的？", "expected_tools": ["search_blog_knowledge"]},
    {"category": "知识库RAG", "query": "作者重看《龙猫》有什么感想？", "expected_tools": ["search_blog_knowledge"]},
    {"category": "知识库RAG", "query": "菜市场和治愈有什么关系？作者是怎么写的？", "expected_tools": ["search_blog_knowledge"]},
    {"category": "知识库RAG", "query": "博客里关于'成长'的文章都说了什么？", "expected_tools": ["search_blog_knowledge"]},
    {"category": "知识库RAG", "query": "有没有'遗憾不是失败'这种观点？出自哪篇文章？", "expected_tools": ["search_blog_knowledge"]},
    {"category": "知识库RAG", "query": "作者在旅行类的文章里有什么感悟？", "expected_tools": ["search_blog_knowledge"]},
    {"category": "知识库RAG", "query": "那篇写雨伞和温柔的文章想表达什么？", "expected_tools": ["search_blog_knowledge"]},
    {"category": "知识库RAG", "query": "博客文章里提到的二次元作品有哪些？作者怎么评价的？", "expected_tools": ["search_blog_knowledge"]},
    {"category": "知识库RAG", "query": "作者觉得遗憾意味着什么？用文章里的观点回答", "expected_tools": ["search_blog_knowledge"]},
    {"category": "知识库RAG", "query": "'一把伞的温柔'那一节具体写了什么？", "expected_tools": ["search_blog_knowledge"]},
    {"category": "知识库RAG", "query": "博客里有没有关于慢生活、生活节奏的内容？作者怎么说的？", "expected_tools": ["search_blog_knowledge"]},
    {"category": "知识库RAG", "query": "文章里描写菜市场烟火气的段落说了什么？", "expected_tools": ["search_blog_knowledge"]},
    {"category": "知识库RAG", "query": "二次元相关的文章里作者提到了哪些作品？", "expected_tools": ["search_blog_knowledge"]},

    # ── 多工具并行（10 条）：一轮内并行调用多个工具 ──
    {"category": "多工具并行", "query": "推荐几个热门歌单，顺便看看现在有什么热门歌曲", "expected_tools": ["get_hot_playlists", "get_music_charts"]},
    {"category": "多工具并行", "query": "博客有哪些分类和标签？", "expected_tools": ["get_categories_list", "get_tags_list"]},
    {"category": "多工具并行", "query": "看看今日语录，再看一眼树洞", "expected_tools": ["get_daily_quotes", "get_treehole_messages"]},
    {"category": "多工具并行", "query": "我想知道博客的时间线，顺便看看分类", "expected_tools": ["get_timeline", "get_categories_list"]},
    {"category": "多工具并行", "query": "每日推荐歌单和热门歌单都给我看看", "expected_tools": ["get_daily_playlists", "get_hot_playlists"]},
    {"category": "多工具并行", "query": "找找关于遗憾的文章，再来一句今日语录", "expected_tools": ["search_articles", "get_daily_quotes"]},
    {"category": "多工具并行", "query": "看看治愈标签下的文章，再推荐几个热门歌单", "expected_tools": ["get_articles_by_tag", "get_hot_playlists"]},
    {"category": "多工具并行", "query": "树洞里大家在聊什么？最近博客更新了什么？", "expected_tools": ["get_treehole_messages", "get_timeline"]},
    {"category": "多工具并行", "query": "榜单里挑几首日语歌，再看看每日推荐歌单", "expected_tools": ["get_music_charts", "get_daily_playlists"]},
    {"category": "多工具并行", "query": "帮我看看有哪些分类，再搜一下关于美食的文章", "expected_tools": ["get_categories_list", "search_articles"]},

    # ── 混淆判别（10 条）：找文章列表 vs 问文章内容，一字之差 ──
    {"category": "混淆判别", "query": "找一下关于遗憾的文章列表", "expected_tools": ["search_articles"]},
    {"category": "混淆判别", "query": "作者在文章里是怎么描述遗憾的？", "expected_tools": ["search_blog_knowledge"]},
    {"category": "混淆判别", "query": "搜搜有没有写龙猫的文章", "expected_tools": ["search_articles"]},
    {"category": "混淆判别", "query": "龙猫的伞那篇文章表达了什么？", "expected_tools": ["search_blog_knowledge"]},
    {"category": "混淆判别", "query": "列出写菜市场的文章标题", "expected_tools": ["get_article_titles"]},
    {"category": "混淆判别", "query": "菜市场那篇文章里哪一段最打动人？作者怎么写的？", "expected_tools": ["search_blog_knowledge"]},
    {"category": "混淆判别", "query": "有哪些关于治愈的文章？", "expected_tools": ["search_articles"]},
    {"category": "混淆判别", "query": "治愈系文章里作者常用的意象是什么？文章里怎么体现的？", "expected_tools": ["search_blog_knowledge"]},
    {"category": "混淆判别", "query": "搜一下二次元相关的文章", "expected_tools": ["search_articles"]},
    {"category": "混淆判别", "query": "二次元脑洞分类下的文章都在写什么内容？", "expected_tools": ["search_blog_knowledge"]},

    # ── 闲聊/通用知识（17 条）：不应调用任何工具 ──
    {"category": "闲聊通用", "query": "你好呀，你是谁？", "expected_tools": []},
    {"category": "闲聊通用", "query": "谢谢你之前的帮助！", "expected_tools": []},
    {"category": "闲聊通用", "query": "用 Python 写一个快速排序", "expected_tools": []},
    {"category": "闲聊通用", "query": "今天天气怎么样？", "expected_tools": []},
    {"category": "闲聊通用", "query": "你能做什么呀？", "expected_tools": []},
    {"category": "闲聊通用", "query": "讲个笑话听听", "expected_tools": []},
    {"category": "闲聊通用", "query": "地球为什么绕着太阳转？", "expected_tools": []},
    {"category": "闲聊通用", "query": "晚上睡不着怎么办？给我点建议", "expected_tools": []},
    {"category": "闲聊通用", "query": "再见啦，明天见", "expected_tools": []},
    {"category": "闲聊通用", "query": "1+1等于几？", "expected_tools": []},
    {"category": "闲聊通用", "query": "帮我写一封请假邮件", "expected_tools": []},
    {"category": "闲聊通用", "query": "你喜欢什么音乐？", "expected_tools": []},
    {"category": "闲聊通用", "query": "用一句话解释什么是递归", "expected_tools": []},
    {"category": "闲聊通用", "query": "你好你好", "expected_tools": []},
    {"category": "闲聊通用", "query": "如何提高英语口语？", "expected_tools": []},
    {"category": "闲聊通用", "query": "你最擅长什么？", "expected_tools": []},
    {"category": "闲聊通用", "query": "帮我想个博客文章标题", "expected_tools": []},

    # ── 参数组合（6 条）：带参数/链式查询 ──
    {"category": "参数组合", "query": "日语和华语歌都来点，看看排行榜", "expected_tools": ["get_music_charts"]},
    {"category": "参数组合", "query": "'治愈'标签下有几篇文章？都列出来", "expected_tools": ["get_articles_by_tag"]},
    {"category": "参数组合", "query": "二次元分类和二次元标签下分别有哪些文章？", "expected_tools": ["get_articles_by_category", "get_articles_by_tag"]},
    {"category": "参数组合", "query": "周杰伦经典合集那个歌单里都有什么歌？", "expected_tools": ["get_playlist_detail"]},
    {"category": "参数组合", "query": "治愈系轻音乐那个歌单里有什么歌？", "expected_tools": ["get_playlist_detail"]},
    {"category": "参数组合", "query": "时间线上最新和最早的文章分别是哪两篇？", "expected_tools": ["get_timeline"]},

    # ── 多轮上下文（4 条）：指代消解依赖对话历史 ──
    {
        "category": "多轮上下文",
        "query": "它里面提到的那把伞有什么特别的？",
        "expected_tools": ["search_blog_knowledge"],
        "history": [
            {"role": "user", "content": "龙猫的伞那篇文章讲了什么？"},
            {"role": "assistant", "content": "那篇《龙猫的伞，不仅能遮雨，还能接住温柔》从重看《龙猫》聊起，讲了小月把伞借给龙猫的故事。"},
        ],
    },
    {
        "category": "多轮上下文",
        "query": "帮我搜搜还有没有别的写遗憾的文章",
        "expected_tools": ["search_articles"],
        "history": [
            {"role": "user", "content": "作者是怎么看遗憾的？"},
            {"role": "assistant", "content": "作者在《接受遗憾，是成长的必修课》里说，遗憾不是失败，是常态。"},
        ],
    },
    {
        "category": "多轮上下文",
        "query": "再看看现在的热门歌曲排行榜",
        "expected_tools": ["get_music_charts"],
        "history": [
            {"role": "user", "content": "有什么热门歌单？"},
            {"role": "assistant", "content": "有治愈系轻音乐、华语流行热歌、周杰伦经典合集这几个热门歌单。"},
        ],
    },
    {
        "category": "多轮上下文",
        "query": "半生浅悟分类里有哪些文章？",
        "expected_tools": ["get_articles_by_category"],
        "history": [
            {"role": "user", "content": "博客有哪些分类？"},
            {"role": "assistant", "content": "博客有二次元脑洞、暖途拾光、半生浅悟、其他这四个分类。"},
        ],
    },
]


async def evaluate_agent_case(agent: ReActAgent, case: dict) -> dict:
    """
    评测单个用例

    Args:
        agent: 待评测的 ReActAgent 实例
        case: 用例，含 category / query / expected_tools /
            expected_keywords(可选) / history(可选)

    Returns:
        单用例评估结果（含完整 trace 供人工审查）
    """
    query = case["query"]
    expected_tools = case.get("expected_tools", [])
    keywords = case.get("expected_keywords", [])
    history = convert_history(case.get("history") or [])

    trace: list[dict] = []
    start = time.perf_counter()
    answer_parts: list[str] = []
    async for chunk in agent.run_stream(
        user_input=query, chat_history=history, trace=trace
    ):
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
        "category": case.get("category", "未分类"),
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
    批量评测：构建独立的评测 Agent（temperature=0）并发运行

    Args:
        cases: 用例列表

    Returns:
        评估结果列表（与用例顺序一致）
    """
    agent = ReActAgent(tools=all_tools, tool_groups=TOOL_GROUPS, temperature=0.0)
    semaphore = asyncio.Semaphore(EVAL_CONCURRENCY)

    async def _run(index: int, case: dict) -> dict:
        async with semaphore:
            logger.info(f"评测进度: {index}/{len(cases)} - {case['query'][:40]}")
            try:
                return await evaluate_agent_case(agent, case)
            except Exception as e:
                logger.error(f"用例评测失败: {case['query']}, 错误: {e}", exc_info=True)
                expected = set(case.get("expected_tools", []))
                return {
                    "category": case.get("category", "未分类"),
                    "query": case["query"],
                    "expected_tools": case.get("expected_tools", []),
                    "called_tools": [],
                    "tool_hit": False,
                    "missing_tools": sorted(expected),
                    "extra_tools": [],
                    "rounds": 0,
                    "total_time_ms": 0,
                    "answer": "",
                    "keyword_hits": count_keyword_hits(
                        "", case.get("expected_keywords", [])
                    ),
                    "judge": {"relevance": None, "reason": f"评测异常: {e}"},
                    "trace": [],
                }

    results = await asyncio.gather(
        *(_run(i, case) for i, case in enumerate(cases, 1))
    )
    return list(results)


def print_agent_report(results: list[dict]) -> None:
    """打印全量评测报告：分类别汇总 + 逐用例明细 + 总汇总"""
    print("\n" + "=" * 96)
    print("Agent 层评测明细")
    print("=" * 96)

    for r in results:
        mark = "PASS" if r["tool_hit"] else "FAIL"
        expected = "+".join(r["expected_tools"]) or "（零调用）"
        called = "+".join(r["called_tools"]) or "（无）"
        relevance = r["judge"].get("relevance")
        relevance_str = "-" if relevance is None else str(relevance)
        print(f"\n[{mark}] [{r['category']}] {r['query']}")
        print(f"  期望工具: {expected}")
        print(f"  实际调用: {called}  轮数: {r['rounds']}  耗时: {r['total_time_ms']}ms  相关性: {relevance_str}/5")
        if r["missing_tools"]:
            print(f"  漏调: {', '.join(r['missing_tools'])}")
        if r["extra_tools"]:
            print(f"  多调: {', '.join(r['extra_tools'])}")
        answer = r["answer"]
        print(f"  回答: {answer[:150]}{'...' if len(answer) > 150 else ''}")

    # ── 分类别准确率 ──
    categories: dict[str, list[dict]] = {}
    for r in results:
        categories.setdefault(r["category"], []).append(r)

    print("\n" + "#" * 96)
    print("# 分类别准确率")
    print("#" * 96)
    for name, rs in categories.items():
        hits = sum(1 for r in rs if r["tool_hit"])
        avg_rounds = sum(r["rounds"] for r in rs) / len(rs)
        print(f"  {name:<10} {hits}/{len(rs)} ({hits / len(rs):.0%})   平均轮数 {avg_rounds:.2f}")

    # ── 总汇总 ──
    print("\n" + "#" * 96)
    print("# 总汇总")
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
            print(f"    - [{r['category']}] {r['query']}（{'；'.join(reason)}）")

    print("\n" + "#" * 96 + "\n")


async def _demo():
    """直接运行本模块即执行全量评测"""
    results = await evaluate_all(AGENT_TEST_CASES)
    print_agent_report(results)


if __name__ == "__main__":
    logging.basicConfig(level=logging.WARNING)  # 减少日志干扰，只看评测输出
    asyncio.run(_demo())
