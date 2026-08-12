import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import type { RouteRecordRaw, Router } from 'vue-router'

// 使用 RouteRecordRaw 类型定义路由，获得更好的类型提示
export const routes: Array<RouteRecordRaw> = [
    // 嵌入模式下不注册 /login 路由：登录由主应用统管，子应用不暴露独立登录入口
    // 独立运行时才注册，保证脱离主应用也能登录使用
    ...(!window.__MICRO_APP_ENVIRONMENT__ ? [{
        path: '/login',
        name: '登录',
        component: () => import('@/views/LoginPage/index.vue')
    }] : []),
    {
        path: '/',
        component: () => import('@/views/MusicPlayer/index.vue'),
        redirect: '/recommend',
        children: [
            {
                name: '推荐',
                path: '/recommend',
                component: () => import('@/views/RecommendMusic/index.vue'),
            },
            {
                name: '音乐馆',
                path: 'musichall',
                component: () => import('@/views/MusicHall/index.vue')
            },
            {
                name: '歌单',
                path: 'playlist/:id',
                component: () => import('@/views/PlaylistPage/index.vue'),
                // 可以为参数添加类型提示（在组件内使用）
                // props: true
            },
            {
                name: '我的音乐',
                path: 'my',
                component: () => import('@/views/MyMusic/index.vue'),
                meta: {
                    requiresAuth: true  // 🎯 只有这个路由需要权限验证
                }
            },
            {
                name: '歌词',
                path: 'lyrics',
                component: () => import('@/views/LyricsPage/index.vue')
            },
        ]
    }
]

// // 导出路由守卫函数
export const setupRouterGuards = (router: Router) => {
    router.beforeEach((to: any, _from: any, next: any) => {
        const store = useUserStore()

        if (to.meta.requiresAuth) {
            if (!store.token) {
                if (window.__MICRO_APP_ENVIRONMENT__) {
                    window.microApp.dispatch({
                        type: 'ROUTE_REQUEST',      // 消息类型
                        action: 'REDIRECT_LOGIN',   // 具体动作
                    })
                    // 阻止进入受保护页面，等主应用跳转登录
                    return next(false)
                } else {
                    ElMessage.error('请先登录')
                    // 携带原始目标路径，登录成功后用于跳回
                    return next({ path: '/login', query: { redirect: to.fullPath } })
                }
            }
        }
        next()
    })
}