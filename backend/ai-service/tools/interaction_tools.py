import json

import httpx
from langchain_core.tools import tool

import config

JAVA_URL = config.JAVA_BACKEND_URL


@tool
async def like_article(article_id: str, token: str = "") -> str:
    """点赞文章，需要提供文章 ID 和用户 token"""
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.post(
            f"{JAVA_URL}/api/article/likes",
            json={"articleId": article_id},
            headers=headers,
        )
        data = resp.json()
        return json.dumps({
            "success": data.get("code", 0) == 200 or data.get("success", False),
            "message": "文章点赞成功" if data.get("code", 0) == 200 or data.get("success") else "文章点赞失败",
        }, ensure_ascii=False)


@tool
async def unlike_article(article_id: str, token: str = "") -> str:
    """取消点赞文章，需要提供文章 ID 和用户 token"""
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.delete(
            f"{JAVA_URL}/api/article/likes/{article_id}",
            headers=headers,
        )
        data = resp.json()
        return json.dumps({
            "success": data.get("code", 0) == 200 or data.get("success", False),
            "message": "取消点赞成功" if data.get("code", 0) == 200 or data.get("success") else "取消点赞失败",
        }, ensure_ascii=False)


@tool
async def collect_article(article_id: str, token: str = "") -> str:
    """收藏文章，需要提供文章 ID 和用户 token"""
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.post(
            f"{JAVA_URL}/api/article/collects",
            json={"articleId": article_id},
            headers=headers,
        )
        data = resp.json()
        return json.dumps({
            "success": data.get("code", 0) == 200 or data.get("success", False),
            "message": "文章收藏成功" if data.get("code", 0) == 200 or data.get("success") else "文章收藏失败",
        }, ensure_ascii=False)


@tool
async def uncollect_article(article_id: str, token: str = "") -> str:
    """取消收藏文章，需要提供文章 ID 和用户 token"""
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.delete(
            f"{JAVA_URL}/api/article/collects/{article_id}",
            headers=headers,
        )
        data = resp.json()
        return json.dumps({
            "success": data.get("code", 0) == 200 or data.get("success", False),
            "message": "取消收藏成功" if data.get("code", 0) == 200 or data.get("success") else "取消收藏失败",
        }, ensure_ascii=False)


@tool
async def get_article_like_status(article_id: str, token: str = "") -> str:
    """检查文章是否已点赞，需要提供文章 ID 和用户 token"""
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        # 通过文章详情接口获取点赞状态（详情接口返回 isLiked 字段）
        resp = await client.get(
            f"{JAVA_URL}/api/article/{article_id}",
            headers=headers,
        )
        data = resp.json()
        article_data = data.get("data") or {}
        return json.dumps({
            "article_id": article_id,
            "is_liked": article_data.get("isLiked", False),
        }, ensure_ascii=False)


@tool
async def get_article_collect_status(article_id: str, token: str = "") -> str:
    """检查文章是否已收藏，需要提供文章 ID 和用户 token"""
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        # 通过文章详情接口获取收藏状态（详情接口返回 isCollected 字段）
        resp = await client.get(
            f"{JAVA_URL}/api/article/{article_id}",
            headers=headers,
        )
        data = resp.json()
        article_data = data.get("data") or {}
        return json.dumps({
            "article_id": article_id,
            "is_collected": article_data.get("isCollected", False),
        }, ensure_ascii=False)


@tool
async def like_song(song_id: str, token: str = "") -> str:
    """点赞歌曲，需要提供歌曲 ID 和用户 token"""
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.post(
            f"{JAVA_URL}/api/songs/likes",
            json={"songId": song_id},
            headers=headers,
        )
        data = resp.json()
        return json.dumps({
            "success": data.get("code", 0) == 200 or data.get("success", False),
            "message": "歌曲点赞成功" if data.get("code", 0) == 200 or data.get("success") else "歌曲点赞失败",
        }, ensure_ascii=False)


@tool
async def unlike_song(song_id: str, token: str = "") -> str:
    """取消点赞歌曲，需要提供歌曲 ID 和用户 token"""
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.delete(
            f"{JAVA_URL}/api/songs/{song_id}/likes",
            headers=headers,
        )
        data = resp.json()
        return json.dumps({
            "success": data.get("code", 0) == 200 or data.get("success", False),
            "message": "取消歌曲点赞成功" if data.get("code", 0) == 200 or data.get("success") else "取消歌曲点赞失败",
        }, ensure_ascii=False)


@tool
async def get_song_like_status(song_id: str, token: str = "") -> str:
    """检查歌曲是否已点赞，需要提供歌曲 ID 和用户 token"""
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.get(
            f"{JAVA_URL}/api/songs",
            params={"page": 1, "size": 200},
            headers=headers,
        )
        data = resp.json()
        result = data.get("data") or {}
        liked_songs = result.get("list", [])
        is_liked = any(str(s.get("id")) == song_id for s in liked_songs)
        return json.dumps({
            "song_id": song_id,
            "is_liked": is_liked,
        }, ensure_ascii=False)


@tool
async def collect_playlist(playlist_id: str, token: str = "") -> str:
    """收藏歌单，需要提供歌单 ID 和用户 token"""
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.post(
            f"{JAVA_URL}/api/playlists/collects",
            json={"playlistId": playlist_id},
            headers=headers,
        )
        data = resp.json()
        return json.dumps({
            "success": data.get("code", 0) == 200 or data.get("success", False),
            "message": "歌单收藏成功" if data.get("code", 0) == 200 or data.get("success") else "歌单收藏失败",
        }, ensure_ascii=False)


@tool
async def uncollect_playlist(playlist_id: str, token: str = "") -> str:
    """取消收藏歌单，需要提供歌单 ID 和用户 token"""
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.delete(
            f"{JAVA_URL}/api/playlists/{playlist_id}/collects",
            headers=headers,
        )
        data = resp.json()
        return json.dumps({
            "success": data.get("code", 0) == 200 or data.get("success", False),
            "message": "取消歌单收藏成功" if data.get("code", 0) == 200 or data.get("success") else "取消歌单收藏失败",
        }, ensure_ascii=False)


@tool
async def get_playlist_collect_status(playlist_id: str, token: str = "") -> str:
    """检查歌单是否已收藏，需要提供歌单 ID 和用户 token"""
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient(timeout=config.HTTP_TIMEOUT) as client:
        resp = await client.get(
            f"{JAVA_URL}/api/playlists/{playlist_id}/info",
            headers=headers,
        )
        data = resp.json()
        is_collected = data.get("data") or {}.get("isCollected", False)
        return json.dumps({
            "playlist_id": playlist_id,
            "is_collected": is_collected,
        }, ensure_ascii=False)


interaction_tools = [
    like_article,
    unlike_article,
    collect_article,
    uncollect_article,
    get_article_like_status,
    get_article_collect_status,
    like_song,
    unlike_song,
    get_song_like_status,
    collect_playlist,
    uncollect_playlist,
    get_playlist_collect_status,
]
