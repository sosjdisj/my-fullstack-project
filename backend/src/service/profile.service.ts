import UserArticleInteraction from "@/models/UserArticleInteraction";
import Article from "@/models/Article";
import Categories from "@/models/Categories";
import Tags from "@/models/Tags";
import { prisma } from "@/config/db";

/**
 * 获取用户收藏的文章列表
 * @param userId 用户ID
 * @param skip 跳过的记录数
 * @param size 每页大小
 * @returns 收藏的文章列表，包含图片路径、标题、分类和发布时间
 */
export async function getArticlesCollectedId(userId: number, skip: number, size: number) {
    const articlesCollectedId = await UserArticleInteraction.find({ userId, isCollected: true })
        .skip(skip)
        .limit(size)
        .select('articleId')

    const articlesCollectedIdArr = articlesCollectedId.map(item => item.articleId)

    const articles = await Article.find({ _id: { $in: articlesCollectedIdArr } })
        .skip(skip)
        .limit(size)
        .select('cover title category published tag content').lean()

    const categoryIds = [...new Set(articles.map(a => a.category).filter(Boolean))];
    const tagIds = [...new Set(articles.map(a => a.tag).filter(Boolean))];

    const activeQuery = { deleted: { $ne: true }, status: 'ACTIVE' }

    const [categorys, tags] = await Promise.all([
        Categories.find({ _id: { $in: categoryIds }, ...activeQuery })
            .select('_id name'),
        Tags.find({ _id: { $in: tagIds }, ...activeQuery })
            .select('_id name'),
    ])

    const categoryMap = new Map(categorys.map(c => [c._id.toString(), c.name]));
    const tagMap = new Map(tags.map(c => [c._id.toString(), c.name]));

    const formattedArticles = articles
        .map(article => {
            // 提取纯文本内容并截取前30字
            let contentPreview = article.content || ''

            // 移除 HTML 标签，只保留纯文本
            contentPreview = contentPreview.replace(/<[^>]+>/g, '')

            // 截取前30个字符，如果超过则添加省略号
            contentPreview = contentPreview.length > 30
                ? contentPreview.substring(0, 30)
                : contentPreview

            return {
                ...article,
                category: categoryMap.get(article.category?.toString()) || '',
                tag: tagMap.get(article.tag?.toString()) || '',
                content: contentPreview  // 替换为摘要内容
            }
        });

    return formattedArticles
}

/**
 * 获取用户个人信息
 * @param userId 用户ID
 * @returns 用户个人信息，包含用户名、签名、头像等
 */
export async function getProfile(userId: number) {
    const userInfo = await prisma.user.findUnique({
        where: {
            user_id: userId
        },
        select: {
            username: true,
            signature: true,
            cover: true,
            phone: true,
            publish_time: true,
            update_time: true,
        }
    });

    return userInfo;
}

/**
 * 更新用户个人信息
 * @param userId 用户ID
 * @param updateData 要更新的数据
 * @returns 更新后的用户个人信息
 */
export async function updateProfile(userId: number, updateData: {
    username?: string;
    signature?: string;
    cover?: string;
    phone?: string;
}) {
    await prisma.user.update({
        where: {
            user_id: userId
        },
        data: {
            ...updateData,
            update_time: new Date()
        },
        select: {
            user_id: true,
            username: true,
            signature: true,
            cover: true,
            phone: true,
            publish_time: true,
            update_time: true,
        }
    });
}

/**
 * 根据关键词搜索用户收藏的文章
 * @param userId 用户ID
 * @param skip 跳过的记录数
 * @param size 每页大小
 * @param keyword 搜索关键词
 * @returns 符合关键词的收藏文章列表，包含图片路径、标题、分类和发布时间
 */
export async function getKeywordArticles(userId: number, skip: number, size: number, keyword: string) {
    const articlesCollectedId = await UserArticleInteraction.find({ userId, isCollected: true })
        .skip(skip)
        .limit(size)
        .select('articleId')

    const articlesCollectedIdArr = articlesCollectedId.map(item => item.articleId)

    const articles = await Article.find({
        _id: { $in: articlesCollectedIdArr },
        $or: [
            { title: { $regex: keyword, $options: 'i' } },
        ]
    })
        .skip(skip)
        .limit(size)
        .select('cover title category published').lean()

    const categoryIds = [...new Set(articles.map(a => a.category).filter(Boolean))];

    const activeQuery = { deleted: { $ne: true }, status: 'ACTIVE' }

    const categorys = await Categories.find({ _id: { $in: categoryIds }, ...activeQuery })
        .select('_id name')

    const categoryMap = new Map(categorys.map(c => [c._id.toString(), c.name]));

    const formattedArticles = articles
        .map(article => ({
            ...article,
            category: categoryMap.get(article.category?.toString()) || '',
        }));

    return formattedArticles
}