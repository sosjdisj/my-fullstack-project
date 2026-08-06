import { computed } from 'vue'
import { useUserStore } from '../../stores/user'

export function useMyMusic() {
  const store = useUserStore()
  const name = computed(() => store.username)
  const avatar = computed(() => store.avatar)

  return {
    name,
    avatar
  }
}
