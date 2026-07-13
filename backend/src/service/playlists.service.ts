import Playlists from '@/models/Playlists'
import Songs from '@/models/Songs'
import UserLikeSongs from '@/models/UserLikeSongs'
import UserCollectPlaylists from '@/models/UserCollectPlaylists'
import mongoose from 'mongoose'

export async function getPlaylist(limit: number) {
    const filter = { deleted: { $ne: true } }

    return await Playlists.find(filter)
        .select('_id name playCount description coverImage')
        .sort({ playCount: -1 })  // 按播放量降序
        .limit(limit)  // 限制返回数量
        .lean()
}

// 每日推荐（随机获取 10 条）
export async function getDailyPlaylist() {
    const filter = { deleted: { $ne: true } }

    // 使用 MongoDB 的 $sample 聚合管道，随机获取 10 条
    const result = await Playlists.aggregate([
        { $match: filter },
        { $sample: { size: 10 } },
        { $project: { _id: 1, name: 1, playCount: 1, description: 1, coverImage: 1 } }
    ])

    return result
}

// 获取歌单封面信息
export async function getPlaylistCover(playlistId: string) {
    const filter = { deleted: { $ne: true }, _id: playlistId }

    const [playlistInfo, songs] = await Promise.all([
        Playlists.findOne(filter)
            .select('_id name playCount description coverImage createdAt creator creatorAvatar')
            .lean(),
        Songs.countDocuments({ playlist_id: playlistId })
    ])

    return { ...playlistInfo, songs }
}

// 获取用户收藏歌单状态
export async function getUserCollectStatus(playlistId: string, userId: number) {
    return await UserCollectPlaylists.findOne({ playlistId, userId })
        .select('isCanceled')
}

// 获取歌单歌曲列表（分页）
export async function getPlaylistSongs(playlistId: string, page: number, size: number) {
    const skip = (page - 1) * size
    return await Songs.find({ playlist_id: playlistId })
        .skip(skip)
        .limit(size)
        .lean()
}

// 获取用户喜欢的歌曲ID列表
export async function getUserLikedSongIds(userId: number, songIds: string[]) {
    const likedSongs = await UserLikeSongs.find({ userId, songId: { $in: songIds } })
        .select({ songId: 1, _id: 0 })
    return likedSongs.map(item => item.songId)
}

//收藏歌单
export async function collectPlaylist(userId: number, playlistId: string) {
    const session = await mongoose.startSession()
    try {
        session.startTransaction()
        const [updated] = await Promise.all([
            Playlists.findOneAndUpdate(
                { _id: playlistId },
                { $inc: { collects: 1 } },
                { select: 'collects', returnDocument: 'after', session }
            ),
            UserCollectPlaylists.updateOne(
                { userId, playlistId },
                { isCanceled: true },
                { upsert: true, session }
            ),
        ])
        await session.commitTransaction()
        return updated?.collects as number
    } catch (err) {
        await session.abortTransaction()
        throw err
    } finally {
        session.endSession()
    }
}

//取消歌单收藏
export async function uncollectPlaylist(userId: number, playlistId: string) {
    const session = await mongoose.startSession()
    try {
        session.startTransaction()
        const [updated] = await Promise.all([
            Playlists.findOneAndUpdate(
                { _id: playlistId, collects: { $gt: 0 } },
                { $inc: { collects: -1 } },
                { select: 'collects', returnDocument: 'after', session }
            ),
            UserCollectPlaylists.updateOne(
                { userId, playlistId },
                { isCanceled: false },
                { session }
            ),
        ])
        await session.commitTransaction()
        return updated?.collects as number
    } catch (err) {
        await session.abortTransaction()
        throw err
    } finally {
        session.endSession()
    }
}

// 获取用户收藏的歌单
export async function getCollectsPlaylist(userId: number, page: number, size: number) {
    const skip = (page - 1) * size

    // 查找用户收藏的歌单ID
    const collectedPlaylists = await UserCollectPlaylists.find({ userId, isCanceled: true })
        .select('playlistId')
        .skip(skip)
        .limit(size)

    // 提取歌单ID列表
    const playlistIds = collectedPlaylists.map(item => item.playlistId)

    // 根据歌单ID查询歌单信息
    return await Playlists.find({ _id: { $in: playlistIds } })
        .select('_id name playCount description coverImage')
        .lean()
}
