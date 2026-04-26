import { ref } from 'vue'
import { defineStore } from 'pinia'
import { get } from '@/api/request'
import { socket } from '@/socket'

// 缓存项类型：包含数据和缓存时间
interface CacheItem<T = any> {
  data: T
  timestamp: number
}

export const useCounterStore = defineStore('counter', () => {

  const username = ref<string | null>(null)//姓名
  const avatar = ref<string | null>(null)//头像
  const signature = ref<string>('')

  const token = ref<string | null>(null)
  const header = ref(false)

  const totalOnline = ref(0);//实时在线人数本站
  const isInitialized = ref(false); // 【保险开关】

  const CACHE_EXPIRE: { [key in string]: number } = {
    articleList: 5 * 60 * 1000,
    articleData: 5 * 60 * 1000,
    current_category_articles: 5 * 60 * 1000,
    tags_list: 5 * 60 * 1000,
    categories_list: 5 * 60 * 1000,
    search_article_list: 5 * 60 * 1000,
    real_time_hot_search: 5 * 60 * 1000,
    comments: 5 * 60 * 1000,
    user_collected: 5 * 60 * 1000,
    search_collected_articles: 5 * 60 * 1000
  }

  const caches = ref<Record<string, Map<string, CacheItem>>>({
    articleList: new Map(),
    articleData: new Map(),
    current_category_articles: new Map(),
    tags_list: new Map(),
    categories_list: new Map(),
    search_article_list: new Map(),
    real_time_hot_search: new Map(),
    comments: new Map(),
    user_collected: new Map(),
    search_collected_articles: new Map()
  })

  //缓存
  const setCache = async <T extends Record<string, any>>(type: string, key: string, path: string,
    data?: T
  ) => {
    if (!caches.value[type]) return;

    const result = await get(path, { ...data })

    if (!result.success) return;

    caches.value[type].set(key, {
      data: result.data.data,
      timestamp: Date.now()
    })

    return result.data.data

  }

  //获取缓存
  const getCache = (type: string, key: string) => {
    if (!caches.value[type]) return

    const cacheItem = caches.value[type].get(key)
    if (!cacheItem) return;

    const cachetime = CACHE_EXPIRE[type]
    if (cachetime && Date.now() - cachetime < cacheItem.timestamp) {
      return cacheItem.data
    }
    return;
  }

  // 初始化监听：这些监听器在整个应用生命周期内只运行一次
  const initSocketListeners = () => {

    if (isInitialized.value) return;
    // A. 监听全站人数
    socket.on('total online', (count: number) => {
      totalOnline.value = count;
    });

    isInitialized.value = true;
  };

  return {
    avatar, username, header, token, totalOnline,
    signature,
    getCache, setCache, initSocketListeners
  }
})
