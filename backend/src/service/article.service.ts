import Article from '@/models/Article'
import UserArticleInteraction from '@/models/UserArticleInteraction'
import Comments from '@/models/Comments'
import Categories from '@/models/Categories'
import Tags from '@/models/Tags'
import { prisma } from '@/config/db'

// 获取文章列表（分页）
export async function getArticleList(page: number, size: number) {
    const skip = (page - 1) * size
    const query = { deleted: { $ne: true }, status: 'PUBLIC' };
    const activeQuery = { deleted: { $ne: true }, status: 'ACTIVE' }

    const articles = await Article.find(query).skip(skip).limit(size)
        .select('_id title published tag category content cover').lean()

    // 截取 content 长度
    articles.forEach(article => {
        if (article.content) {
            article.content = article.content.substring(0, 40)
        }
    })

    const categoryIds = [...new Set(articles.map(a => a.category).filter(Boolean))];
    const tagIds = [...new Set(articles.map(a => a.tag).filter(Boolean))];

    const [categorys, tags] = await Promise.all([
        Categories.find({ _id: { $in: categoryIds }, ...activeQuery }).select('_id name'),
        Tags.find({ _id: { $in: tagIds }, ...activeQuery }).select('_id name')
    ])

    const categoryMap = new Map(categorys.map(c => [c._id.toString(), c.name]));
    const tagMap = new Map(tags.map(t => [t._id.toString(), t.name]));

    // 4. 过滤并格式化最终结果
    const formattedArticles = articles
        .map(article => ({
            ...article,
            category: categoryMap.get(article.category?.toString()) || '',
            tag: tagMap.get(article.tag?.toString()) || '',
        }));

    return formattedArticles
}

// 获取文章详情
export async function getArticleById(id: string, userId?: number) {
    const activeQuery = { deleted: { $ne: true }, status: 'ACTIVE' };
    const publicActiveFilter = { deleted: { $ne: true }, status: 'PUBLIC' };
    const commentsQuery = { deleted: { $ne: true }, reviewStatus: 'APPROVED' }
    let isLiked = false
    let isCollected = false

    const [articleData, nextArticle, prevArticle, commentCount] = await Promise.all([
        Article.findById(id).select('-status -deleted').lean(),
        Article.findOne({ _id: { $lt: id }, ...publicActiveFilter })
            .sort({ _id: -1 })
            .select('_id title')
            .lean(),
        Article.findOne({ _id: { $gt: id }, ...publicActiveFilter })
            .sort({ _id: 1 })
            .select('_id title')
            .lean(),
        Comments.countDocuments({ articleId: id, ...commentsQuery })
    ])

    if (userId) {
        const [likeInteraction, collectInteraction] = await Promise.all([
            UserArticleInteraction.findOne(
                {
                    articleId: id,
                    userId
                }
            ).select('isLiked').lean(),
            UserArticleInteraction.findOne(
                {
                    articleId: id,
                    userId
                }
            ).select('isCollected').lean(),
        ])
        if (likeInteraction) {
            isLiked = likeInteraction.isLiked
        }
        if (collectInteraction) {
            isCollected = collectInteraction.isCollected
        }
    }

    let article: any = {}
    // 获取分类和标签名称
    if (articleData) {
        const [author, category, tag] = await Promise.all([
            prisma.user.findFirst({
                where: {
                    user_id: article.author,
                    deleted: 0
                },
                select: { user_id: true, username: true, cover: true }
            }),
            articleData.category ? Categories.findOne({ _id: articleData.category, ...activeQuery }).select('name').lean() : null,
            articleData.tag ? Tags.findOne({ _id: articleData.tag, ...activeQuery }).select('name').lean() : null
        ])

        article = {
            ...articleData,
            comments: commentCount,
            category: category?.name || '',
            author: author?.username,
            avatar: author?.cover,
            tag: tag?.name || '',
            isLiked,
            isCollected
        }
    }

    return { article, prevArticle, nextArticle }
}

// 获取随机3篇文章
export async function getRandomArticles() {
    const query = { deleted: { $ne: true }, status: 'PUBLIC' };
    const activeQuery = { deleted: { $ne: true }, status: 'ACTIVE' };

    const articles = await Article.aggregate([
        { $match: query },
        { $sample: { size: 3 } },
        {
            $project: {
                _id: 1,
                title: 1,
                cover: 1,
                published: 1,
            }
        }
    ])

    // 获取分类和标签名称
    const categoryIds = [...new Set(articles.map(a => a.category).filter(Boolean))]
    const tagIds = [...new Set(articles.map(a => a.tag).filter(Boolean))]

    const [categories, tags] = await Promise.all([
        Categories.find({ _id: { $in: categoryIds }, ...activeQuery }).select('_id name').lean(),
        Tags.find({ _id: { $in: tagIds }, ...activeQuery }).select('_id name').lean()
    ])

    const categoryMap = new Map(categories.map(c => [c._id.toString(), c.name]))
    const tagMap = new Map(tags.map(t => [t._id.toString(), t.name]))

    return articles.map(article => ({
        ...article,
        category: categoryMap.get(article.category?.toString()) || '',
        tag: tagMap.get(article.tag?.toString()) || ''
    }))
}

// 获取文章点赞状态
export async function getArticleLikeStatus(articleId: string, userId: number) {
    return await UserArticleInteraction.findOne({ articleId, userId })
        .select('isLiked')
}

// 获取文章收藏状态
export async function getArticleCollectStatus(articleId: string, userId: number) {
    return await UserArticleInteraction.findOne({ articleId, userId })
        .select('isCollected')
}

// 点赞文章
export async function likeArticle(articleId: string, userId: number) {
    await Promise.all([
        Article.updateOne(
            { _id: articleId },
            {
                $inc: { likes: 1 }
            }
        ),
        UserArticleInteraction.updateOne(
            { articleId, userId },
            { isLiked: true },
            { upsert: true }
        ),
    ])

    const interactionCount = await UserArticleInteraction.countDocuments({ articleId, isLiked: true })

    return interactionCount
}

// 取消点赞
export async function unlikeArticle(articleId: string, userId: number) {
    await Promise.all([
        Article.updateOne(
            { _id: articleId, likes: { $gt: 0 } },
            {
                $inc: { likes: -1 }
            }
        ),
        UserArticleInteraction.updateOne(
            { articleId, userId },
            { isLiked: false }
        ),
    ])

    const interactionCount = await UserArticleInteraction.countDocuments({ articleId, isLiked: true })

    return interactionCount
}

// 收藏文章
export async function collectArticle(articleId: string, userId: number) {
    await Promise.all([
        Article.updateOne(
            { _id: articleId },
            {
                $inc: { collects: 1 }
            }
        ),
        UserArticleInteraction.updateOne(
            { articleId, userId },
            { isCollected: true },
            { upsert: true }
        ),
    ])
    const interactionCount = await UserArticleInteraction.countDocuments({ articleId, isCollected: true })

    return interactionCount
}

// 取消收藏
export async function uncollectArticle(articleId: string, userId: number) {
    await Promise.all([
        Article.updateOne(
            { _id: articleId, collects: { $gt: 0 } },
            {
                $inc: { collects: -1 }
            }
        ),
        UserArticleInteraction.updateOne(
            { articleId, userId },
            { isCollected: false }
        ),
    ])

    const interactionCount = await UserArticleInteraction.countDocuments({ articleId, isCollected: true })

    return interactionCount
}

export async function getArticleComments(articleId: string, page: number, size: number) {
    const skip = (page - 1) * size
    const query = { deleted: { $ne: true }, reviewStatus: 'APPROVED' };

    const comments = await Comments.find({ articleId, ...query })
        .select('_id userId content createTime')
        .skip(skip)
        .limit(size)
        .lean()

    const authorIds = [...new Set(comments.map(a => a.userId).filter(Boolean))];

    const userInfo = await prisma.user.findMany({
        where: {
            user_id: { in: authorIds },
            deleted: 0
        },
        select: { user_id: true, username: true, cover: true }
    })

    const authorMap = new Map(userInfo.map(u => [u.user_id, u.username]));
    const avatarMap = new Map(userInfo.map(u => [u.user_id, u.cover]));

    const formattedArticles = comments
        .filter(comment => authorMap.has(comment.userId))
        .map(comment => ({
            ...comment,
            username: authorMap.get(comment.userId) || '',
            avatar: avatarMap.get(comment.userId)
        }));

    return formattedArticles
}

export async function createArticleComment(content: string, userId: number, articleId: string) {

    await Comments.create({
        userId,
        articleId,
        content: content.trim(),
        createTime: new Date()
    })

    const commentCount = await Comments.countDocuments({ articleId })

    return commentCount
}

// 检查用户是否发送太频繁
export async function checkRecentMessage(userId: number): Promise<boolean> {
    const recentMessage = await Comments.findOne({
        userId,
        createTime: { $gt: new Date(Date.now() - 10 * 1000) }
    })
    return !!recentMessage
}
