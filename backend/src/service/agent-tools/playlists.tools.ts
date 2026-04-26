import { tool } from "langchain";
import { z } from "zod";
import { getPlaylist, getDailyPlaylist, getPlaylistCover, getPlaylistSongs } from '@/service/playlists.service';

// 工具1：获取热门歌单
export const getHotPlaylistsTool = tool(
    async ({ limit }) => {
        const playlists = await getPlaylist(limit);
        return JSON.stringify({
            playlists: playlists.map(playlist => ({
                name: playlist.name,
                description: playlist.description,
                playCount: playlist.playCount
            })),
            note: "请根据上述歌单数据，用自然语言向用户推荐热门歌单，不要直接显示 JSON。"
        });
    },
    {
        name: "get_hot_playlists",
        description: "获取热门歌单列表，按播放量排序",
        schema: z.object({
            limit: z.number().default(10).describe("返回的歌单数量"),
        }),
    }
);

// 工具2：获取每日推荐歌单
export const getDailyPlaylistsTool = tool(
    async () => {
        const playlists = await getDailyPlaylist();
        return JSON.stringify({
            playlists: playlists.map(playlist => ({
                name: playlist.name,
                description: playlist.description
            })),
            note: "请根据上述歌单数据，用自然语言向用户推荐今日歌单，不要直接显示 JSON。"
        });
    },
    {
        name: "get_daily_playlists",
        description: "获取每日随机推荐的歌单",
        schema: z.object({}),
    }
);

// 工具3：获取歌单详情和歌曲列表
export const getPlaylistDetailTool = tool(
    async ({ playlistId, page, size }) => {
        const [coverInfo, songs] = await Promise.all([
            getPlaylistCover(playlistId),
            getPlaylistSongs(playlistId, page, size)
        ]);
        return JSON.stringify({
            playlist: {
                name: coverInfo?.name,
                description: coverInfo?.description,
                songs: songs.length
            },
            songs: songs.map(song => ({
                name: song.name,
                singer: song.singer,
                duration: song.duration
            })),
            note: "请根据上述歌单详情和歌曲列表，用自然语言向用户介绍，不要直接显示 JSON。"
        });
    },
    {
        name: "get_playlist_detail",
        description: "获取歌单详情和歌曲列表",
        schema: z.object({
            playlistId: z.string().describe("歌单ID"),
            page: z.number().default(1).describe("页码"),
            size: z.number().default(20).describe("每页歌曲数量"),
        }),
    }
);

// 导出歌单相关工具数组
export const playlistsTools = [getHotPlaylistsTool, getDailyPlaylistsTool, getPlaylistDetailTool];
