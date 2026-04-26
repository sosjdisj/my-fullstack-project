import express from 'express'
import { asyncHandler } from '@/middleware/asyncHandler'
import * as tagsController from '@/controller/tags.controller'

const router = express.Router()

// 获取标签列表
router.get('', asyncHandler(tagsController.getTagsList))

// 根据标签名称获取文章列表
router.get('/:content', asyncHandler(tagsController.getArticlesByTag))

export default router
