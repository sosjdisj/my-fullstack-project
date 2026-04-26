import Treehole from '@/models/Treehole'
import { prisma } from '@/config/db'

export async function getMessage(limit: number) {
    const filter = { deleted: { $ne: true }, reviewStatus: 'APPROVED' }

    const danmakus = await Treehole.find(filter)
        .sort({ createTime: -1 })  // 按时间倒序，最新的在前
        .select('-reviewStatus -createTime -deleted')
        .limit(limit)              // 限制数量
        .lean()

    const userIds = [...new Set(danmakus.map(a => a.userId).filter(Boolean))];

    const users = await prisma.user.findMany({
        where: {
            user_id: {
                in: userIds
            },
            deleted: 0,
            account_status: 'ACTIVE'
        },
        select: {
            user_id: true,
            username: true,  // 只查询需要的字段
            cover: true
        }
    })

    const usersMap = new Map(users.map(c => [c.user_id, c.cover]));

    const formattedDanmakus = danmakus
        .map(danmaku => ({
            ...danmaku,
            avatar: usersMap.get(danmaku.userId) || '',
        }));

    return formattedDanmakus
}

// 检查用户是否发送太频繁
export async function checkRecentMessage(userId: number): Promise<boolean> {
    const query = { deleted: { $ne: true }, reviewStatus: 'APPROVED' };

    const recentMessage = await Treehole.findOne({
        userId,
        createTime: { $gt: new Date(Date.now() - 10 * 1000) },
        ...query
    })
    return !!recentMessage
}

// 创建新的树洞消息
export async function createMessage(content: string, userId: number) {
    await Treehole.create({
        content: content.trim(),
        userId,
        createTime: new Date()
    })
}