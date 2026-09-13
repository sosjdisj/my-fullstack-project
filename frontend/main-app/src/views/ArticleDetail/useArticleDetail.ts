// Vue/Vue Router API 与 Ref 类型由 unplugin-auto-import 全局注入
import type { Article, ArticleNeighbor, ArticleComment } from '@/types/index'
import { setLoadMoreContainerRef, usePaginationCache } from '@/utils/helpers'
import { CACHE_KEYS } from '@/constants/cacheKeys'
import { usePageControl } from '@/composables/usePageControl'
import { scrollToComment } from '@/utils/helpers'
import { useUserStore } from '@/stores/user'
import type Remark from '@/components/business/article/Remark.vue'

export function useArticleDetail(remarkComponentRef: Ref<InstanceType<typeof Remark> | null>) {
    const route = useRoute()
    const userStore = useUserStore()
    const comments = ref<ArticleComment[]>([])

    const queryData = computed(() => {
        const getParam = (param: string) => {
            return Array.isArray(route.query[param])
                ? route.query[param][0]
                : route.query[param]
        }

        return {
            id: getParam('id'),
        }
    })

    const articleData = ref<Article>({
        id: '',
        cover: '',
        title: '',
        pageViews: 0,
        comments: 0,
        likes: 0,
        wordCount: 0,
        category: '',
        author: '',
        avatar: '',
        collects: 0,
        tag: '',
        published: '',
        updated: '',
        content: '',
        isLiked: false,
        isCollected: false
    })
    const prev = ref<ArticleNeighbor | undefined>()
    const next = ref<ArticleNeighbor | undefined>()
    let clearObserver: (() => void) | null = null;

    const isDataReady = ref<boolean>(false)
    const isLoading = ref<boolean>(false)
    const isFinished = ref<boolean>(false)

    const ARTICLE_DATA_KEY = '/article'

    const { page, nextPage } = usePageControl()

    const handleUpdateDataLike = (updateLikes: number) => {
        articleData.value.likes = updateLikes
    }
    const handleUpdateDataFavorites = (updateFavorites: number) => {
        articleData.value.collects = updateFavorites
    }

    const fetchArticleData = async () => {
        isDataReady.value = false

        if (!queryData.value.id) return;

        const articleDataCache = await usePaginationCache(
            CACHE_KEYS.ARTICLE_DATA,
            queryData.value.id,
            `${ARTICLE_DATA_KEY}/${queryData.value.id}`
        )
        console.log(articleDataCache)
        if (!articleDataCache) return;

        articleData.value = articleDataCache
        prev.value = articleDataCache.prev
        next.value = articleDataCache.next


        setTimeout(() => {
            isDataReady.value = true
        }, 100)
    }

    const fetchComments = async () => {
        if (isLoading.value || isFinished.value) return;

        isLoading.value = true;
        try {
            const commentsListData = await usePaginationCache(
                CACHE_KEYS.COMMENTS_KEY,
                `${queryData.value.id}_${page.value}`,
                `${ARTICLE_DATA_KEY}/${queryData.value.id}/comments`,
                { page: page.value }
            )
            if (commentsListData.list.length === 0) {
                isFinished.value = true
                return;
            }

            comments.value = [...comments.value, ...commentsListData.list]
            nextPage()

        } catch {
            console.error('分页加载数据失败');
            return;
        } finally {
            isLoading.value = false
        }
    }

    const setLoadMoreContainerRefWrapper = (el: HTMLElement | null) => {
        if (!el) return;

        clearObserver = setLoadMoreContainerRef(el, fetchComments)
    }
    const cleanupuseArticleListByCategory = () => {
        if (clearObserver) {
            clearObserver()
            clearObserver = null
        }
    }

    const handleScrollToComment = () => {
        const domElement = remarkComponentRef.value?.remark
        if (!domElement) return
        scrollToComment(domElement);
    }

    /** 评论发表成功后，本地插入新评论并更新评论数，无需重新请求 */
    const handleCommentPosted = ({ content, count }: { content: string, count: number }) => {
        articleData.value.comments = count
        comments.value.unshift({
            _id: Date.now(),
            username: userStore.username ?? '',
            avatar: userStore.avatar ?? '',
            content,
            createTime: new Date().toLocaleDateString('sv-SE')
        } as ArticleComment)
    }

    const loadMore = async () => {
        await fetchComments();
    }

    return {
        queryData,
        articleData,
        prev,
        next,
        isDataReady,
        isFinished,
        comments,
        handleUpdateDataLike,
        handleUpdateDataFavorites,
        fetchArticleData,
        fetchComments,
        setLoadMoreContainerRefWrapper,
        cleanupuseArticleListByCategory,
        handleScrollToComment,
        handleCommentPosted,
        loadMore
    }
}