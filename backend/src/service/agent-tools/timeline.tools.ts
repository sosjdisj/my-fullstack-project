import { tool } from "langchain";
import { z } from "zod";
import { getTimelineList } from '@/service/timeline.service';

// 工具1：获取时间线文章
export const getTimelineTool = tool(
    async ({ page, size }) => {
        const articles = await getTimelineList(page, size);
        return JSON.stringify({
            articles: articles.map(article => ({
                title: article.title,
                published: article.published
            })),
            note: "请根据上述时间线文章列表，用自然语言向用户介绍最新发布的文章，不要直接显示 JSON。"
        });
    },
    {
        name: "get_timeline",
        description: "获取时间线文章列表，按发布时间倒序排列",
        schema: z.object({
            page: z.number().default(1).describe("页码"),
            size: z.number().default(10).describe("每页数量"),
        }),
    }
);

// 导出时间线相关工具数组
export const timelineTools = [getTimelineTool];
