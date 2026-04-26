import { Request, Response } from 'express'
import * as songsService from '@/service/songs.service'
import { getAuthenticatedUser, validateParams } from '@/utils/validateQueryParams';
import { idSchema, PageQuerySchema, chartsSchema, singleChartSchema } from '@/utils/validationSchemas'

// 获取榜单数据
export async function getCharts(req: Request, res: Response) {
    const validateResult = validateParams(req.query, res, chartsSchema)

    if (!validateResult.valid) return

    const { tagNames, limit } = validateResult.data
    const tagsArray = tagNames.split(',').map((tag: string) => tag.trim())

    const chartsData = await songsService.getChartsData(tagsArray, limit)

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: chartsData
    })
}

// 获取单个榜单数据
export async function getSingleChart(req: Request, res: Response) {
    const tagName = req.params.tagName as string
    const validateResult = validateParams(req.query, res, singleChartSchema)

    if (!validateResult.valid) return

    const { isNew, limit } = validateResult.data

    const chartData = await songsService.getSingleChartData(tagName, isNew, limit)

    if (!chartData) {
        return res.status(404).json({
            code: 404,
            message: '榜单不存在',
            data: null
        })
    }

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: chartData
    })
}

export async function getlikeSongs(req: Request, res: Response) {
    // const user = getAuthenticatedUser(req, res)

    // if (!user) return

    const validateResult = validateParams(req.query, res, PageQuerySchema)

    if (!validateResult.valid) return

    // const { userId } = user
    const { page, size } = validateResult.data

    const likeSone = await songsService.getlikeSongs(1, page, size)

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: {
            list: likeSone
        }
    })
}

//歌曲的喜欢
export async function likeSongs(req: Request, res: Response) {
    const validateResult = validateParams(req.body, res, idSchema)

    if (!validateResult.valid) return

    const userInfo = getAuthenticatedUser(req, res)

    if (!userInfo) return

    const { id } = validateResult.data
    const { userId } = userInfo

    const songikeStatus = await songsService.getSongLikeStatus(userId, id)

    if (songikeStatus?.isLiked) {
        return res.status(409).json({
            code: 409,
            message: '你早就喜欢过这首歌啦！'
        })
    }

    const updatedLikes = await songsService.likeSong(userId, id)

    return res.status(200).json({
        code: 200,
        message: '收到！这首歌已经被你锁死啦',
        data: {
            updatedLikes,
            status: 'like'
        }
    })
}

//取消歌曲喜欢
export async function unlikeSongs(req: Request, res: Response) {
    const validateResult = validateParams(req.params, res, idSchema)

    if (!validateResult.valid) return

    const userInfo = getAuthenticatedUser(req, res)

    if (!userInfo) return

    const { id } = validateResult.data
    const { userId } = userInfo

    const songikeStatus = await songsService.getSongLikeStatus(userId, id)

    if (!songikeStatus?.isLiked) {
        return res.status(409).json({
            code: 409,
            message: '咦？这首歌还没被你翻牌哦~'
        })
    }

    const updatedLikes = await songsService.unlikeSong(userId, id)

    return res.status(200).json({
        code: 200,
        message: '收到！这首歌已经被你移除喜欢啦',
        data: {
            updatedLikes,
            status: 'unlike'
        }
    })
}