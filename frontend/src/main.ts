import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { enableMocking } from './mock/index'
import '@fortawesome/fontawesome-free/css/all.min.css'
import lazy from '@/directives/lazyBg'
import microApp from '@micro-zoe/micro-app'

// enableMocking().then(() => {
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// 注册背景图懒加载指令
app.directive('lazy', lazy)
microApp.start({
  'iframe': true
})
app.mount('#app')

// })