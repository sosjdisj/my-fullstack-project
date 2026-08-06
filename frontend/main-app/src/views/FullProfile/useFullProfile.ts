// Vue/Vue Router API 由 unplugin-auto-import 全局注入
import type { collectedArticles } from '@/types/index'
import { usePageControl } from "@/composables/usePageControl"
import { usePaginationCache, autoLoadIfNotFillScreen } from "@/utils/helpers"
import { CACHE_KEYS } from "@/constants/cacheKeys"
import { Delete } from "@/api/request"
import { useNavigation } from '@/utils/navigation'

export function useFullProfile() {
    const { goArticleDetail } = useNavigation()

    const collectedArticles = ref<collectedArticles[]>([])

    const isLoading = ref<boolean>(false)
    const isFinished = ref<boolean>(false)
    const hasResetSearchState = ref(false)

    const keyword = ref<string>('')

    // 确认弹窗状态
    const confirmVisible = ref(false)
    const confirmItem = ref<collectedArticles | null>(null)

    const { page, nextPage, resetPage } = usePageControl()

    const getCollectedArticles = async () => {
        if (isLoading.value || isFinished.value) return;

        if (!hasResetSearchState.value) resetSearchList()

        isFinished.value = false
        isLoading.value = true

        const articleListData = await usePaginationCache(
            CACHE_KEYS.USER_COLLECTED,
            page.value,
            '/profile/articles/collected',
            { page: page.value }
        )

        if (articleListData.list.length === 0) {
            isFinished.value = true
            isLoading.value = false
            return;
        }
        collectedArticles.value = [...collectedArticles.value, ...articleListData.list]
        nextPage()
        isLoading.value = false

        await autoLoadIfNotFillScreen(getCollectedArticles, isFinished.value)
    }

    const goToArticle = (item: collectedArticles) => {
        goArticleDetail(item.id)
    }

    const showUnfavoriteConfirm = (item: collectedArticles) => {
        confirmItem.value = item
        confirmVisible.value = true
    }

    const closeConfirm = () => {
        confirmVisible.value = false
        confirmItem.value = null
    }

    const confirmUnfavorite = async () => {
        if (confirmItem.value) {
            console.log(confirmItem.value)
            const result = await Delete(`/profile/${confirmItem.value.id}/collects`)

            if (result.success) {
                collectedArticles.value = collectedArticles.value.filter(
                    item => item.id !== confirmItem.value?.id
                )
                ElMessage.info(result.message)
            }
        }
        closeConfirm()
    }

    const handleSearch = async () => {

        if (isLoading.value || isFinished.value) return

        if(keyword.value==='') return getCollectedArticles()

        if (!hasResetSearchState.value) resetSearchList()

        isFinished.value = false
        isLoading.value = true

        const result = await usePaginationCache(
            CACHE_KEYS.SEARCH_COLLECTED_ARTICLES,
            `search_${keyword.value}_${page.value}`,
            '/profile/keyword',
            { page: page.value, keyword: keyword.value }
        )

        if (result.list.length === 0) {
            isFinished.value = true
            isLoading.value = false
            return
        }

        collectedArticles.value = [...collectedArticles.value, ...result.list]
        nextPage()
        isLoading.value = false

        await autoLoadIfNotFillScreen(handleSearch, isFinished.value)
    }

    const resetSearchList = () => {
        collectedArticles.value = []
        resetPage()
        hasResetSearchState.value = true
    }

    watch(keyword, () => {
        hasResetSearchState.value = false
        isFinished.value = false
    })

    return {
        collectedArticles,
        confirmVisible,
        confirmItem,
        keyword,
        getCollectedArticles,
        goToArticle,
        showUnfavoriteConfirm,
        confirmUnfavorite,
        closeConfirm,
        handleSearch,
        isFinished,
        isLoading,
        loadMore: getCollectedArticles
    }
}