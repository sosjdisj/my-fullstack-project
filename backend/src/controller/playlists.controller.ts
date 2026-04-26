import { Request, Response } from 'express'
import * as playlistsService from '@/service/playlists.service'
import { getAuthenticatedUser, validateParams } from '@/utils/validateQueryParams'
import { idSchema, PageQuerySchema, playlistQuerySchema } from '@/utils/validationSchemas'

export async function getPlaylist(req: Request, res: Response) {
    const validateResult = validateParams(req.query, res, playlistQuerySchema)

    if (!validateResult.valid) return;

    const { limit, mode } = validateResult.data

    // 根据 mode 调用不同的 service 方法
    let playlist;
    if (mode === 'daily') {
        playlist = await playlistsService.getDailyPlaylist()
    } else {
        playlist = await playlistsService.getPlaylist(limit)
    }

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: {
            list: playlist
        }
    })
}

// 获取歌单基本信息
export async function getPlaylistInfo(req: Request, res: Response) {
    const validateId = validateParams(req.params, res, idSchema)

    if (!validateId.valid) return;

    const { id } = validateId.data

    const playlistBasicInfo = await playlistsService.getPlaylistCover(id)

    if (req.auth) {
        const { userId } = req.auth
        const userCollectStatus = await playlistsService.getUserCollectStatus(id, userId)

        return res.status(200).json({
            code: 200,
            message: '查询成功',
            data: {
                list: playlistBasicInfo,
                isCollected: userCollectStatus?.isCanceled
            }
        })
    }

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: {
            list: playlistBasicInfo,
            isCollected: null
        }
    })
}

// 获取歌单歌曲列表
export async function getPlaylistSongs(req: Request, res: Response) {
    const validateId = validateParams(req.params, res, idSchema)

    if (!validateId.valid) return;

    const validateResult = validateParams(req.query, res, PageQuerySchema)

    if (!validateResult.valid) return

    const { id } = validateId.data
    const { page, size } = validateResult.data

    const playlistSongs = await playlistsService.getPlaylistSongs(id, page, size)

    if (!req.auth) {
        return res.status(200).json({
            code: 200,
            message: '查询成功',
            data: {
                songs: playlistSongs,
                likedIds: null
            }
        })
    }

    const songIds = playlistSongs.map(s => s._id.toString())
    const { userId } = req.auth

    const likedIds = await playlistsService.getUserLikedSongIds(userId, songIds)

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: {
            songs: playlistSongs,
            likedIds
        }
    })
}

//歌单收藏
export async function collectPlaylist(req: Request, res: Response) {
    const validateRequest = validateParams(req.body, res, idSchema)

    if (!validateRequest.valid) return;

    const userInfo = getAuthenticatedUser(req, res)

    if (!userInfo) return;

    const { id } = validateRequest.data
    const { userId } = userInfo

    const userCollectStatus = await playlistsService.getUserCollectStatus(id, userId)

    if (userCollectStatus?.isCanceled) {
        return res.status(409).json({
            code: 409,
            message: '已经收藏啦~'
        })
    }

    const updatedCanceled = await playlistsService.collectPlaylist(userId, id)

    return res.status(200).json({
        code: 200,
        message: '歌单已乖乖躺进你的收藏啦～',
        data: {
            updatedCanceled,
            status: 'collect'
        }
    })
}

//取消歌单收藏
export async function uncollectPlaylist(req: Request, res: Response) {
    const validateRequest = validateParams(req.params, res, idSchema)

    if (!validateRequest.valid) return;

    const userInfo = getAuthenticatedUser(req, res)

    if (!userInfo) return;

    const { id } = validateRequest.data
    const { userId } = userInfo

    const userCollectStatus = await playlistsService.getUserCollectStatus(id, userId)

    if (userCollectStatus?.isCanceled) {
        return res.status(409).json({
            code: 409,
            message: '还没有收藏哦~'
        })
    }

    const updatedCanceled = await playlistsService.uncollectPlaylist(userId, id)

    return res.status(200).json({
        code: 200,
        message: '忍痛移出收藏夹啦~',
        data: {
            updatedCanceled,
            status: 'uncollect'
        }
    })
}

// 获取用户收藏的歌单
export async function getCollectsPlaylist(req: Request, res: Response) {
    // const userInfo = getAuthenticatedUser(req, res)

    // if (!userInfo) return;

    const validateResult = validateParams(req.query, res, PageQuerySchema)

    if (!validateResult.valid) return

    // const { userId } = userInfo

    const { page, size } = validateResult.data

    const collectsPlaylist = await playlistsService.getCollectsPlaylist(1, page, size)

    return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: {
            list: collectsPlaylist
        }
    })
}