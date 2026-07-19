from langchain_core.tools import tool
import httpx
import json

import config

JAVA_URL = config.JAVA_BACKEND_URL


@tool
async def get_categories_list() -> str:
    """获取博客所有分类列表。当用户问"有哪些分类"、"文章都有什么分类"时使用此工具。"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{JAVA_URL}/api/categories")
        data = resp.json()
        categories = data.get("data") or {}.get("categories", [])
        return json.dumps({
            "categories": categories,
            "note": "把分类都列出来告诉用户，不要只说'有分类'却不列哦。没有就如实说暂时没有。",
        }, ensure_ascii=False)


@tool
async def get_articles_by_category(name: str) -> str:
    """根据分类名称获取相关文章列表。当用户问"XX分类下有哪些文章"、"某分类的文章"时使用此工具。"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{JAVA_URL}/api/categories/{name}")
        data = resp.json()
        articles = data.get("data") or {}.get("articles", [])
        clean_data = [
            {"title": a.get("title"), "content": a.get("content")}
            for a in articles
        ]
        return json.dumps({
            "category": name,
            "articles": clean_data,
            "note": "把文章标题都列出来，不要只说'找到了'却不列哦。没有就如实说该分类下没有文章。",
        }, ensure_ascii=False)


categories_tools = [get_categories_list, get_articles_by_category]
