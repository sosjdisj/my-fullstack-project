// Vue API 由 unplugin-auto-import 全局注入
import { useUserStore } from '@/stores/user'
import { get, post } from '@/api/request'
import { validateContent } from '@/utils/validation'
import type { DanmakusList } from '@/types/index'

interface Danmu {
  text: string
  color: string
  avatar: string
}

type DanmakuComponent = ComponentPublicInstance & {
  play(): void
  pause(): void
  stop(): void
  addDanmu(data: Danmu): void
  clear(): void
}

export function useTreehole() {
  const isShow = ref(false)

  const danmakuRef = ref<DanmakuComponent | null>(null)

  const allDanmus = ref<Danmu[]>([])
  const content = ref<string>('')
  const store = useUserStore()
  let time: number | null

  const BATCH_SIZE = 30
  const LOW_STOCK_THRESHOLD = 10  // 低于10条时补充
  const HOVER_GRACE = 100  // 鼠标移动宽限期(ms)，区分"主动悬停"与"弹幕滑过静止光标"
  let pendingDanmakus: DanmakusList[] = []  // 待发射队列

  // 记录最近一次鼠标移动时间：光标静止时飞过的弹幕不应被暂停
  let lastMouseMoveAt = 0
  const markMouseMove = () => { lastMouseMoveAt = Date.now() }
  window.addEventListener('mousemove', markMouseMove, { passive: true })
  onUnmounted(() => window.removeEventListener('mousemove', markMouseMove))

  const handleFocus = () => {
    isShow.value = true
  }

  const isSubmitting = ref(false)

  const handleTreehole = async () => {

    if (!store.token) return ElMessage.error('请先登录')

    const error = validateContent(content.value, { max: 100, name: '弹幕' })
    if (error) return ElMessage.error(error)

    isSubmitting.value = true
    try {
      const result = await post('/treehole', { content: content.value.trim() })

      if (!result.success) return

      ElMessage.success('你的弹幕已送达～')
    } finally {
      isSubmitting.value = false
    }
  }

  const fetchNewDanmakus = async () => {
    const result = await get('/treehole', { limit: BATCH_SIZE })

    if (result.success) {

      const { data } = result.data
      pendingDanmakus = [...pendingDanmakus, ...data]
    }
  }

  const shootDanmaku = () => {
    // 待发射弹幕不足时，提前获取
    if (pendingDanmakus.length < LOW_STOCK_THRESHOLD) {
      fetchNewDanmakus()
    }

    // 没弹幕了就跳过
    if (pendingDanmakus.length === 0) return

    // 随机取一条发射（或者按顺序取）
    const randomIndex = Math.floor(Math.random() * pendingDanmakus.length)

    const newDanmaku: Danmu = {
      text: pendingDanmakus[randomIndex]?.content || '',
      color: '#fff',
      avatar: pendingDanmakus[randomIndex]?.avatar || ''
    }

    // 使用 addDanmu 方法添加弹幕
    danmakuRef.value?.addDanmu(newDanmaku)

    pendingDanmakus.splice(randomIndex, 1)
  }

  const initTreehole = async () => {
    await fetchNewDanmakus()  // 先加载数据
    // 等待组件渲染后开始发射弹幕
    setTimeout(() => {
      time = setInterval(shootDanmaku, 1000)
    }, 500)
  }

  const clearIntervalTimer = () => {
    if (time) {
      clearInterval(time)
    }
  }

  const setDanmakuRef = (el: any) => {
    danmakuRef.value = el
  }

  /** 悬停暂停：只冻结用户主动放上去的那一条；弹幕自己滑入静止光标时不暂停 */
  const handleDanmuOver = (e: MouseEvent) => {
    if (Date.now() - lastMouseMoveAt > HOVER_GRACE) return
    const dm = (e.target as HTMLElement).closest?.('.dm') as HTMLElement | null
    dm?.classList.add('dm-pause')
  }

  /** 移开恢复：只解除当前这一条，其他弹幕不受影响 */
  const handleDanmuOut = (e: MouseEvent) => {
    const dm = (e.target as HTMLElement).closest?.('.dm') as HTMLElement | null
    if (!dm) return
    // 光标只是在该弹幕内部子元素间移动，不解除
    const related = e.relatedTarget as HTMLElement | null
    if (related && dm.contains(related)) return
    // 浮动动画导致的边界抖动（光标实际仍在弹幕范围内），不解除
    const r = dm.getBoundingClientRect()
    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) return
    dm.classList.remove('dm-pause')
  }

  return {
    isShow,
    isSubmitting,
    allDanmus,
    content,
    setDanmakuRef,
    danmakuRef,
    handleFocus,
    handleTreehole,
    initTreehole,
    clearIntervalTimer,
    handleDanmuOver,
    handleDanmuOut
  }
}
