import { ref } from 'vue';
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { gsap } from 'gsap'
import { useCounterStore } from '@/stores/counter'
import type { Article } from '@/types/index'
import { usePaginationCache } from '@/utils/helpers'
import { usePageControl } from '@/composables/usePageControl'
import { initHomeRightScrollAnimations, setLoadMoreContainerRef, handleScroll } from '@/utils/helpers'
import { CACHE_KEYS } from '@/constants/cacheKeys';

export function useHome() {
    let time: number
    let clearScrollObserver: (() => void) | null = null;
    let clearLoadMoreObserver: (() => void) | null = null;
    const currentIndex = ref(0)
    const imgs = [
        '/src/assets/13.png',
        '/src/assets/5.jpg',
        '/src/assets/12.png'
    ]

    const ImgArr = ref<(HTMLElement | null)[]>([])
    const articleList = ref<Article[]>([])
    gsap.registerPlugin(ScrollTrigger)
    let observer = ref<IntersectionObserver | null>(null)
    const homediv = ref<HTMLElement | null>(null)
    const store = useCounterStore()

    const { page, nextPage } = usePageControl()

    const isLoading = ref<boolean>(false)
    const isFinished = ref<boolean>(false)
    const isShow = ref<boolean>(false)

    const ARTICLE_PATH = '/article'

    const setImgRef = (el: HTMLElement | null, index: number) => {

        if (el) ImgArr.value[index] = el
    }

    //背景图变换
    const startZoomAnimation = (index: number) => {
        const nextImg = ImgArr.value[index];
        if (!nextImg) return;

        ImgArr.value.forEach((img, i) => {
            if (i === index) {
                // 当前图片：执行缩放 + 淡入
                gsap.fromTo(img,
                    { scale: 1, opacity: 0 },
                    { scale: 1.1, opacity: 1, duration: 5, ease: 'power1.out' }
                );
            } else {
                // 其他图片：淡出并降低层级，防止遮挡
                gsap.to(img, { opacity: 0, zIndex: 0, duration: 1.5 });
            }
        });
    }

    const loadMore = async () => {
        if (isLoading.value || isFinished.value) return;

        isLoading.value = true
        const articleListData = await usePaginationCache(
            CACHE_KEYS.CACHE_TYPE_ARTICLE_LIST,
            page.value,
            ARTICLE_PATH,
            { page: page.value }
        )

        if (articleListData.list.length === 0) {
            isFinished.value = true
            return;
        }
        articleList.value = [...articleList.value, ...articleListData.list]
        nextPage()

        isLoading.value = false
    }

    const initHomePage = async () => {

        // 等待 DOM 更新后再执行动画
        setTimeout(() => {
            //右边小组件动画
            initHomeRightScrollAnimations('.home-right>*')
        }, 0)

        startZoomAnimation(0)

        //背景图变换
        time = setInterval(() => {
            currentIndex.value = (currentIndex.value + 1) % imgs.length
            startZoomAnimation(currentIndex.value)
        }, 6000)

        //导航栏的显示与隐藏
        observer.value = new IntersectionObserver(
            (entries) => {
                entries.forEach(item => {
                    if (item.isIntersecting) {
                        store.header = true
                    } else {
                        store.header = false
                    }
                })
            },
            { threshold: 0.2 }
        )
        if (homediv.value) {
            observer.value.observe(homediv.value)
        }
    }
    const cleanupHomePage = () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill())
        clearInterval(time)
        gsap.killTweensOf(ImgArr.value)
        if (observer.value) {
            observer.value.disconnect()
            observer.value = null
        }
        if (clearScrollObserver) {
            clearScrollObserver()
            clearScrollObserver = null
        }
        if (clearLoadMoreObserver) {
            clearLoadMoreObserver()
            clearLoadMoreObserver = null
        }
    }
    const setScroll = (el: HTMLElement | null) => {
        if (!el) return;

        clearScrollObserver = handleScroll((newState) => isShow.value = newState, el)
    }

    const setLoadMoreContainerRefWrapper = (el: Element | null) => {
        if (!el) return;

        clearLoadMoreObserver = setLoadMoreContainerRef(el, loadMore);
    }

    return {
        imgs,
        articleList,
        isFinished,
        isShow,
        setImgRef,
        initHomePage,
        cleanupHomePage,
        setLoadMoreContainerRefWrapper,
        loadMore,
        setScroll,
    }
}