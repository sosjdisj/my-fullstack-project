import { ref, nextTick } from 'vue'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { gsap } from 'gsap'
import { useRoute, useRouter } from 'vue-router'
import { get } from '@/api/request'
import type { TimelineList } from '@/types/index'
import { setLoadMoreContainerRef } from '@/utils/helpers'
import { usePageControl } from '@/composables/usePageControl'

export function useTimeline() {
  const route = useRoute()
  const router = useRouter()
  const defaultBgImage = '/src/ass/【哲风壁纸】伞-和服-少女.png'
  gsap.registerPlugin(ScrollTrigger)

  // 响应式数据
  const timelienList = ref<TimelineList[]>([])
  const containerRefs = ref<(HTMLElement | null)[]>([])
  const currentBgImage = ref('') // 当前展示的背景图
  const isLoading = ref<boolean>(false)
  const isFinished = ref<boolean>(false)

  let time: number | null
  let imageObserver: IntersectionObserver | null = null
  const observedElements = new WeakSet<HTMLElement>() // 用 WeakSet 自动垃圾回收
  const animatedElements = new WeakSet<HTMLElement>()

  let clearLoadMoreObserver: (() => void) | null = null;

  const { page, nextPage } = usePageControl()


  // 引用收集
  const setContainerRef = (el: HTMLElement | null, index: number) => {
    if (el) containerRefs.value[index] = el
  }

  // 初始化逻辑
  const initTimeline = async () => {
    if (isLoading.value || isFinished.value) return;
    // 1. 获取数据
    isLoading.value = true
    const result = await get(route.path, { page: page.value })
    // 注入动态色相 hue，让 CSS 可以拿到 --hue 变量
    if (result.success) {

      const { list } = result.data.data

      if (list.length === 0) {
        isFinished.value = true
        return;
      }

      const currentLength = timelienList.value.length
      timelienList.value = [...timelienList.value, ...list.map((item: TimelineList, index: number) => ({
        ...item,
        hue: ((currentLength + index) * 60) % 360 // ✅ 基于总长度计算
      }))]
      nextPage()
    }

    await nextTick()

    observeCardVisibility()

    initTimelineScrollAnimations()
    isLoading.value = false

  }

  const observeCardVisibility = () => {
    // 2. 监听卡片进入视口，动态切换大背景图
    if (!imageObserver) {
      imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            //获取当前DOM元素的index
            const index = (entry.target as HTMLElement).dataset.index
            if (index !== undefined) {

              if (time) clearTimeout(time)

              time = setTimeout(() => {
                //拿出数据里的图片放入
                currentBgImage.value = timelienList.value[Number(index)]?.cover ?? ''
              }, 100)
            }
          }
        })
      }, { threshold: 0.85 })
    }

    //为每个DOM元素创建观察
    containerRefs.value.forEach((el, index) => {
      if (el && !observedElements.has(el as HTMLElement)) {
        (el as HTMLElement).dataset.index = index.toString()
        imageObserver!.observe(el)
        observedElements.add(el as HTMLElement)
      }
    })
  }

  const initTimelineScrollAnimations = () => {
    const items = gsap.utils.toArray<HTMLElement>('.timeline-item')
    items.forEach((item) => {

      if (animatedElements.has(item)) return
      animatedElements.add(item)

      const card = item.querySelector('.glass-card')
      const timeMarker = item.querySelector('.time-marker')
      const dot = item.querySelector('.dot-inner')

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: 'top 85%', // 提前一点开始动画
          end: 'top 10%',
          toggleActions: 'play reverse play reverse',
          // markers: true,
        }
      })

      // 卡片：从下方淡入并轻微缩放
      tl.fromTo(card,
        { opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' },
        { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' },
        '0'
      )

      // 时间标记：从侧面划入
      tl.fromTo(timeMarker,
        { opacity: 0, x: item.classList.contains('reverse') ? -30 : 30 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'back.out(1.7)' },
        '0.2'
      )

      // 关键点：发光圆点呼吸感
      tl.fromTo(dot,
        { scale: 0, boxShadow: '0 0 0px var(--node-color)' },
        { scale: 1.2, boxShadow: '0 0 20px var(--node-color)', duration: 0.4 },
        '0.4'
      )
    })
  }

  const handArticleData = (id: string) => {
    router.push({
      path: `/articleDetail/${id}`,
      query: {
        id,
      }
    })
  }

  // 清理逻辑
  const cleanup = () => {
    ScrollTrigger.getAll().forEach(t => t.kill())
    // 清理所有 GSAP 动画
    gsap.globalTimeline.clear()

    if (clearLoadMoreObserver) {
      clearLoadMoreObserver()
      clearLoadMoreObserver = null
    }

    // 清理 IntersectionObserver
    if (imageObserver) {
      imageObserver.disconnect()
      imageObserver = null
    }
  }

  const setLoadMoreContainerRefWrapper = (el: Element | null) => {
    if (!el) return;

    clearLoadMoreObserver = setLoadMoreContainerRef(el, initTimeline);
  }

  const loadMore = async () => {
    await initTimeline();
  }

  return {
    currentBgImage,
    timelienList,
    isFinished,
    defaultBgImage,
    setContainerRef,
    initTimeline,
    cleanup,
    handArticleData,
    setLoadMoreContainerRefWrapper,
    loadMore
  }
}
