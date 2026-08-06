import { useUserStore } from "@/stores/user";

//分页缓存函数(get)
export async function usePaginationCache(
    CACHE_NAME: string,
    key: string,
    path: string,
    data?: { page?: string, mode?: string }
) {
    const store = useUserStore()
    //拿缓存
    const getCacheItem = store.getCache(CACHE_NAME, key)
    if (getCacheItem) {
        return getCacheItem
    }

    const resulOne = await store.setCache(CACHE_NAME, key, path,
        {
            page: data?.page,
        }
    )
    if (resulOne) {
        return resulOne
    }

    return false
}