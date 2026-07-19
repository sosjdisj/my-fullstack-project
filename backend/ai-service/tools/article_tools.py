from langchain_core.tools import tool
import httpx
import json

import config

JAVA_URL = config.JAVA_BACKEND_URL


@tool
async def search_articles(keyword: str, page: int = 1, size: int = 10) -> str:
    """根据关键词搜索文章列表，返回匹配的文章标题和内容摘要。当用户想查找某个主题/关键词的文章时使用此工具。"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{JAVA_URL}/api/search",
            params={"keyword": keyword, "page": page, "size": size},
        )
        data = resp.json()
        articles = data.get("data") or {}.get("articles", [])
        clean_data = [
            {"title": a.get("title"), "content": a.get("content")}
            for a in articles
        ]
        return json.dumps({
            "total": data.get("data") or {}.get("total", 0),
            "articles": clean_data,
            "note": "把文章标题都列出来告诉用户，不要只说'找到了'却不列哦。没找到就如实说没有。",
        }, ensure_ascii=False)


@tool
async def get_article_titles(keyword: str) -> str:
    """根据关键词搜索文章标题列表。当用户问"有没有标题包含XX的文章"、"找标题里带某词的文章"时使用此工具。"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{JAVA_URL}/api/search/titles",
            params={"keyword": keyword},
        )
        data = resp.json()
        titles = data.get("data") or {}.get("titles", [])
        return json.dumps({
            "titles": titles,
            "note": "把所有标题列出来（用序号 1. 2. 3.），不要只说'找到了'却不列哦。没找到就如实说没有。",
        }, ensure_ascii=False)


article_tools = [search_articles, get_article_titles]
