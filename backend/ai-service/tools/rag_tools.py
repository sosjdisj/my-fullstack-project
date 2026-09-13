"""RAG 知识库检索工具

把 RAG 检索封装为 Agent 的一个工具（agentic RAG）：
由模型自主决定是否检索、用什么关键词检索，检索结果为空时
可根据返回的 hint 改写关键词重试，替代原来 chat 路由里的前置流水线。
"""

import json

from langchain_core.tools import tool

from services.rag import retrieve_relevant_chunks


@tool
async def search_blog_knowledge(query: str) -> str:
    """检索博客文章的正文片段，回答"某篇文章讲了什么"、"作者对某事的看法/观点"等文章内容细节问题。
    注意与 search_articles 区分：按标题/关键词找文章列表用 search_articles；查歌曲、歌单、标签等业务数据用对应工具；闲聊不要用本工具。
    如果返回的 chunks 为空，按 hint 提示换更短、更核心的关键词重新检索（最多重试 2 次），仍为空则直接告知用户没找到相关内容。"""
    chunks = await retrieve_relevant_chunks(query, top_k=5)
    if not chunks:
        return json.dumps(
            {
                "chunks": [],
                "hint": "未检索到相关内容，可换更短的核心词再检索一次；仍为空则直接告知用户没有找到",
            },
            ensure_ascii=False,
        )
    return json.dumps(
        {
            "chunks": [
                {
                    "article_title": item["chunk"].get("article_title", ""),
                    "heading": item["chunk"].get("heading", ""),
                    "content": item["chunk"].get("content", ""),
                    "score": round(item.get("score", 0.0), 4),
                }
                for item in chunks
            ]
        },
        ensure_ascii=False,
    )


rag_tools = [search_blog_knowledge]
