import express from 'express'
import { asyncHandler } from '@/middleware/asyncHandler'
import * as searchController from '@/controller/search.controller'

const router = express.Router()

router.get('', asyncHandler(searchController.searchArticles))

router.get('/titles', asyncHandler(searchController.searchArticleTitles))

router.get('/hot-titles', asyncHandler(searchController.hotSearchTitles))

export default router