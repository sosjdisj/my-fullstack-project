import json

import httpx
from langchain_core.tools import tool

import config

JAVA_URL = config.JAVA_BACKEND_URL


@tool
async def get_hot_playlists() -> str:
    """获取热门歌单列表。当用户问"有什么歌单"、"热门歌单"时使用此工具。"""
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.get(f"{JAVA_URL}/api/playlists", params={"mode": "normal"})
        data = resp.json()
        playlists = data.get("data") or {}.get("playlists", [])
        clean_data = [
            {"id": p.get("id"), "name": p.get("name"), "description": p.get("description")}
            for p in playlists
        ]
        return json.dumps({
            "playlists": clean_data,
        }, ensure_ascii=False)


@tool
async def get_daily_playlists() -> str:
    """获取每日推荐歌单列表。当用户问"每日推荐歌单"、"今天推荐什么歌单"时使用此工具。"""
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.get(f"{JAVA_URL}/api/playlists", params={"mode": "daily"})
        data = resp.json()
        playlists = data.get("data") or {}.get("playlists", [])
        clean_data = [
            {"id": p.get("id"), "name": p.get("name"), "description": p.get("description")}
            for p in playlists
        ]
        return json.dumps({
            "playlists": clean_data,
        }, ensure_ascii=False)


@tool
async def get_playlist_detail(playlist_id: str) -> str:
    """获取歌单详情和歌曲列表。当用户想查看某个歌单的具体内容时使用此工具，需要提供歌单 ID。"""
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        info_resp = await client.get(f"{JAVA_URL}/api/playlists/{playlist_id}/info")
        songs_resp = await client.get(f"{JAVA_URL}/api/playlists/{playlist_id}/songs")

        info_data = info_resp.json().get("data") or {}
        songs_data = songs_resp.json().get("data") or {}.get("songs", [])

        clean_songs = [
            {"name": s.get("name"), "artist": s.get("artist")}
            for s in songs_data
        ]
        return json.dumps({
            "playlist": {
                "id": info_data.get("id"),
                "name": info_data.get("name"),
                "description": info_data.get("description"),
            },
            "songs": clean_songs,
        }, ensure_ascii=False)


playlists_tools = [get_hot_playlists, get_daily_playlists, get_playlist_detail]
