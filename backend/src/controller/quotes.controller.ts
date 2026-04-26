import { Request, Response } from 'express'
import * as quotesService from '@/service/quotes.service'

// 获取每日名言
export async function getDailyQuotes(req: Request, res: Response) {
    const quotesList = await quotesService.getDailyQuotes()

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: {
            list: quotesList
        }
    })
}