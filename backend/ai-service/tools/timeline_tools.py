import json

import httpx
from langchain_core.tools import tool

import config
from tools.java_api import extract_list

JAVA_URL = config.JAVA_BACKEND_URL


@tool
async def get_timeline() -> str:
    """获取博客时间线信息，展示文章发布的历史时间轴。当用户问"博客时间线"、"文章发布历史"时使用此工具。"""
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.get(f"{JAVA_URL}/api/timeline")
        return json.dumps({
            "timeline": extract_list(resp.json()),
        }, ensure_ascii=False)


timeline_tools = [get_timeline]
