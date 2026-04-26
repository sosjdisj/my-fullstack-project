import express from 'express'
import { asyncHandler } from '@/middleware/asyncHandler'
import * as profileController from '@/controller/profile.controller'
import { uploadAvatar } from '@/utils/fileUpload'
import * as articleController from '@/controller/article.controller'

const router = express.Router()

//主页用户信息
router.get('', asyncHandler(profileController.getProfile))

//修改主页信息
router.patch('', uploadAvatar, asyncHandler(profileController.updateProfile))

//主应用个人主页收藏文章
router.get('/articles/collected', asyncHandler(profileController.getArticlesCollected))

//个人主页取消文章收藏
router.delete('/:id/collects', asyncHandler(articleController.uncollectArticle))

//搜索指定收藏的文章
router.get('/keyword', asyncHandler(profileController.getKeywordArticles))

export default router