import json

import httpx
from langchain_core.tools import tool

import config
from tools.java_api import extract_data, extract_list

JAVA_URL = config.JAVA_BACKEND_URL


@tool
async def search_articles(keyword: str, page: int = 1, size: int = 10) -> str:
    """根据关键词搜索文章列表，返回匹配的文章标题和内容摘要。当用户想查找某个主题/关键词的文章时使用此工具。"""
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.get(
            f"{JAVA_URL}/api/search",
            params={"keyword": keyword, "page": page, "size": size},
        )
        payload = resp.json()
        # /api/search 的 data 为分页对象 {total, size, page, list: [...]}
        clean_data = [
            {"title": a.get("title"), "content": a.get("content")}
            for a in extract_list(payload)
            if isinstance(a, dict)
        ]
        return json.dumps({
            "total": extract_data(payload).get("total", 0),
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
        # /api/search/titles 的 data 直接是标题字符串数组
        return json.dumps({
            "titles": extract_list(resp.json()),
        }, ensure_ascii=False)


article_tools = [search_articles, get_article_titles]
