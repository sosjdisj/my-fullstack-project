import express from 'express'
import { asyncHandler } from '@/middleware/asyncHandler'
import * as playlistsController from '@/controller/playlists.controller'

const router = express.Router()

//歌单列表
router.get('', asyncHandler(playlistsController.getPlaylist))

// 歌单里的头部信息
router.get('/:id/info', asyncHandler(playlistsController.getPlaylistInfo))

// 当前歌单下的歌曲和用户喜欢的歌曲
router.get('/:id/songs', asyncHandler(playlistsController.getPlaylistSongs))

// 当前用户收藏的歌单
router.get('/collects', asyncHandler(playlistsController.getCollectsPlaylist))

//歌单收藏
router.post('/collects', asyncHandler(playlistsController.collectPlaylist))

//取消歌单收藏
router.delete('/:id/collects', asyncHandler(playlistsController.uncollectPlaylist))

export default router