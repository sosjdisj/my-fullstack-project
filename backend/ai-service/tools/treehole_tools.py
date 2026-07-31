import json

import httpx
from langchain_core.tools import tool

import config

JAVA_URL = config.JAVA_BACKEND_URL


@tool
async def get_treehole_messages() -> str:
    """获取树洞消息列表，树洞是匿名分享心情和想法的地方。当用户问"树洞"、"看看大家说了什么"时使用此工具。"""
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.get(f"{JAVA_URL}/api/treehole")
        data = resp.json()
        messages = data.get("data") or {}.get("messages", [])
        return json.dumps({
            "messages": messages,
        }, ensure_ascii=False)


treehole_tools = [get_treehole_messages]
