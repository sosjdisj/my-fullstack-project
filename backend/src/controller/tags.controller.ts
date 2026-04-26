import { Request, Response } from 'express'
import * as tagsService from '@/service/tags.service'
import { validateParams } from '@/utils/validateQueryParams'
import { contentParamsSchema, PageQuerySchema } from '@/utils/validationSchemas'

// 获取标签列表
export async function getTagsList(req: Request, res: Response) {
    const validateResult = validateParams(req.query, res, PageQuerySchema)

    if (!validateResult.valid) return;

    const { page, size } = validateResult.data
    const tagsList = await tagsService.getTagsList(page, size)

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: {
            list: tagsList,
            subtitle: '每一个标签，都是思绪与热爱的专属注脚',
            titleSuffix: 'Markers',
            title: '标签',
            page,
            size
        }
    })
}

// 根据标签名称获取文章列表
export async function getArticlesByTag(req: Request, res: Response) {
    const paramsValidateResult = validateParams(req.query, res, contentParamsSchema)

    if (!paramsValidateResult.valid) return;

    const { content: encodedName, page, size } = paramsValidateResult.data

    const content = decodeURIComponent(encodedName)

    const tagFilteredArticleList = await tagsService.getArticlesByTag(content, page, size)

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: {
            list: tagFilteredArticleList,
            page,
            size
        }
    })
}