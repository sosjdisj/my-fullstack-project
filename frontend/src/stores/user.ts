import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const username = ref<string | null>(null)
  const avatar = ref<string | null>(null)
  const signature = ref<string>('')
  const token = ref<string | null>(null)
  const header = ref(false)

  return { username, avatar, signature, token, header }
})
