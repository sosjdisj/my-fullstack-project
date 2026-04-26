import { tool } from "langchain";
import { z } from "zod";
import { getTagsList, getArticlesByTag } from '@/service/tags.service';

// 工具1：获取标签列表
export const getTagsListTool = tool(
    async ({ page, size }) => {
        const tags = await getTagsList(page, size);
        return JSON.stringify({
            tags: tags.map(tag => ({
                name: tag.name,
                articleCount: tag.articleCount
            })),
            note: "请根据上述标签列表，用自然语言向用户介绍各个标签及其文章数量，不要直接显示 JSON。"
        });
    },
    {
        name: "get_tags_list",
        description: "获取文章标签列表及每个标签下的文章数量",
        schema: z.object({
            page: z.number().default(1).describe("页码"),
            size: z.number().default(10).describe("每页数量"),
        }),
    }
);

// 工具2：根据标签获取文章
export const getArticlesByTagTool = tool(
    async ({ tagName, page, size }) => {
        const articles = await getArticlesByTag(tagName, page, size);
        return JSON.stringify({
            tag: tagName,
            articles: articles.map(article => ({
                title: article.title,
                content: article.content?.substring(0, 100) + '...'
            })),
            note: "请根据上述文章列表，用自然语言向用户推荐相关文章，不要直接显示 JSON。"
        });
    },
    {
        name: "get_articles_by_tag",
        description: "根据标签名称获取相关文章列表",
        schema: z.object({
            tagName: z.string().describe("标签名称"),
            page: z.number().default(1).describe("页码"),
            size: z.number().default(10).describe("每页数量"),
        }),
    }
);

// 导出标签相关工具数组
export const tagsTools = [getTagsListTool, getArticlesByTagTool];
