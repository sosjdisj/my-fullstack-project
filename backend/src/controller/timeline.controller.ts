import { Request, Response } from 'express'
import * as timelineService from '@/service/timeline.service'
import { validateParams, getAuthenticatedUser } from '@/utils/validateQueryParams'
import { PageQuerySchema, idSchema, contentParamsSchema, danmuSchema } from '@/utils/validationSchemas'

export async function getTimelineList(req: Request, res: Response) {
    const validateResult = validateParams(req.query, res, PageQuerySchema)

    if (!validateResult.valid) return;

    const { page, size } = validateResult.data

    const timelienList = await timelineService.getTimelineList(page, size)

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: {
            list: timelienList
        }
    })
}