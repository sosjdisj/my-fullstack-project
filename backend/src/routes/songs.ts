import express from 'express'
import { asyncHandler } from '@/middleware/asyncHandler'
import * as songsController from '@/controller/songs.controller'

const router = express.Router()

//当前用户喜欢的歌曲
router.get('', asyncHandler(songsController.getlikeSongs))

//歌曲的喜欢
router.post('/likes', asyncHandler(songsController.likeSongs))

//取消喜欢
router.delete('/:id/likes', asyncHandler(songsController.unlikeSongs))

// 获取多个榜单
router.get('/charts', asyncHandler(songsController.getCharts))

//获取单个榜单
router.get('/charts/:tagName', asyncHandler(songsController.getSingleChart))

export default router