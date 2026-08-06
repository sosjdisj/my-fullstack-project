import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { Song } from '@/types'
import { get, post, del } from '@/api/request'

// 缓存项类型：包含数据和缓存时间
interface CacheItem<T = any> {
    data: T
    timestamp: number
}
export const useUserStore = defineStore('user', () => {
    const songs = ref<Song[]>()//整个歌单列表
    const selectedmusic = ref<Song | null>(null)//当前播放的歌曲对象
    const index = ref<number>(0)//当前播放的是哪首歌曲
    const username = ref<string | null>(null)//姓名
    const avatar = ref<string | null>(null)//头像
    // const isLoggedIn = ref<boolean>(true)

    const token = ref<string | null>(null)

    // 跨组件共享的播放状态（供歌词页等非 PlayerControls 子组件读取）
    const currentTime = ref<number>(0)//当前播放进度（秒）
    const isPlaying = ref<boolean>(false)//音频是否正在播放

    // const likedSongs = ref<Record<string, any>>({})//用户总喜欢的歌单列表
    const trackList = ref<Record<string, any>>({})//整个歌单对象
    const UserLikesSong = ref<Array<string>>([])//喜欢歌id列表

    const lastDeletedSongId = ref<string>()//当前取消喜欢歌曲的id
    const lastAddedSongId = ref<string>()//当前新增喜欢歌曲的id
    const isTogglingLike = ref(false)//点赞操作防重复标志

    const CACHE_EXPIRE: { [key in string]: number } = {
        playList: 5 * 60 * 1000,
    }

    const caches = ref<Record<string, Map<string, CacheItem>>>({
        playList: new Map(),
    })

    //缓存
    const setCache = async (type: string, key: string, path: string,
        data?: { page?: string }
    ) => {
        if (!caches.value[type]) return;

        const result = await get(path, { page: data?.page })

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

    // const handTonken = async () => {
    //     if (localStorage.getItem('token')) {
    //         const token = localStorage.getItem('token')
    //         const resule = await Axios.post('/api/auth/verify', token)
    //         if (resule.status !== 200) {
    //             return false
    //         } else {
    //             return true
    //         }
    //     } else {
    //         return false
    //     }
    // }

    //切换歌曲点赞状态
    const toggleSongLikeStatus = async (id: string | undefined) => {
        if (!id) return
        if (isTogglingLike.value) return ElMessage.warning('点太快啦，给系统一点反应时间哦～')

        try {
            isTogglingLike.value = true
            const is_likes = UserLikesSong.value.includes(id)
            const actionText = is_likes ? '取消点赞' : '点赞'

            // 先调 API，成功后才更新状态，避免 API 失败导致前后端状态不一致
            const apiCall = is_likes
                ? del(`/songs/${id}/likes`)
                : post('/songs/likes', { id })

            const result = await apiCall

            if (result.success) {
                if (is_likes) {
                    // 取消点赞：从列表移除
                    const likeIndex = UserLikesSong.value.indexOf(id)
                    if (likeIndex > -1) {
                        lastDeletedSongId.value = id
                        UserLikesSong.value.splice(likeIndex, 1)
                    }
                } else {
                    // 点赞：加入列表
                    lastAddedSongId.value = id
                    UserLikesSong.value.push(id)
                }
                const message = result.message || `${actionText}成功`
                ElMessage[is_likes ? 'info' : 'success'](message)
            }
        } catch (error: any) {
            // 后端返回 400 说明前后端状态不一致（通常是旧版乐观更新遗留）
            // 以后端为准，同步前端 UserLikesSong 状态
            const status = error?.response?.status
            const serverMsg = error?.response?.data?.message || ''

            if (status === 400) {
                if (serverMsg.includes('已经点赞过了')) {
                    // 后端已点赞，前端缺失 → 补上
                    if (!UserLikesSong.value.includes(id)) {
                        lastAddedSongId.value = id
                        UserLikesSong.value.push(id)
                    }
                } else if (serverMsg.includes('未点赞过')) {
                    // 后端未点赞，前端多余 → 移除
                    const likeIndex = UserLikesSong.value.indexOf(id)
                    if (likeIndex > -1) {
                        lastDeletedSongId.value = id
                        UserLikesSong.value.splice(likeIndex, 1)
                    }
                }
                // axios 拦截器已弹出后端的 message，这里不重复提示
            }
            console.error('Toggle song like error:', error)
        } finally {
            isTogglingLike.value = false
        }
    }

    // 从指定歌曲开始播放整个列表
    // 统一入口：同步设置 songs / selectedmusic / index，避免各组件分散操作导致 index 不同步
    const playFromList = (song: Song, list: Song[]) => {
        if (!list.length) return
        songs.value = list
        const i = list.findIndex(s => s.id === song.id)
        index.value = i >= 0 ? i : 0
        selectedmusic.value = i >= 0 ? song : list[0]
    }

    //下一首歌
    const handPlayNext = () => {
        if (songs.value) {
            const nextIndex = index.value + 1
            if (nextIndex < songs.value.length) {
                index.value = nextIndex
                selectedmusic.value = songs.value[nextIndex]
            } else {
                index.value = 0
                selectedmusic.value = songs.value[0]
            }
        }
    }

    //上一首歌
    const handPlayPrevious = () => {
        if (songs.value) {
            const PreviousIndex = index.value - 1
            if (PreviousIndex >= 0) {
                index.value = PreviousIndex
                selectedmusic.value = songs.value[PreviousIndex]
            } else {
                index.value = songs.value.length - 1
                selectedmusic.value = songs.value[index.value]
            }
        }
    }

    //随机播放
    const handShuffle = () => {
        if (songs.value) {
            const randomIndex = Math.floor(Math.random() * songs.value.length)
            selectedmusic.value = songs.value[randomIndex]
        }
    }

    return {
        username,
        avatar,
        trackList,
        selectedmusic,
        songs,
        index,
        UserLikesSong,
        lastDeletedSongId,
        lastAddedSongId,
        token,
        currentTime,
        isPlaying,
        handPlayNext,
        handPlayPrevious,
        handShuffle,
        playFromList,
        getCache,
        setCache,
        toggleSongLikeStatus
    }
})