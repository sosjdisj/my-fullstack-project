import Article from '@/models/Article'
import Tags from "@/models/Tags"
import Categories from "@/models/Categories"

interface SearchArticlesParams {
    keyword?: string
    page: number
    size: number
}

interface SearchTitlesParams {
    keyword: string
}

export async function searchArticles({ keyword, page, size }: SearchArticlesParams) {
    const skip = (page - 1) * size

    const query: any = { deleted: { $ne: true }, status: 'PUBLIC' }

    if (keyword) {
        query.$or = [
            { title: { $regex: keyword, $options: 'i' } },
        ]
    }

    const articles = await Article.find(query)
        .select('-deleted -status')
        .skip(skip)
        .limit(size)
        .sort({ published: -1 })
        .lean()

    // 截取 content 长度
    articles.forEach(article => {
        if (article.content) {
            article.content = article.content.substring(0, 40)
        }
    })

    const total = await Article.countDocuments(query)

    const tagIds = [...new Set(articles.map(a => a.tag).filter(Boolean))]
    const categoryIds = [...new Set(articles.map(a => a.category).filter(Boolean))]

    const [tags, categories] = await Promise.all([
        Tags.find({ _id: { $in: tagIds }, deleted: { $ne: true }, status: 'ACTIVE' })
            .select('_id name')
            .lean(),
        Categories.find({ _id: { $in: categoryIds }, deleted: { $ne: true }, status: 'ACTIVE' })
            .select('_id name')
            .lean()
    ])

    const tagMap = new Map(tags.map(c => [c._id.toString(), c.name]))
    const categoryMap = new Map(categories.map(c => [c._id.toString(), c.name]))

    const articlesWithMeta = articles.map(article => ({
        ...article,
        tag: tagMap.get(article.tag?.toString()) || '',
        category: categoryMap.get(article.category?.toString()) || ''
    }))

    return {
        articlesWithMeta,
        total
    }
}

export async function getArticleTitles({ keyword }: SearchTitlesParams) {
    const query: any = {
        deleted: { $ne: true },
        status: 'PUBLIC',
        title: { $regex: keyword, $options: 'i' }
    }

    const titles = await Article.find(query)
        .select('title')
        .limit(5)
        .sort({ published: -1 })
        .lean()

    return titles.map(article => article.title)
}

export async function getHotSearchTitles() {
    const titles = await Article.find({
        deleted: { $ne: true },
        status: 'PUBLIC'
    })
        .select('title')
        .limit(5)
        .sort({ pageViews: -1 })
        .lean()

    return titles.map(article => article.title)
}