// Vue/Pinia API 由 unplugin-auto-import 全局注入
import { socket } from '@/socket'

export const useAppStore = defineStore('app', () => {
  const totalOnline = ref(0)
  const isInitialized = ref(false)

  const initSocketListeners = () => {
    if (isInitialized.value) return

    socket.on('total online', (count: number) => {
      totalOnline.value = count
    })

    isInitialized.value = true
  }

  return { totalOnline, isInitialized, initSocketListeners }
})
