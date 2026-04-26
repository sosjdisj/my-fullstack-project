import { useRoute, useRouter } from 'vue-router';
import { ref, computed } from 'vue';
import { usePaginationCache, setLoadMoreContainerRef } from '@/utils/helpers'
import { usePageControl } from '@/composables/usePageControl'
import { CACHE_KEYS } from '@/constants/cacheKeys';
import type { ArticleCard } from '@/types/index'

export function useSearchResult() {

    const route = useRoute()
    const router = useRouter()

    const queryData = computed(() => {
        return Array.isArray(route.query.searchResult)
            ? route.query.searchResult[0]
            : route.query.searchResult
    })

    const searchResult = ref<number>(0)
    const isLoading = ref<boolean>(false)
    const isFinished = ref<boolean>(false)

    const { page, nextPage } = usePageControl()

    const articles = ref<ArticleCard[]>([]);

    const key = computed(() => `${queryData.value}${page.value}`)
    let clearScrollObserver: (() => void) | null = null;

    const handArticleDetail = (id: string) => {
        router.push({
            path: `/articleDetail/${id}`,
            query: {
                id,
            }
        })
    }

    const loadSearchArticleList = async () => {
        // if (queryData.value) {
        if (isLoading.value || isFinished.value) return;

        isLoading.value = true
        const articlesData = await usePaginationCache(
            CACHE_KEYS.SEARCH_ARTICLE_LIST,
            key.value,
            '/search',
            queryData.value ?
                { page: page.value, keyword: queryData.value } : { page: page.value }
        )
        if (articlesData.list.length === 0) {
            isFinished.value = true
            return;
        }
        articles.value = [...articles.value, ...articlesData.list]

        searchResult.value = articlesData.total
        nextPage()

        isLoading.value = false


    }
    const clear = () => {
        if (clearScrollObserver) {
            clearScrollObserver()
            clearScrollObserver = null
        }
    }
    return {
        queryData,
        searchResult,
        articles,
        isFinished,
        handArticleDetail,
        loadSearchArticleList,
        clear
    }
}
