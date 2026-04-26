import express from 'express'
import { asyncHandler } from '@/middleware/asyncHandler'
import * as articleController from '@/controller/article.controller'

const router = express.Router()

// 文章封面数据列表
router.get('', asyncHandler(articleController.getArticleList))

// 文章具体内容
router.get('/:id', asyncHandler(articleController.getArticleDetail))

// 返回随机3篇文章
router.get('/random/list', asyncHandler(articleController.getRandomArticles))

// 文章点赞
router.post('/likes', asyncHandler(articleController.likeArticle))

// 取消文章点赞
router.delete('/likes/:id', asyncHandler(articleController.unlikeArticle))

// 文章收藏
router.post('/collects', asyncHandler(articleController.collectArticle))

// 取消文章收藏
router.delete('/collects/:id', asyncHandler(articleController.uncollectArticle))

//获取文章评论
router.get('/:id/comments', asyncHandler(articleController.getArticleComments))

//发送评论
router.post('/:id/comments', asyncHandler(articleController.createArticleComment))

export default router