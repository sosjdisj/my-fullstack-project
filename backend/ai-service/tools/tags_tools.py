import json

import httpx
from langchain_core.tools import tool

import config
from tools.java_api import extract_list

JAVA_URL = config.JAVA_BACKEND_URL


@tool
async def get_tags_list() -> str:
    """获取博客所有标签列表。当用户问"有哪些标签"、"文章都有什么分类标签"时使用此工具。"""
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.get(f"{JAVA_URL}/api/tags")
        return json.dumps({
            "tags": extract_list(resp.json()),
        }, ensure_ascii=False)


@tool
async def get_articles_by_tag(name: str) -> str:
    """根据标签名称获取相关文章列表。当用户问"XX标签下有哪些文章"、"带某标签的文章"时使用此工具。"""
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.get(f"{JAVA_URL}/api/tags/{name}")
        clean_data = [
            {"title": a.get("title"), "content": a.get("content")}
            for a in extract_list(resp.json())
        ]
        return json.dumps({
            "tag": name,
            "articles": clean_data,
        }, ensure_ascii=False)


tags_tools = [get_tags_list, get_articles_by_tag]
