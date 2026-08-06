import { useRouter } from 'vue-router'
import type { TabCategoryItem } from '@/types/index'

/**
 * 主应用统一导航 composable
 * 集中管理所有路由跳转，避免各组件/composable 各写一份 router.push 导致路径/参数不一致
 */
export function useNavigation() {
    const router = useRouter()

    /** 跳转文章详情 */
    const goArticleDetail = (id: string | number) => {
        router.push({
            path: `/articleDetail/${id}`,
            query: { id: String(id) }
        })
    }

    /**
     * 跳转分类文章列表
     * @param item 分类/标签项
     * @param path 来源类型 'categories' | 'tags'，作为 query.path 传给目标页
     */
    const goArticleListByCategory = (item: TabCategoryItem, path: string) => {
        router.push({
            path: `/articleListByCategorys/${item._id}`,
            query: {
                title: item.name,
                desc: item.desc,
                articleCount: item.articleCount,
                path
            }
        })
    }

    /** 跳转标签文章列表（首页热门标签专用） */
    const goArticleListByTag = (item: TabCategoryItem) => {
        router.push({
            path: `/articleListBytabs/${item._id}`,
            query: {
                title: item.name,
                desc: item.desc,
                articleCount: item.articleCount,
                path: 'tags'
            }
        })
    }

    /** 跳转搜索结果 */
    const goSearchResult = (keyword: string) => {
        router.push({
            path: '/searchResult',
            query: { searchResult: keyword }
        })
    }

    return {
        goArticleDetail,
        goArticleListByCategory,
        goArticleListByTag,
        goSearchResult
    }
}
