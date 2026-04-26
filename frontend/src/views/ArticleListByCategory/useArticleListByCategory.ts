import { computed, ref } from 'vue'
import { useRoute } from 'vue-router';
import type { LocationQueryValueRaw } from 'vue-router'
import type { Article } from '@/types/index'
import { usePaginationCache, setLoadMoreContainerRef } from '@/utils/helpers'
import { usePageControl } from '@/composables/usePageControl'
import { CACHE_KEYS } from '@/constants/cacheKeys'


export function useArticleListByCategory() {
    const route = useRoute()
    let clearObserver: (() => void) | null = null;
    const articleList = ref<Article[]>([])
    const isLoading = ref<boolean>(false)
    const isFinished = ref<boolean>(false)
    const queryData = computed(() => {
        const getData = (val: LocationQueryValueRaw) => Array.isArray(val)
            ? val[0]
            : val
        return {
            title: getData(route.query.title as LocationQueryValueRaw || ''),
            desc: getData(route.query.desc as LocationQueryValueRaw || ''),
            articleCount: getData(route.query.articleCount as LocationQueryValueRaw || ''),
            path: getData(route.query.path as LocationQueryValueRaw || '')
        }
    })
    //页数和下一页函数
    const { page, nextPage } = usePageControl()
    const categoryTab = computed(() => {

        if (queryData.value.path === 'categories') return 'tag'

        return 'category'
    })
    const path = `/${queryData.value.path}/${queryData.value.title}`
    const key = computed(() => `${queryData.value.title}${page.value}`)

    const fetchArticleCategoryTagList = async () => {

        if (isLoading.value || isFinished.value) return;

        isLoading.value = true;

        const articleListData = await usePaginationCache(
            CACHE_KEYS.CURRENT_CATEGORY_ARTICLES,
            key.value,
            path,
            { page: page.value, content: queryData.value.title }
        )

        if (articleListData.list.length === 0) {
            isFinished.value = true
            return;
        }
        articleList.value = [...articleList.value, ...articleListData.list]

        nextPage()

        isLoading.value = false

    }
    const setLoadMoreContainerRefWrapper = (el: HTMLElement | null) => {
        if (!el) return;

        clearObserver = setLoadMoreContainerRef(el, fetchArticleCategoryTagList)
    }
    const cleanupuseArticleListByCategory = () => {
        if (clearObserver) {
            clearObserver()
            clearObserver = null
        }
    }
    const loadMore = async () => {
        await fetchArticleCategoryTagList();
    }
    return {
        queryData,
        articleList,
        categoryTab,
        isFinished,
        fetchArticleCategoryTagList,
        setLoadMoreContainerRefWrapper,
        cleanupuseArticleListByCategory,
        loadMore
    }
}
