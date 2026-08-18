// Vue API 由 unplugin-auto-import 全局注入
import type { VNodeRef } from 'vue'
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
  let pendingDanmakus: DanmakusList[] = []  // 待发射队列

  const handleFocus = () => {
    isShow.value = true
  }

  const handleTreehole = async () => {

    if (!store.token) return ElMessage.error('请先登录')

    const error = validateContent(content.value, { max: 100, name: '弹幕' })
    if (error) return ElMessage.error(error)

    const result = await post('/treehole', { content: content.value.trim() })

    if (!result.success) return

    ElMessage.success('你的弹幕已送达～')

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

  return {
    isShow,
    allDanmus,
    content,
    setDanmakuRef,
    danmakuRef,
    handleFocus,
    handleTreehole,
    initTreehole,
    clearIntervalTimer
  }
}
