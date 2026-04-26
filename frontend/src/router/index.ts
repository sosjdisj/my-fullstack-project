import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { useCounterStore } from '@/stores/counter'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    name: '首页',
    path: '/home',
    component: () => import('@/views/Home/index.vue'),
  },
  {
    name: '分类/标签列表',
    path: '/categoryTagList/:path',
    component: () => import('@/views/CategoryTagList/index.vue'),
    props: true,
  },
  {
    name: '分类文章列表',
    path: '/articleListByCategorys/:type',
    component: () => import('@/views/ArticleListByCategory/index.vue'),
  },
  {
    name: '标签文章列表',
    path: '/articleListBytabs/:type',
    component: () => import('@/views/ArticleListByCategory/index.vue'),
  },
  {
    name: '时间轴',
    path: '/timeline',
    component: () => import('@/views/Timeline/index.vue')
  },
  {
    name: '树洞',
    path: '/treehole',
    component: () => import('@/views/Treehole/index.vue')
  },
  {
    name: '文章详情',
    path: '/articleDetail/:path',
    component: () => import('@/views/ArticleDetail/index.vue'),
  },
  {
    name: 'Setting',
    path: '/setting',
    component: () => import('@/views/Setting/index.vue')
  },
  // {
  //   name: '相册',
  //   path: '/gallery',
  //   component: () => import('@/views/Gallery.vue')
  // },
  {
    name: '登录',
    path: '/login',
    component: () => import('@/views/Login/index.vue')
  },
  {
    name: '注册',
    path: '/register',
    component: () => import('@/views/Register/index.vue')
  },
  {
    name: '个人主页',
    path: '/fullProfile',
    component: () => import('@/views/FullProfile/index.vue')
  },
  {
    name: '忘记密码',
    path: '/reset',
    component: () => import('@/views/Reset/index.vue')
  },
  {
    name: '音乐',
    path: '/musicPlayer/:pathMatch(.*)*',
    component: () => import('@/views/MicroAppContainer.vue'),
  },
  {
    name: '搜索文章列表',
    path: '/searchResult',
    component: () => import('@/views/SearchResult/index.vue')
  },
  {
    name: '助手',
    path: '/aiChat',
    component: () => import('@/views/AiChat/index.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    // 始终滚动到顶部（x: 水平位置, y: 垂直位置）
    return { top: 0, left: 0 };
    // 如果是 Vue Router 4.0+ 也可以简写：return { el: '#app', top: 0 }
  },
})


export default router
