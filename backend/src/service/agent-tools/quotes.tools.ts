import { tool } from "langchain";
import { z } from "zod";
import { getDailyQuotes } from '@/service/quotes.service';

// 工具1：获取每日名言
export const getDailyQuotesTool = tool(
    async () => {
        const quotes = await getDailyQuotes();
        return JSON.stringify({
            quotes: quotes.map(q => q.content),
            note: "请根据上述名言列表，用自然语言向用户分享这些励志名言，可以挑选几条特别精彩的进行解读，不要直接显示 JSON。"
        });
    },
    {
        name: "get_daily_quotes",
        description: "获取每日随机名言警句",
        schema: z.object({}),
    }
);

// 导出名言相关工具数组
export const quotesTools = [getDailyQuotesTool];
