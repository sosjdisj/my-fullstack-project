import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.ts'
import 'element-plus/theme-chalk/dark/css-vars.css'
// 命令式 API 的样式不会被 unplugin-vue-components 自动注入，需手动按需引入
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/notification/style/css'
import 'element-plus/es/components/loading/style/css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import lazy from '@/directives/lazyBg'
import microApp from '@micro-zoe/micro-app'


const app = createApp(App)

app.use(createPinia())
app.use(router)

// 全局注册 Element Plus 图标组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册背景图懒加载指令
app.directive('lazy', lazy)
microApp.start({
  iframe: true
})
app.mount('#app')
