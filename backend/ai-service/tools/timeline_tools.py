import json

import httpx
from langchain_core.tools import tool

import config

JAVA_URL = config.JAVA_BACKEND_URL


@tool
async def get_timeline() -> str:
    """获取博客时间线信息，展示文章发布的历史时间轴。当用户问"博客时间线"、"文章发布历史"时使用此工具。"""
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.get(f"{JAVA_URL}/api/timeline")
        data = resp.json()
        timeline = data.get("data") or {}.get("timeline", [])
        return json.dumps({
            "timeline": timeline,
        }, ensure_ascii=False)


timeline_tools = [get_timeline]
