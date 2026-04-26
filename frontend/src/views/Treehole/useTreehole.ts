import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useCounterStore } from '@/stores/counter'
import { get, post } from '@/api/request'
import type { DanmakusList } from '@/types/index'

interface Danmu {
  text: string
  color: string
  avatar: string
}

export function useTreehole() {
  const isShow = ref(false)

  const allDanmus = ref<Danmu[]>([])
  const content = ref<string>()
  const store = useCounterStore()
  let time: number | null

  const BATCH_SIZE = 30
  const LOW_STOCK_THRESHOLD = 10  // 低于10条时补充
  let pendingDanmakus: DanmakusList[] = []  // 待发射队列

  const handleFocus = () => {
    isShow.value = true
  }

  const handleTreehole = async () => {

    if (!store.token) return ElMessage.error('请先登录')

    if (!content.value) return ElMessage.error('弹幕内容不能为空')

    const result = await post('/treehole', { content: content.value })

    if (!result.success) return

    ElMessage.success('你的弹幕已送达～')

  }

  const fetchNewDanmakus = async () => {
    const result = await get('/treehole', { limit: BATCH_SIZE })

    if (result.success) {
      const { list } = result.data.data
      pendingDanmakus = [...pendingDanmakus, ...list]
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
    allDanmus.value.push(newDanmaku)
    pendingDanmakus.splice(randomIndex, 1)
  }

  const initTreehole = () => {
    fetchNewDanmakus()  // 初始加载
    time = setInterval(shootDanmaku, 1000)
  }
  const clearIntervalTimer = () => {
    if (time) {
      clearInterval(time)
    }
  }

  return {
    isShow,
    allDanmus,
    content,
    handleFocus,
    handleTreehole,
    initTreehole,
    clearIntervalTimer
  }
}
