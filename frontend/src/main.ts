import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'element-plus/theme-chalk/dark/css-vars.css'
import lazy from '@/directives/lazyBg'


const app = createApp(App)

app.use(createPinia())
app.use(router)

// 注册背景图懒加载指令
app.directive('lazy', lazy)
// microApp.start({
//   'iframe': true
// })
app.mount('#app')
