import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router';
import type { TabCategoryItem } from '@/types/index'
import { usePaginationCache } from '@/utils/helpers'

export function useCategoryTagList(path: string) {
    const router = useRouter()
    const TAG_CATEGORY_LIST = `${path}_list`;
    const items = ref<TabCategoryItem[]>([])
    const headerConfig = reactive({
        title: null,
        subtitle: null,
        titleSuffix: null
    })

    const handArticleListByCategory = (item: TabCategoryItem) => {
        router.push({
            path: `/articleListByCategorys/${item._id}`,
            query: {
                title: item.name,
                desc: item.desc,
                articleCount: item.articleCount,
                path: `${path}`
            }
        })
    }

    const initCategoryTabData = async () => {

        const result = await usePaginationCache(
            TAG_CATEGORY_LIST,
            'categoryTag',
            `/${path}`
        )

        if (result) {
            items.value = result.list
            headerConfig.title = result.title
            headerConfig.subtitle = result.subtitle
            headerConfig.titleSuffix = result.titleSuffix
        }
    }

    return {
        items,
        headerConfig,
        handArticleListByCategory,
        initCategoryTabData
    }
}