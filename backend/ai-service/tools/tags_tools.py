from langchain_core.tools import tool
import httpx
import json

import config

JAVA_URL = config.JAVA_BACKEND_URL


@tool
async def get_tags_list() -> str:
    """获取博客所有标签列表。当用户问"有哪些标签"、"文章都有什么分类标签"时使用此工具。"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{JAVA_URL}/api/tags")
        data = resp.json()
        tags = data.get("data") or {}.get("tags", [])
        return json.dumps({
            "tags": tags,
            "note": "把标签都列出来告诉用户，不要只说'有标签'却不列哦。没有就如实说暂时没有。",
        }, ensure_ascii=False)


@tool
async def get_articles_by_tag(name: str) -> str:
    """根据标签名称获取相关文章列表。当用户问"XX标签下有哪些文章"、"带某标签的文章"时使用此工具。"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{JAVA_URL}/api/tags/{name}")
        data = resp.json()
        articles = data.get("data") or {}.get("articles", [])
        clean_data = [
            {"title": a.get("title"), "content": a.get("content")}
            for a in articles
        ]
        return json.dumps({
            "tag": name,
            "articles": clean_data,
            "note": "把文章标题都列出来，不要只说'找到了'却不列哦。没有就如实说该标签下没有文章。",
        }, ensure_ascii=False)


tags_tools = [get_tags_list, get_articles_by_tag]
