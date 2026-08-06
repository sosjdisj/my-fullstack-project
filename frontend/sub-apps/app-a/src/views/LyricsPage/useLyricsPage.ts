import { ref, watch, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { get } from '@/api/request'
import { parseLrc, findCurrentLine } from '@/utils/lrc'
import type { LrcLine } from '@/utils/lrc'

export function useLyricsPage() {
  const router = useRouter()
  const store = useUserStore()

  const songName = computed(() => store.selectedmusic?.name ?? '未在播放')
  const singer = computed(() => store.selectedmusic?.singer ?? '')
  const coverUrl = computed(() => store.selectedmusic?.cover ?? '/images/5.jpg')
  const songId = computed(() => store.selectedmusic?.id)

  const lrcLines = ref<LrcLine[]>([])
  const lyricsBody = ref<HTMLElement | null>(null)
  const lineRefs = new Map<number, HTMLElement>()
  const currentLine = ref(0)

  const setLineRef = (el: HTMLElement | null, idx: number) => {
    if (el) lineRefs.set(idx, el)
  }

  /** 歌词自动滚动偏移量 */
  const scrollOffset = computed(() => {
    if (!lyricsBody.value) return 0
    const containerH = lyricsBody.value.clientHeight
    const activeEl = lineRefs.get(currentLine.value)
    if (!activeEl) return containerH / 2
    return containerH / 2 - activeEl.offsetTop - activeEl.clientHeight / 2
  })

  /** 当前高亮行 - 从 store 读取共享的播放进度 */
  watch(() => store.currentTime, (time) => {
    if (!lrcLines.value.length) return
    currentLine.value = findCurrentLine(lrcLines.value, time)
  })

  /** 切歌时重新加载歌词 */
  watch(songId, async (id) => {
    if (!id) { lrcLines.value = []; return }
    const res = await get(`/songs/${id}/lyrics`)
    console.log(res)
    if (res.success && res.data.data.lrc) {
      lrcLines.value = parseLrc(res.data.data.lrc)
    } else {
      lrcLines.value = []
    }
    currentLine.value = 0
    // 重置行引用，避免上一次的元素残留
    lineRefs.clear()
    await nextTick()
  }, { immediate: true })

  const goBack = () => {
    router.back()
  }

  return {
    songName,
    singer,
    coverUrl,
    lrcLines,
    lyricsBody,
    currentLine,
    scrollOffset,
    setLineRef,
    goBack
  }
}
