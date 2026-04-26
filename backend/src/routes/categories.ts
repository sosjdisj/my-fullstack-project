import express from 'express'
import { asyncHandler } from '@/middleware/asyncHandler'
import * as categoriesController from '@/controller/categories.controller'

const router = express.Router()

// 获取分类列表
router.get('', asyncHandler(categoriesController.getCategoriesList))

// 根据分类名称获取文章列表
router.get('/:content', asyncHandler(categoriesController.getArticlesByCategory))

export default router
