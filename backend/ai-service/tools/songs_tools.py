import json

import httpx
from langchain_core.tools import tool

import config

JAVA_URL = config.JAVA_BACKEND_URL


@tool
async def get_music_charts(tag_names: str = "") -> str:
    """获取音乐排行榜，可以按标签筛选。当用户想听歌、看热门音乐、查看排行榜时使用此工具。tag_names 为逗号分隔的标签名称，如"华语,日语"。"""
    params = {}
    if tag_names:
        params["tagNames"] = tag_names
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.get(f"{JAVA_URL}/api/songs/charts", params=params)
        data = resp.json()
        songs = data.get("data") or {}.get("songs", [])
        clean_data = [
            {"name": s.get("name"), "artist": s.get("artist"), "tag": s.get("tag")}
            for s in songs
        ]
        return json.dumps({
            "songs": clean_data,
        }, ensure_ascii=False)


@tool
async def get_user_liked_songs(token: str = "") -> str:
    """获取当前用户喜欢的歌曲列表。当用户问"我喜欢的歌"、"我点赞过哪些歌"时使用此工具。需要提供用户 token。"""
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.get(f"{JAVA_URL}/api/songs", headers=headers)
        data = resp.json()
        songs = data.get("data") or {}.get("songs", [])
        clean_data = [
            {"name": s.get("name"), "artist": s.get("artist")}
            for s in songs
        ]
        return json.dumps({
            "liked_songs": clean_data,
        }, ensure_ascii=False)


songs_tools = [get_music_charts, get_user_liked_songs]
