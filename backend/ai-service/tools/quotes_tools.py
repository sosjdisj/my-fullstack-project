from langchain_core.tools import tool
import httpx
import json

import config

JAVA_URL = config.JAVA_BACKEND_URL


@tool
async def get_daily_quotes() -> str:
    """获取每日语录，返回今日推荐的名言或语录。当用户问"今日语录"、"每日一句"时使用此工具，其他情况下不要主动调用。"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{JAVA_URL}/api/quotes/daily")
        data = resp.json()
        quotes = data.get("data") or {}.get("quotes", [])
        return json.dumps({
            "quotes": quotes,
            "note": "把语录完整内容列出来告诉用户，不要只说'有语录'却不列哦。没有就如实说暂时没有。",
        }, ensure_ascii=False)


quotes_tools = [get_daily_quotes]
