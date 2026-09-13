<template>
    <!-- 单根包裹：Transition 不能作用于多根组件（原先是加载占位 + micro-app 两个根），
         否则离开动画定位不到元素，且 out-in 模式会延迟卸载 micro-app，
         iframe 沙箱存活期间与新页面挂载竞态 → 跳转登录页后整页空白 -->
    <div class="micro-app-wrapper">
        <!-- 玻璃风加载占位：覆盖在微应用容器上，mounted/error 生命周期后淡出 -->
        <Transition name="fade">
            <div v-if="isLoading" class="micro-loading">
                <div class="glass-pill">
                    <GlassSpinner :size="18" />
                    <span>加载中...</span>
                </div>
            </div>
        </Transition>

        <!-- active=false 时立即移除元素触发 micro-app 卸载，不等过渡动画。
             router-mode="state"：子应用路由只存内存 state，不同步到父窗口 URL/历史。
             默认 search 模式会改写父 URL query 并操作 history，子应用内导航取消
             （如未登录点"我的"触发守卫 next(false)）时会触发 popstate 冲断
             dispatch→主应用跳登录 的链路，导致跳转失效 + 子应用被重置白屏 -->
        <micro-app v-if="active" name='MusicApp' baseroute="/musicPlayer" router-mode="state" :url="musicAppUrl" :data="userData"
            @mounted='hideLoading' @error='hideLoading'
            @datachange='handleDataChange'></micro-app>
    </div>
</template>

<script setup lang="ts">
    // Vue/Vue Router/Pinia API 由 unplugin-auto-import 全局注入
    // 按需加载 micro-app：仅在进入音乐播放器路由时注册 <micro-app> 自定义元素
    import '@micro-zoe/micro-app'
    import GlassSpinner from '@/components/ui/GlassSpinner.vue'
    import { useUserStore } from '@/stores/user'

    const store = useUserStore()
    const router = useRouter()

    // 微应用加载状态：路由渲染即展示，等子应用挂载完成或出错后淡出
    const isLoading = ref(true)
    const hideLoading = () => {
        isLoading.value = false
    }

    // 微应用存活标记：离开 /musicPlayer 时立刻置 false 卸载 <micro-app>。
    // transition mode="out-in" 会等 0.4s 离场动画结束才移除组件 DOM，
    // 期间 iframe 沙箱仍存活，其内部路由同步/卸载逻辑会与目标页（如 /login）
    // 的挂载竞态，导致路由视图渲染被吞掉（整页空白）
    const active = ref(true)
    onBeforeRouteLeave(() => {
        active.value = false
        isLoading.value = false
    })

    // 音乐微应用地址：开发环境走 VITE_MUSIC_APP_URL（localhost:5175），生产同源经 nginx /app-a/ 代理
    const musicAppUrl = import.meta.env.VITE_MUSIC_APP_URL || `${window.location.origin}/app-a/`

    const MESSAGE_TYPES = {
        type: {
            ROUTE_REQUEST: 'ROUTE_REQUEST'
        },
        action: {
            REDIRECT_LOGIN: 'REDIRECT_LOGIN'
        }
    } as const

    const userData = computed(() => ({
        username: store.username,
        avatar: store.avatar,
        token: store.token
    }))

    const handleDataChange = (e: CustomEvent) => {
        const { type, action } = e.detail.data

        if (
            type === MESSAGE_TYPES.type.ROUTE_REQUEST &&
            action === MESSAGE_TYPES.action.REDIRECT_LOGIN
        ) {
            router.push('/login')
        }
    }

</script>

<style lang="less" scoped>
    // 单根包裹层：撑满容器，保证过渡动画作用于它而 micro-app 内部布局不受影响
    .micro-app-wrapper {
        width: 100%;
        height: 100%;
    }

    // 玻璃风变量（与项目暗色玻璃风一致）
    @glass-bg: rgba(255, 255, 255, 0.08);
    @glass-border: rgba(255, 255, 255, 0.12);

    .micro-loading {
        position: fixed;
        inset: 0;
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #1c1e26;
    }

    .glass-pill {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 28px;
        background: @glass-bg;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid @glass-border;
        border-radius: 100px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 1px;
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.3s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }
</style>