import Article from "@/models/Article"

export async function getTimelineList(page: number, size: number) {
    const skip = (page - 1) * size
    const filter = { deleted: { $ne: true }, status: 'PUBLIC' }

    const articles = await Article.find(filter)
        .sort({ createdAt: -1 })
        .select('_id title published cover')  // 按时间倒序（最新的在前）
        .skip(skip)
        .limit(size)
        .lean()

    return articles
}