import Tags from "@/models/Tags"
import Article from '@/models/Article'
import Categories from "@/models/Categories";

// 获取标签列表（分页）
export async function getTagsList(page: number, size: number) {
    const skip = (page - 1) * size
    const query = { deleted: { $ne: true }, status: 'ACTIVE' as const };
    const filter = { deleted: { $ne: true }, status: 'PUBLIC' as const }

    const tags = await Tags.find(query).select('-deleted -status').skip(skip).limit(size).lean()

    const tagIds = [...new Set(tags.map(a => a._id).filter(Boolean))]

    // 聚合查询获取每个分类的文章数量
    const articleCounts = await Article.aggregate([
        {
            $match: {
                tag: { $in: tagIds },  // 匹配这些分类
                ...filter
            }
        },
        {
            $group: {
                _id: '$tag',  // 按分类ID分组
                count: { $sum: 1 }   // 统计数量
            }
        }
    ]);

    const TagsMap = new Map(articleCounts.map(u => [u._id.toString(), u.count]));

    const TagsWithCount = tags.map(tag => ({
        ...tag,
        articleCount: TagsMap.get(tag._id.toString()) || 0
    }));

    return TagsWithCount
}

// 根据标签名称获取文章列表（分页）
export async function getArticlesByTag(name: string, page: number, size: number) {
    const skip = (page - 1) * size
    const query = { deleted: { $ne: true }, status: 'ACTIVE' as const };
    const activeQuery = { deleted: { $ne: true }, status: 'PUBLIC' as const };

    const tag = await Tags.findOne({ name, ...query }).select('_id').lean()

    if (!tag) return []

    const articles = await Article.find({ tag: tag._id, ...activeQuery })
        .select('-deleted -status')
        .skip(skip)
        .limit(size)
        .lean()

    const categoryIds = [...new Set(articles.map(a => a.category).filter(Boolean))];

    const categorys = await Categories.find({ _id: { $in: categoryIds }, ...query }).select('_id name').lean()

    const categoryMap = new Map(categorys.map(c => [c._id.toString(), c.name]));

    const categoriesWithCount = articles
        .map(article => ({
            ...article,
            category: categoryMap.get(article.category?.toString()) || '',
        }));

    return categoriesWithCount
}