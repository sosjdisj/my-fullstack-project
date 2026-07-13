import Categories from "@/models/Categories"
import Article from '@/models/Article'
import Tags from "@/models/Tags"

// 获取分类列表（分页）
export async function getCategoriesList(page: number, size: number) {
    const skip = (page - 1) * size
    const query = { deleted: { $ne: true }, status: 'ACTIVE' as const };
    const filter = { deleted: { $ne: true }, status: 'PUBLIC' as const }

    const categories = await Categories.find(query).select('-deleted -status').skip(skip).limit(size).lean()

    const categorieIds = [...new Set(categories.map(a => a._id).filter(Boolean))]

    // 聚合查询获取每个分类的文章数量
    const articleCounts = await Article.aggregate([
        {
            $match: {
                category: { $in: categorieIds },  // 匹配这些分类
                ...filter
            }
        },
        {
            $group: {
                _id: '$category',  // 按分类ID分组
                count: { $sum: 1 }   // 统计数量
            }
        }
    ]);

    const categorieMap = new Map(articleCounts.map(u => [u._id.toString(), u.count]));

    const categoriesWithCount = categories.map(category => ({
        ...category,
        articleCount: categorieMap.get(category._id.toString()) || 0
    }));

    return categoriesWithCount
}

// 根据分类名称获取文章列表（分页）
export async function getArticlesByCategory(name: string, page: number, size: number) {
    const skip = (page - 1) * size

    const query = { deleted: { $ne: true }, status: 'ACTIVE' as const };
    const activeQuery = { deleted: { $ne: true }, status: 'PUBLIC' as const };

    const category = await Categories.findOne({ name, ...query }).select('_id').lean()

    if (!category) return []

    const articles = await Article.find({ category: category._id, ...activeQuery })
        .select('-deleted -status')
        .skip(skip)
        .limit(size)
        .lean()

    const tagIds = [...new Set(articles.map(a => a.tag).filter(Boolean))];

    const tags = await Tags.find({ _id: { $in: tagIds }, ...query }).select('_id name').lean()

    const tagMap = new Map(tags.map(c => [c._id.toString(), c.name]));

    const tagWithCount = articles
        .map(article => ({
            ...article,
            tag: tagMap.get(article.tag?.toString()) || '',
        }));

    return tagWithCount
}