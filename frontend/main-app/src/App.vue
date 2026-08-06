<script setup lang="ts">
  import MainNavbar from './components/layout/MainNavbar.vue'
  import '@/styles/初始化.css'
  import { useUserStore } from '@/stores/user'
  // Vue/Vue Router/Pinia API 由 unplugin-auto-import 全局注入
  import CollapseButton from '@/components/ui/CollapseButton.vue'
  import { get } from '@/api/request'
  import { saveUserInfo, clearUser } from '@/utils/helpers'

  // 非关键组件（包含 Socket.IO 连接）异步加载，不阻塞首屏渲染
  const OnlineStatus = defineAsyncComponent({
    loader: () => import('@/components/business/OnlineStatus.vue'),
  })

  const store = useUserStore()
  const route = useRoute()
  const router = useRouter()
  const key = computed(() => route.path.startsWith('/musicPlayer') ? 'music-app-stable' : route.fullPath)

  // 多Tab登出同步：监听其他Tab清除token
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'token' && e.newValue === null && e.oldValue !== null) {
      clearUser()
      if (route.path !== '/login') {
        router.push('/home')
      }
    }
  }

  onMounted(async () => {
    window.addEventListener('storage', handleStorageChange)

    const token = localStorage.getItem('token')

    if (token) {
      try {
        const res = await get('/verify')
        if (res.success) {
          const userInfo = res.data.data
          // 验证成功后把 localStorage 中的 token 写回 store，
          // 否则刷新页面后 store.token 为 null，微应用拿不到鉴权信息
          saveUserInfo(store, {
            username: userInfo.username,
            avatar: userInfo.avatar,
            signature: userInfo.signature,
            token,
          })
        }
      } catch (error) {
        // 拦截器续签失败抛出异常时，也会走到这里
        store.token = null
      }
    }
  })

  onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange)
  })
</script>

<template>
  <MainNavbar />

  <OnlineStatus />

  <CollapseButton />

  <RouterView v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" :key="key" />
    </transition>
  </RouterView>
</template>

<style lang="less">
  // 为主应用添加命名空间以实现样式隔离
  #app {
    width: 100%;
    height: 100vh;
    // overflow: hidden;
  }

  .page-enter-active,
  .page-leave-active {
    transition: opacity 0.4s ease;
  }

  .page-enter-from,
  .page-leave-to {
    opacity: 0;
  }

</style>