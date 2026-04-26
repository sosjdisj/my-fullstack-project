<script setup lang="ts">
  import MainNavbar from './components/layout/MainNavbar.vue'
  import '@/styles/初始化.css'
  import { useCounterStore } from '@/stores/counter'
  import { onMounted, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import OnlineStatus from '@/components/business/OnlineStatus.vue'
  import CollapseButton from '@/components/ui/CollapseButton.vue'
  import { get } from '@/api/request'
  import { saveUserInfo } from '@/utils/helpers'

  const store = useCounterStore()
  const route = useRoute()
  const key = computed(() => route.path.startsWith('/musicPlayer') ? 'music-app-stable' : route.fullPath)

  onMounted(async () => {
    const token = localStorage.getItem('token')

    if (token) {
      try {
        const res = await get('/verify')
        if (res.success) {
          const userInfo = res.data.data
          saveUserInfo(store, {
            username: userInfo.username,
            avatar: userInfo.avatar,
            signature: userInfo.signature
          })
        }
      } catch (error) {
        // 拦截器续签失败抛出异常时，也会走到这里
        store.token = null
      }
    }
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