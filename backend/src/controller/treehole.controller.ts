import { Request, Response } from 'express'
import * as treeholeService from '@/service/treehole.service'
import { getAuthenticatedUser, validateParams } from '@/utils/validateQueryParams'
import { danmuSchema, limitSchema } from '@/utils/validationSchemas'

export async function getMessage(req: Request, res: Response) {
    const validateRequest = validateParams(req.query, res, limitSchema)

    if (!validateRequest.valid) return;

    const { limit } = validateRequest.data

    const danmakuList = await treeholeService.getMessage(limit)

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: {
            list: danmakuList
        }
    })
}

// 发送弹幕
export async function sendMessage(req: Request, res: Response) {

    const userInfo = getAuthenticatedUser(req, res)

    if (!userInfo) return

    const validateRequest = validateParams(req.body, res, danmuSchema)

    if (!validateRequest.valid) return;

    const { content } = validateRequest.data
    const { userId } = userInfo

    // 检查是否发送太频繁
    const isTooFrequent = await treeholeService.checkRecentMessage(userId)

    if (isTooFrequent) {
        return res.status(429).json({
            code: 429,
            message: '发送太频繁，请10秒后再试'
        })
    }

    // 创建消息
    await treeholeService.createMessage(content, userId)

    return res.status(200).json({
        code: 200,
        message: '发送成功'
    })
}