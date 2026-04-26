import { tool } from "langchain";
// 👆 引入一个“工具模具”，用它造出来的工具，AI才认得
import { z } from "zod";
// 👆 引入“安检门”，用来校验AI传进来的参数格式对不对
import { searchArticles, getArticleTitles } from '@/service/search.service';
// 👆 引入你原本写好的业务函数（真正查数据库干活的）

// 工具1
export const searchArticlesTool = tool(
    async ({ keyword, page, size }) => {
        const result = await searchArticles({ keyword, page, size });
        const cleanData = result.articlesWithMeta.map(item => ({
            title: item.title,
            content: item.content,
        }));
        return JSON.stringify({
            total: result.total,
            articles: cleanData,
            note: "请根据上述文章列表，用自然语言向用户推荐，不要直接显示 JSON。"
        });
    },
    {
        name: "search_articles",
        description: "根据关键词搜索文章列表...",
        schema: z.object({
            keyword: z.string().describe("搜索关键词"),
            page: z.number().default(1),
            size: z.number().default(10),
        }
        ),
    });

// 工具2：获取文章标题建议
export const getArticleTitlesTool = tool(
    async ({ keyword }) => {
        const titles = await getArticleTitles({ keyword });
        return JSON.stringify({
            titles: titles,
            note: "请根据上述标题列表，用自然语言向用户推荐相关文章标题，不要直接显示 JSON。"
        });
    },
    {
        name: "get_article_titles",
        description: "根据关键词获取相关文章标题建议，用于搜索自动补全",
        schema: z.object({
            keyword: z.string().describe("搜索关键词前缀"),
        }),
    }
);

// 导出文章相关工具数组
export const articleTools = [searchArticlesTool, getArticleTitlesTool];