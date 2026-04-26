import { tool } from "langchain";
import { z } from "zod";
import {
    likeArticle,
    unlikeArticle,
    collectArticle,
    uncollectArticle,
    getArticleLikeStatus,
    getArticleCollectStatus
} from '@/service/article.service';
import {
    likeSong,
    unlikeSong,
    getSongLikeStatus
} from '@/service/songs.service';
import {
    collectPlaylist,
    uncollectPlaylist,
    getUserCollectStatus
} from '@/service/playlists.service';

// 工具1：点赞文章
export const likeArticleTool = tool(
    async ({ articleId, userId }) => {
        const result = await likeArticle(articleId, userId);
        return JSON.stringify({
            success: true,
            message: "文章点赞成功",
            totalLikes: result,
            note: "请用自然语言告诉用户点赞成功，并告知当前总点赞数。"
        });
    },
    {
        name: "like_article",
        description: "为指定文章点赞，需要文章ID和用户ID",
        schema: z.object({
            articleId: z.string().describe("文章ID"),
            userId: z.number().describe("用户ID"),
        }),
    }
);

// 工具2：取消文章点赞
export const unlikeArticleTool = tool(
    async ({ articleId, userId }) => {
        const result = await unlikeArticle(articleId, userId);
        return JSON.stringify({
            success: true,
            message: "已取消文章点赞",
            totalLikes: result,
            note: "请用自然语言告诉用户取消点赞成功，并告知当前总点赞数。"
        });
    },
    {
        name: "unlike_article",
        description: "取消对指定文章的点赞，需要文章ID和用户ID",
        schema: z.object({
            articleId: z.string().describe("文章ID"),
            userId: z.number().describe("用户ID"),
        }),
    }
);

// 工具3：收藏文章
export const collectArticleTool = tool(
    async ({ articleId, userId }) => {
        const result = await collectArticle(articleId, userId);
        return JSON.stringify({
            success: true,
            message: "文章收藏成功",
            totalCollects: result,
            note: "请用自然语言告诉用户收藏成功，并告知当前总收藏数。"
        });
    },
    {
        name: "collect_article",
        description: "收藏指定文章，需要文章ID和用户ID",
        schema: z.object({
            articleId: z.string().describe("文章ID"),
            userId: z.number().describe("用户ID"),
        }),
    }
);

// 工具4：取消文章收藏
export const uncollectArticleTool = tool(
    async ({ articleId, userId }) => {
        const result = await uncollectArticle(articleId, userId);
        return JSON.stringify({
            success: true,
            message: "已取消文章收藏",
            totalCollects: result,
            note: "请用自然语言告诉用户取消收藏成功，并告知当前总收藏数。"
        });
    },
    {
        name: "uncollect_article",
        description: "取消对指定文章的收藏，需要文章ID和用户ID",
        schema: z.object({
            articleId: z.string().describe("文章ID"),
            userId: z.number().describe("用户ID"),
        }),
    }
);

// 工具5：获取文章点赞状态
export const getArticleLikeStatusTool = tool(
    async ({ articleId, userId }) => {
        const status = await getArticleLikeStatus(articleId, userId);
        return JSON.stringify({
            isLiked: status?.isLiked || false,
            note: "请用自然语言告诉用户是否已点赞该文章。"
        });
    },
    {
        name: "get_article_like_status",
        description: "查询用户对指定文章的点赞状态",
        schema: z.object({
            articleId: z.string().describe("文章ID"),
            userId: z.number().describe("用户ID"),
        }),
    }
);

// 工具6：获取文章收藏状态
export const getArticleCollectStatusTool = tool(
    async ({ articleId, userId }) => {
        const status = await getArticleCollectStatus(articleId, userId);
        return JSON.stringify({
            isCollected: status?.isCollected || false,
            note: "请用自然语言告诉用户是否已收藏该文章。"
        });
    },
    {
        name: "get_article_collect_status",
        description: "查询用户对指定文章的收藏状态",
        schema: z.object({
            articleId: z.string().describe("文章ID"),
            userId: z.number().describe("用户ID"),
        }),
    }
);

// 工具7：点赞歌曲
export const likeSongTool = tool(
    async ({ songId, userId }) => {
        const result = await likeSong(userId, songId);
        return JSON.stringify({
            success: true,
            message: "歌曲点赞成功",
            totalLikes: result,
            note: "请用自然语言告诉用户点赞成功，并告知当前总点赞数。"
        });
    },
    {
        name: "like_song",
        description: "为指定歌曲点赞，需要歌曲ID和用户ID",
        schema: z.object({
            songId: z.string().describe("歌曲ID"),
            userId: z.number().describe("用户ID"),
        }),
    }
);

// 工具8：取消歌曲点赞
export const unlikeSongTool = tool(
    async ({ songId, userId }) => {
        const result = await unlikeSong(userId, songId);
        return JSON.stringify({
            success: true,
            message: "已取消歌曲点赞",
            totalLikes: result,
            note: "请用自然语言告诉用户取消点赞成功，并告知当前总点赞数。"
        });
    },
    {
        name: "unlike_song",
        description: "取消对指定歌曲的点赞，需要歌曲ID和用户ID",
        schema: z.object({
            songId: z.string().describe("歌曲ID"),
            userId: z.number().describe("用户ID"),
        }),
    }
);

// 工具9：获取歌曲点赞状态
export const getSongLikeStatusTool = tool(
    async ({ songId, userId }) => {
        const status = await getSongLikeStatus(userId, songId);
        return JSON.stringify({
            isLiked: status?.isLiked || false,
            note: "请用自然语言告诉用户是否已点赞该歌曲。"
        });
    },
    {
        name: "get_song_like_status",
        description: "查询用户对指定歌曲的点赞状态",
        schema: z.object({
            songId: z.string().describe("歌曲ID"),
            userId: z.number().describe("用户ID"),
        }),
    }
);

// 工具10：收藏歌单
export const collectPlaylistTool = tool(
    async ({ playlistId, userId }) => {
        const result = await collectPlaylist(userId, playlistId);
        return JSON.stringify({
            success: true,
            message: "歌单收藏成功",
            totalCollects: result,
            note: "请用自然语言告诉用户收藏成功，并告知当前总收藏数。"
        });
    },
    {
        name: "collect_playlist",
        description: "收藏指定歌单，需要歌单ID和用户ID",
        schema: z.object({
            playlistId: z.string().describe("歌单ID"),
            userId: z.number().describe("用户ID"),
        }),
    }
);

// 工具11：取消歌单收藏
export const uncollectPlaylistTool = tool(
    async ({ playlistId, userId }) => {
        const result = await uncollectPlaylist(userId, playlistId);
        return JSON.stringify({
            success: true,
            message: "已取消歌单收藏",
            totalCollects: result,
            note: "请用自然语言告诉用户取消收藏成功，并告知当前总收藏数。"
        });
    },
    {
        name: "uncollect_playlist",
        description: "取消对指定歌单的收藏，需要歌单ID和用户ID",
        schema: z.object({
            playlistId: z.string().describe("歌单ID"),
            userId: z.number().describe("用户ID"),
        }),
    }
);

// 工具12：获取歌单收藏状态
export const getPlaylistCollectStatusTool = tool(
    async ({ playlistId, userId }) => {
        const status = await getUserCollectStatus(playlistId, userId);
        return JSON.stringify({
            isCollected: status?.isCanceled || false,
            note: "请用自然语言告诉用户是否已收藏该歌单。"
        });
    },
    {
        name: "get_playlist_collect_status",
        description: "查询用户对指定歌单的收藏状态",
        schema: z.object({
            playlistId: z.string().describe("歌单ID"),
            userId: z.number().describe("用户ID"),
        }),
    }
);

// 导出交互相关工具数组
export const interactionTools = [
    likeArticleTool,
    unlikeArticleTool,
    collectArticleTool,
    uncollectArticleTool,
    getArticleLikeStatusTool,
    getArticleCollectStatusTool,
    likeSongTool,
    unlikeSongTool,
    getSongLikeStatusTool,
    collectPlaylistTool,
    uncollectPlaylistTool,
    getPlaylistCollectStatusTool
];
