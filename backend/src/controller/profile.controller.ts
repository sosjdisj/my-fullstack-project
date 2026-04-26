import { Request, Response } from 'express'
import { getAuthenticatedUser, validateParams } from '@/utils/validateQueryParams'
import * as profileService from '@/service/profile.service'
import { PageQuerySchema, keywordSchema, updateProfileSchema } from '@/utils/validationSchemas'

/**
 * 获取用户收藏的文章列表
 * @param req 请求对象
 * @param res 响应对象
 * @returns 200 成功响应，包含收藏文章列表、分页信息
 * @returns 401 未登录响应
 */
export async function getArticlesCollected(req: Request, res: Response) {
    const validateResult = validateParams(req.query, res, PageQuerySchema)

    if (!validateResult.valid) return;

    const userInfo = getAuthenticatedUser(req, res)

    if (!userInfo) return;

    const { userId } = userInfo

    const { page, size } = validateResult.data
    const skip = (page - 1) * size

    const articlesCollected = await profileService.getArticlesCollectedId(userId, skip, size)

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: {
            list: articlesCollected,
            page,
            size
        }
    })
}

/**
 * 根据关键词分页查询用户文章
 * @route GET /api/keyword-articles
 * @param {Object} req.query - 查询参数
 * @param {number} req.query.page - 页码
 * @param {number} req.query.size - 每页数量
 * @param {string} req.query.keyword - 搜索关键词
 * @returns {Object} 200 - 文章列表及分页信息
 */
export async function getKeywordArticles(req: Request, res: Response) {
    const validateResultSearch = validateParams(req.query, res, keywordSchema)

    if (!validateResultSearch.valid) return;

    const userInfo = getAuthenticatedUser(req, res)

    if (!userInfo) return;

    const { userId } = userInfo
    const { page, size, keyword } = validateResultSearch.data

    const skip = (page - 1) * size

    const keywordArticles = await profileService.getKeywordArticles(userId, skip, size, keyword)

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: {
            list: keywordArticles,
            page,
            size
        }
    })
}

/**
 * 获取用户个人信息
 * @param req 请求对象
 * @param res 响应对象
 * @returns 200 成功响应，包含用户个人信息
 * @returns 401 未登录响应
 */
export async function getProfile(req: Request, res: Response) {
    const userInfo = getAuthenticatedUser(req, res)

    if (!userInfo) return;

    const { userId } = userInfo
    const profile = await profileService.getProfile(userId)

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: profile
    })
}

/**
 * 更新用户个人信息
 * @param req 请求对象
 * @param res 响应对象
 * @returns 200 成功响应，包含更新后的用户个人信息
 * @returns 401 未登录响应
 */
export async function updateProfile(req: Request, res: Response) {

    const userInfo = getAuthenticatedUser(req, res)

    if (!userInfo) return;

    const validateResult = validateParams(JSON.parse(req.body.data), res, updateProfileSchema)

    if (!validateResult.valid) return;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const coverFile = files?.avatar?.[0];

    let coverUrl = '';
    if (coverFile) {
        coverUrl = `${process.env.BASE_URL}/uploads/${coverFile.filename}`;
    }

    const { userId } = userInfo
    const {
        username,
        signature,
        phone,
    } = validateResult.data


    await profileService.updateProfile(userId, {
        username,
        signature,
        cover: coverUrl,
        phone,
    })

    return res.status(200).json({
        code: 200,
        message: '更新成功',
        data: null
    })
}
