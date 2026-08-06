// Vue/Vue Router API 由 unplugin-auto-import 全局注入
import type { TabCategoryItem } from '@/types/index'
import { usePaginationCache } from '@/utils/helpers'
import { useNavigation } from '@/utils/navigation'

export function useCategoryTagList(path: string) {
    const { goArticleListByCategory } = useNavigation()
    const TAG_CATEGORY_LIST = `${path}_list`;
    const items = ref<TabCategoryItem[]>([])
    const headerConfig = reactive({
        title: null,
        subtitle: null,
        titleSuffix: null
    })

    const handArticleListByCategory = (item: TabCategoryItem) => {
        goArticleListByCategory(item, path)
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