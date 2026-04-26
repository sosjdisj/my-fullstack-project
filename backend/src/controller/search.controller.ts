import { Request, Response } from 'express'
import * as searchService from '@/service/search.service'
import { validateParams } from '@/utils/validateQueryParams'
import { keywordSchema, simpleKeywordSchema } from '@/utils/validationSchemas'


export async function searchArticles(req: Request, res: Response) {
    const validateResult = validateParams(req.query, res, keywordSchema)

    if (!validateResult.valid) return;

    const { keyword, page, size } = validateResult.data

    const { articlesWithMeta, total } = await searchService.searchArticles({ keyword, page, size })

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: {
            list: articlesWithMeta,
            page,
            size,
            total
        }
    })
}

export async function searchArticleTitles(req: Request, res: Response) {
    const validateResult = validateParams(req.query, res, simpleKeywordSchema)

    if (!validateResult.valid) return;

    const { keyword } = validateResult.data

    const titles = await searchService.getArticleTitles({ keyword })
    console.log(titles)
    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: {
            list: titles
        }
    })
}

export async function hotSearchTitles(req: Request, res: Response) {
    const titles = await searchService.getHotSearchTitles()

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: {
            list: titles
        }
    })
}