import { ref } from 'vue'
import { defineStore } from 'pinia'
import { get } from '@/api/request'

interface CacheItem<T = any> {
  data: T
  timestamp: number
}

export const useCacheStore = defineStore('cache', () => {
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

  const setCache = async <T extends Record<string, any>>(
    type: string, key: string, path: string, data?: T
  ) => {
    if (!caches.value[type]) return

    const result = await get(path, { ...data })
    if (!result.success) return

    caches.value[type].set(key, {
      data: result.data.data,
      timestamp: Date.now()
    })

    return result.data.data
  }

  const getCache = (type: string, key: string) => {
    if (!caches.value[type]) return

    const cacheItem = caches.value[type].get(key)
    if (!cacheItem) return

    const cachetime = CACHE_EXPIRE[type]
    if (cachetime && Date.now() - cachetime < cacheItem.timestamp) {
      return cacheItem.data
    }
    return
  }

  return { caches, CACHE_EXPIRE, setCache, getCache }
})
