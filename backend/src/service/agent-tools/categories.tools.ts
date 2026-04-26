import { tool } from "langchain";
import { z } from "zod";
import { getCategoriesList, getArticlesByCategory } from '@/service/categories.service';

// 工具1：获取分类列表
export const getCategoriesListTool = tool(
    async ({ page, size }) => {
        const categories = await getCategoriesList(page, size);
        return JSON.stringify({
            categories: categories.map(category => ({
                name: category.name,
                articleCount: category.articleCount
            })),
            note: "请根据上述分类列表，用自然语言向用户介绍各个分类及其文章数量，不要直接显示 JSON。"
        });
    },
    {
        name: "get_categories_list",
        description: "获取文章分类列表及每个分类下的文章数量",
        schema: z.object({
            page: z.number().default(1).describe("页码"),
            size: z.number().default(10).describe("每页数量"),
        }),
    }
);

// 工具2：根据分类获取文章
export const getArticlesByCategoryTool = tool(
    async ({ categoryName, page, size }) => {
        const articles = await getArticlesByCategory(categoryName, page, size);
        return JSON.stringify({
            category: categoryName,
            articles: articles.map(article => ({
                title: article.title,
                content: article.content?.substring(0, 100) + '...'
            })),
            note: "请根据上述文章列表，用自然语言向用户推荐相关文章，不要直接显示 JSON。"
        });
    },
    {
        name: "get_articles_by_category",
        description: "根据分类名称获取相关文章列表",
        schema: z.object({
            categoryName: z.string().describe("分类名称"),
            page: z.number().default(1).describe("页码"),
            size: z.number().default(10).describe("每页数量"),
        }),
    }
);

// 导出分类相关工具数组
export const categoriesTools = [getCategoriesListTool, getArticlesByCategoryTool];
