import { Request, Response } from 'express'
import * as categoriesService from '@/service/categories.service'
import { validateParams } from '@/utils/validateQueryParams'
import { contentParamsSchema, PageQuerySchema } from '@/utils/validationSchemas'

// 获取分类列表
export async function getCategoriesList(req: Request, res: Response) {
    const validateResult = validateParams(req.query, res, PageQuerySchema)

    if (!validateResult.valid) return;

    const { page, size } = validateResult.data
    const categoriesList = await categoriesService.getCategoriesList(page, size)

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: {
            list: categoriesList,
            subtitle: '与其记录在别处，不如沉淀在这里。',
            titleSuffix: 'Collections',
            title: '分类',
            page,
            size
        }
    })
}

// 根据分类名称获取文章列表
export async function getArticlesByCategory(req: Request, res: Response) {
    const paramsValidateResult = validateParams(req.query, res, contentParamsSchema)

    if (!paramsValidateResult.valid) return;

    const { content: encodedName, page, size } = paramsValidateResult.data

    const content = decodeURIComponent(encodedName)

    const categoryFilteredArticleList = await categoriesService.getArticlesByCategory(content, page, size)

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: {
            list: categoryFilteredArticleList,
            page,
            size
        }
    })
}