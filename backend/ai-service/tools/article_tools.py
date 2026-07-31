import json

import httpx
from langchain_core.tools import tool

import config

JAVA_URL = config.JAVA_BACKEND_URL


@tool
async def search_articles(keyword: str, page: int = 1, size: int = 10) -> str:
    """根据关键词搜索文章列表，返回匹配的文章标题和内容摘要。当用户想查找某个主题/关键词的文章时使用此工具。"""
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.get(
            f"{JAVA_URL}/api/search",
            params={"keyword": keyword, "page": page, "size": size},
        )
        data = resp.json()
        inner = data.get("data")
        # 防御性检查：确保 inner 是字典，否则安全降级
        if not isinstance(inner, dict):
            inner = {}
        articles = inner.get("articles", [])
        clean_data = [
            {"title": a.get("title"), "content": a.get("content")}
            for a in articles
            if isinstance(a, dict)
        ]
        return json.dumps({
            "total": inner.get("total", 0),
            "articles": clean_data,
        }, ensure_ascii=False)


@tool
async def get_article_titles(keyword: str) -> str:
    """根据关键词搜索文章标题列表。当用户问"有没有标题包含XX的文章"、"找标题里带某词的文章"时使用此工具。"""
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.get(
            f"{JAVA_URL}/api/search/titles",
            params={"keyword": keyword},
        )
        data = resp.json()
        inner = data.get("data")
        if not isinstance(inner, dict):
            inner = {}
        titles = inner.get("titles", [])
        return json.dumps({
            "titles": titles,
        }, ensure_ascii=False)


article_tools = [search_articles, get_article_titles]
