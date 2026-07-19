from langchain_core.tools import tool
import httpx
import json

import config

JAVA_URL = config.JAVA_BACKEND_URL


@tool
async def get_timeline() -> str:
    """获取博客时间线信息，展示文章发布的历史时间轴。当用户问"博客时间线"、"文章发布历史"时使用此工具。"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{JAVA_URL}/api/timeline")
        data = resp.json()
        timeline = data.get("data") or {}.get("timeline", [])
        return json.dumps({
            "timeline": timeline,
            "note": "把时间线条目都列出来告诉用户，不要只说'有时间线'却不列哦。没有就如实说暂时没有。",
        }, ensure_ascii=False)


timeline_tools = [get_timeline]
