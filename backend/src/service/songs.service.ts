import Songs from "@/models/Songs";
import UserLikeSongs from "@/models/UserLikeSongs";
import SongTag from "@/models/Song_tags";
import mongoose from "mongoose";

export async function getlikeSongs(userId: number, page: number, size: number) {
    const skip = (page - 1) * size
    const filter = { isLiked: { $ne: false }, userId }

    const userLikeSongs = await UserLikeSongs.find(filter)
        .skip(skip)
        .limit(size)
        .lean()

    const songIds = userLikeSongs.map(item => item.songId)

    return await Songs.find({
        _id: { $in: songIds },
        deleted: { $ne: true }
    }).lean()
}

export async function getSongLikeStatus(userId: number, songId: string) {
    return UserLikeSongs.findOne({ userId, songId })
        .select('isLiked')
}

export async function likeSong(userId: number, songId: string) {
    const session = await mongoose.startSession()
    try {
        session.startTransaction()
        const [likes] = await Promise.all([
            Songs.findOneAndUpdate(
                { _id: songId },
                { $inc: { likes: 1 } },
                { select: 'likes', returnDocument: 'after', session }
            ),
            UserLikeSongs.updateOne(
                { userId, songId },
                { isLiked: true },
                { upsert: true, session }
            )
        ])
        await session.commitTransaction()
        return likes?.likes as number
    } catch (err) {
        await session.abortTransaction()
        throw err
    } finally {
        session.endSession()
    }
}

export async function unlikeSong(userId: number, songId: string) {
    const session = await mongoose.startSession()
    try {
        session.startTransaction()
        const [likes] = await Promise.all([
            Songs.findOneAndUpdate(
                { _id: songId, likes: { $gt: 0 } },
                { $inc: { likes: -1 } },
                { select: 'likes', returnDocument: 'after', session }
            ),
            UserLikeSongs.updateOne(
                { userId, songId },
                { isLiked: false },
                { session }
            )
        ])
        await session.commitTransaction()
        return likes?.likes as number
    } catch (err) {
        await session.abortTransaction()
        throw err
    } finally {
        session.endSession()
    }
}

/**
 * 获取单个榜单数据
 */
export async function getSingleChartData(tagName: string, isNew: boolean = false, limit: number = 10) {
    // 1. 查标签
    const tag = await SongTag.findOne({
        name: tagName,
        deleted: false,
        status: 'ACTIVE' as const
    }).lean()

    if (!tag) return null

    // 2. 查歌曲
    const matchCondition: any = {
        song_tags: tag._id,
        deleted: { $ne: true }
    }

    if (isNew) {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        matchCondition.createdAt = { $gte: thirtyDaysAgo }
    }

    const songs = await Songs.find(matchCondition)
        .sort({ playback: -1 })
        .limit(limit)
        .lean()

    // 3. 返回
    return {
        id: tag._id,
        title: tag.name,
        icon: tag.icon,
        frequency: isNew ? '每天更新' : '每周更新',
        songs: songs.map(song => ({
            id: song._id,
            name: song.name,
            artist: song.singer || '未知歌手',
            playback: song.playback || 0,
        }))
    }
}

/**
 * 获取多个榜单（主函数）
 * @param tagNames 标签名称数组，如 ['华语', '日语', '欧美']
 * @param limit 每个榜单返回多少首歌，默认5
 */
export async function getChartsData(tagNames: string[], limit: number = 5) {
    // 定义哪些标签是新歌榜（可以配置在数据库，也可以写死）
    const newChartTags = ['华语']  // 只有华语是新歌榜

    const results = await Promise.all(
        tagNames.map(async (tagName) => {
            const isNew = newChartTags.includes(tagName)
            return await getSingleChartData(tagName, isNew, limit)
        })
    )

    // 过滤掉不存在的标签
    return results.filter(item => item !== null)
}

