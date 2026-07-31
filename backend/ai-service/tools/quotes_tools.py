import json

import httpx
from langchain_core.tools import tool

import config

JAVA_URL = config.JAVA_BACKEND_URL


@tool
async def get_daily_quotes() -> str:
    """获取每日语录，返回今日推荐的名言或语录。当用户问"今日语录"、"每日一句"时使用此工具，其他情况下不要主动调用。"""
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.get(f"{JAVA_URL}/api/quotes/daily")
        data = resp.json()
        quotes = data.get("data") or {}.get("quotes", [])
        return json.dumps({
            "quotes": quotes,
        }, ensure_ascii=False)


quotes_tools = [get_daily_quotes]
