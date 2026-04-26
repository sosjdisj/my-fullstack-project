import { tool } from "langchain";
import { z } from "zod";
import { getChartsData, getlikeSongs } from '@/service/songs.service';

// 工具1：获取音乐榜单
export const getMusicChartsTool = tool(
    async ({ tagNames, limit }) => {
        const charts = await getChartsData(tagNames, limit);
        return JSON.stringify({
            charts: charts.map(chart => ({
                title: chart.title,
                frequency: chart.frequency,
                songs: chart.songs.map(song => ({
                    name: song.name,
                    artist: song.artist,
                    playback: song.playback
                }))
            })),
            note: "请根据上述榜单数据，用自然语言向用户介绍各个榜单的热门歌曲，不要直接显示 JSON。"
        });
    },
    {
        name: "get_music_charts",
        description: "获取音乐榜单数据，支持华语、日语、欧美等分类榜单",
        schema: z.object({
            tagNames: z.array(z.string()).describe("榜单分类名称数组，如['华语', '日语', '欧美']"),
            limit: z.number().default(5).describe("每个榜单返回的歌曲数量"),
        }),
    }
);

// 工具2：获取用户喜欢的歌曲
export const getUserLikedSongsTool = tool(
    async ({ userId, page, size }) => {
        const songs = await getlikeSongs(userId, page, size);
        return JSON.stringify({
            songs: songs.map(song => ({
                name: song.name,
                singer: song.singer,
                duration: song.duration
            })),
            note: "请根据上述歌曲列表，用自然语言向用户介绍他们喜欢的歌曲，不要直接显示 JSON。"
        });
    },
    {
        name: "get_user_liked_songs",
        description: "获取用户喜欢的歌曲列表",
        schema: z.object({
            userId: z.number().describe("用户ID"),
            page: z.number().default(1).describe("页码"),
            size: z.number().default(10).describe("每页数量"),
        }),
    }
);

// 导出音乐相关工具数组
export const songsTools = [getMusicChartsTool, getUserLikedSongsTool];
