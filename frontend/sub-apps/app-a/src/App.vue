<script setup lang="ts">
  import { get } from '@/api/request'
  import { saveUserInfo } from '@/composables/useAuth'
  import { useUserStore } from '@/stores/user'
  import { onMounted } from 'vue'

  const store = useUserStore()

  onMounted(async () => {

    if (window.__MICRO_APP_ENVIRONMENT__) {
      //获取主应用传来的数据
      window.microApp?.addDataListener((data) => {

        const { username, avatar, token, } = data
        saveUserInfo(store, { username, avatar, token })
      }, true)
    } else {
      const token = localStorage.getItem('token')

      if (token) {
        try {
          const res = await get('/verify')
          if (res.success) {
            const userInfo = res.data.data
            saveUserInfo(store, {
              username: userInfo.username,
              avatar: userInfo.avatar,
            })
          }
        } catch (error) {
          // 拦截器续签失败抛出异常时，也会走到这里
          store.token = null
        }
      }
    }
    
  })
</script>

<template>
  <RouterView v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </RouterView>
</template>

<style>

  /*全局样式重置 */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    user-select: none;
  }

  html,
  body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    /*页面级滚动 */
  }

  #app {
    width: 100%;
    height: 100vh;
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