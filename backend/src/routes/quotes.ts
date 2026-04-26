import express from 'express'
import { asyncHandler } from '@/middleware/asyncHandler'
import * as quotesController from '@/controller/quotes.controller'

const router = express.Router()

// 获取每日名言
router.get('/daily', asyncHandler(quotesController.getDailyQuotes))

export default router