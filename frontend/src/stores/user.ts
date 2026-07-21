// Vue/Pinia API 由 unplugin-auto-import 全局注入

export const useUserStore = defineStore('user', () => {
  const username = ref<string | null>(null)
  const avatar = ref<string | null>(null)
  const signature = ref<string>('')
  const token = ref<string | null>(null)
  const header = ref(false)

  return { username, avatar, signature, token, header }
})
