import Quotes from '@/models/Quotes'

// 获取每日名言（随机20条）
export async function getDailyQuotes() {
    const query = { deleted: { $ne: true } };

    return await Quotes.aggregate([
        { $match: query },
        { $sample: { size: 20 } },
        {
            $project: {
                _id: 0,
                content: 1
            }
        }
    ])
}