import { createApp, type App as VueApp } from 'vue'
import { setupRouterGuards } from '@/router/index'
import { createPinia } from 'pinia'
// 按需导入 ElMessage 样式（微应用仅使用该命令式 API，无需全量注册 Element Plus）
import 'element-plus/es/components/message/style/css'
import App from '@/App.vue'
import {
    createRouter,
    createWebHistory,
    type Router,
    type RouterHistory,
} from 'vue-router'
import { routes } from './router'
// import { enableMocking } from '@/msw/index'
import lazy from '@/directives/lazyBg'

declare global {
    interface MicroAppProps {
        container: HTMLElement
    }
    interface Window {
        __MICRO_APP_ENVIRONMENT__?: boolean
        __MICRO_APP_BASE_ROUTE__?: string
        mount?: (props: MicroAppProps) => void
        unmount?: () => void
        /** 子应用实例名称 */
        __MICRO_APP_NAME__?: string
        /** 子应用的静态资源前缀 */
        __MICRO_APP_PUBLIC_PATH__?: string

        /** micro-app 核心通信对象 */
        microApp: {
            /** 监听主应用下发的数据。autoRun 为 true 表示绑定时立即触发一次 */
            addDataListener: (callback: (data: any) => void, autoRun?: boolean) => void
            /** 解绑监听函数 */
            removeDataListener: (callback: (data: any) => void) => void
            /** 向主应用发送数据 */
            dispatch: (data: any) => void
            /** 获取主应用下发的数据快照 */
            getData: () => any
            /** 清除当前子应用所有的监听 */
            clearDataListener: () => void
        }
    }
}

let app: VueApp | null = null
let router: Router | null = null
let history: RouterHistory | null = null
let el: HTMLElement | null = null

// 封装 mount 逻辑
const mount = (props?: any) => {
    const pinia = createPinia()
    // 优先使用 micro-app 提供的基础路由，也就是我在主应用写的baseroute
    const base = window.__MICRO_APP_BASE_ROUTE__ || '/musicPlayer'

    history = createWebHistory(base)
    router = createRouter({
        history,
        routes,
        strict: false
    })

    setupRouterGuards(router)

    // 确定挂载容器：优先使用基座提供的 container
    const container = props?.container || document.getElementById('app') || document.body

    // 内部创建一个 div 挂载，防止污染或找不到节点
    el = document.createElement('div')
    el.id = 'inner-music-app'
    container.appendChild(el)

    app = createApp(App)
    app.use(pinia)
    app.use(router)
    // 注册背景图懒加载指令
    app.directive('lazy', lazy)
    app.mount(el)
}

// 封装 unmount 逻辑
const unmount = () => {
    app?.unmount()
    el?.remove()
    app = null
    router = null
    history = null
    el = null
    window.microApp.clearDataListener()
}

// 🔥 起名字并绑定生命周期
// 这里的 'MusicApp' 必须和主应用 <micro-app name='MusicApp'> 一致
if (window.__MICRO_APP_ENVIRONMENT__) {
    // @ts-ignore
    window['micro-app-MusicApp'] = { mount, unmount }
} else {
    //独立运行时
    mount()
}

// 保留全局兼容
window.mount = mount
window.unmount = unmount
