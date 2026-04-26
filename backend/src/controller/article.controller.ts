import { Request, Response } from 'express'
import * as articleService from '@/service/article.service'
import { validateParams, getAuthenticatedUser } from '@/utils/validateQueryParams'
import { PageQuerySchema, idSchema, danmuSchema } from '@/utils/validationSchemas'

// 获取文章列表
export async function getArticleList(req: Request, res: Response) {
    const validateResult = validateParams(req.query, res, PageQuerySchema)

    if (!validateResult.valid) return

    const { page, size } = validateResult.data
    const articleList = await articleService.getArticleList(page, size)

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: {
            list: articleList,
            page,
            size
        }
    })
}

// 获取文章详情
export async function getArticleDetail(req: Request, res: Response) {
    let userId: undefined | number = undefined

    if (req.auth) userId = req.auth.userId

    const validateId = validateParams(req.params, res, idSchema)

    if (!validateId.valid) return;

    const { id } = validateId.data
    const { article, prevArticle, nextArticle } = await articleService.getArticleById(id, userId)

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: {
            detail: article,
            prev: prevArticle ? { _id: prevArticle._id, title: prevArticle.title } : null,
            next: nextArticle ? { _id: nextArticle._id, title: nextArticle.title } : null
        }
    })
}

// 获取随机文章
export async function getRandomArticles(req: Request, res: Response) {
    const articleList = await articleService.getRandomArticles()

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: {
            list: articleList
        }
    })
}

// 点赞文章
export async function likeArticle(req: Request, res: Response) {
    const userInfo = getAuthenticatedUser(req, res)

    if (!userInfo) return;

    const validateId = validateParams(req.body, res, idSchema)

    if (!validateId.valid) return

    const { id } = validateId.data
    const { userId } = userInfo

    const articleLikeStatus = await articleService.getArticleLikeStatus(id, userId)

    if (articleLikeStatus?.isLiked) {
        return res.status(409).json({
            code: 409,
            message: '已经点赞啦~'
        })
    }
    const updatedLikes = await articleService.likeArticle(id, userId)

    return res.status(200).json({
        code: 200,
        message: '感谢你的喜欢～',
        data: {
            updatedLikes: updatedLikes,
            status: 'like'
        }
    })
}

// 取消点赞
export async function unlikeArticle(req: Request, res: Response) {
    const validateId = validateParams(req.params, res, idSchema)

    if (!validateId.valid) return

    const userInfo = getAuthenticatedUser(req, res)

    if (!userInfo) return;

    const { id } = validateId.data
    const { userId } = userInfo

    const articleLikeStatus = await articleService.getArticleLikeStatus(id, userId)

    if (!articleLikeStatus?.isLiked) {
        return res.status(409).json({
            code: 409,
            message: '你还没给这篇文章点赞哦~'
        })
    }

    const interactionCount = await articleService.unlikeArticle(id, userId)

    const updatedLikes = Math.max(interactionCount, 0)

    return res.status(200).json({
        code: 200,
        message: '我会继续努力的~',
        data: {
            updatedLikes,
            status: 'unlike'
        }
    })
}

// 收藏文章
export async function collectArticle(req: Request, res: Response) {
    const validateId = validateParams(req.body, res, idSchema)

    if (!validateId.valid) return

    const userInfo = getAuthenticatedUser(req, res)

    if (!userInfo) return;

    const { id } = validateId.data
    const { userId } = userInfo

    const articleCollectedStatus = await articleService.getArticleCollectStatus(id, userId)

    if (articleCollectedStatus?.isCollected) {
        return res.status(409).json({
            code: 409,
            message: '已经收藏啦~'
        })
    }

    const updatedCollects = await articleService.collectArticle(id, userId)

    return res.status(200).json({
        code: 200,
        message: '收藏成功啦～',
        data: {
            updatedCollects,
            status: 'collect'
        }
    })
}

// 取消收藏
export async function uncollectArticle(req: Request, res: Response) {
    const validateId = validateParams(req.params, res, idSchema)

    if (!validateId.valid) return

    const userInfo = getAuthenticatedUser(req, res)

    if (!userInfo) return;

    const { id } = validateId.data
    const { userId } = userInfo


    const articleCollectedStatus = await articleService.getArticleCollectStatus(id, userId)

    if (!articleCollectedStatus?.isCollected) {
        return res.status(409).json({
            code: 409,
            message: '你还没有收藏哦~'
        })
    }

    const interactionCount = await articleService.uncollectArticle(id, userId)
    const updatedCollects = Math.max(interactionCount, 0)

    return res.status(200).json({
        code: 200,
        message: '已从收藏夹移除～',
        data: {
            updatedCollects,
            status: 'uncollect'
        }
    })
}

//当前文章的评论
export async function getArticleComments(req: Request, res: Response) {
    const validatePag = validateParams(req.query, res, PageQuerySchema)

    if (!validatePag.valid) return;

    const validateId = validateParams(req.params, res, idSchema)

    if (!validateId.valid) return;

    const { page, size } = validatePag.data
    const { id } = validateId.data

    const articleComments = await articleService.getArticleComments(id, page, size)

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: {
            list: articleComments
        }
    })
}

export async function createArticleComment(req: Request, res: Response) {
    const validateRequest = validateParams(req.body, res, danmuSchema)

    if (!validateRequest.valid) return;

    const idValidateResult = validateParams(req.params, res, idSchema)

    if (!idValidateResult.valid) return;

    const { content } = validateRequest.data
    const { id } = idValidateResult.data

    const userInfo = getAuthenticatedUser(req, res)

    if (!userInfo) return;

    const { userId } = userInfo

    // 检查是否发送太频繁
    const isTooFrequent = await articleService.checkRecentMessage(userId)
    if (isTooFrequent) {
        return res.status(429).json({
            code: 429,
            message: '发送太频繁，请10秒后再试'
        })
    }

    const commentCount = await articleService.createArticleComment(content, userId, id)

    const updataComments = commentCount + 1

    return res.status(200).json({
        code: 200,
        message: '评论发送成功',
        data: {
            updataComments
        }
    })
}