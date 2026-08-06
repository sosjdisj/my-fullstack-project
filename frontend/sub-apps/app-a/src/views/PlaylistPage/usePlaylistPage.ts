import { computed, ref } from 'vue'
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus'
import type { PlaylistDetail, Song } from '@/types'
import { get, post, del } from '@/api/request'
import { usePageControl } from '@/composables/usePageControl';
import { useUserStore } from '@/stores/user'

export function usePlaylistPage() {
  // interface PlaylistData {
  //   list: Array<Song>,
  //   likedIds: Array<string>
  // }
  const store = useUserStore()
  const route = useRoute()
  const currentPlaylistData = ref<Song[]>([]); // 歌列表数据
  const queryId = computed(() =>
    String(Array.isArray(route.query.id)
      ? route.query.id[0]
      : route.query.id))

  const { page, nextPage } = usePageControl()

  const MusicList = ref<PlaylistDetail>({
    id: '0',
    name: '',
    creator: '',
    creatorAvatar: '',
    coverImage: '',
    description: '',
    playCount: 0,
    createdAt: '',
    songCount: 0,
  })
  const PlaylistManager = ref<Song[]>([])
  const isFinished = ref(false)
  const isLoading = ref(false)

  const isCollected = ref<boolean>(false)
  const isTogglingCollect = ref(false)//收藏操作防重复标志

  // const handleUpdatePlaylist = (data: Song[]) => {
  //   currentPlaylistData.value = data
  // }

  const handleFavorite = async (id: string, isfavorite: boolean) => {
    if (isTogglingCollect.value) return ElMessage.warning('点太快啦，给系统一点反应时间哦～')

    try {
      isTogglingCollect.value = true
      const actionText = isfavorite ? '收藏' : '取消收藏'

      // 先调 API，成功后才更新状态，避免 API 失败导致前后端状态不一致
      const apiCall = isfavorite
        ? post('/playlists/collects', { id })
        : del(`/playlists/${id}/collects`)

      const result = await apiCall

      if (result.success) {
        isCollected.value = isfavorite
        const message = result.message || `${actionText}成功`
        ElMessage[isfavorite ? 'success' : 'info'](message)
      }
    } catch (error: any) {
            // 后端返回 400 说明前后端状态不一致（通常是旧版乐观更新遗留）
            // 以后端为准，同步前端 isCollected 状态
            const status = error?.response?.status
            const serverMsg = error?.response?.data?.message || ''

            if (status === 400) {
                if (serverMsg.includes('已经收藏过了')) {
                    // 后端已收藏，前端未同步
                    isCollected.value = true
                } else if (serverMsg.includes('未收藏过')) {
                    // 后端未收藏，前端未同步
                    isCollected.value = false
                }
                // axios 拦截器已弹出后端的 message，这里不重复提示
            }
            console.error('Toggle collect error:', error)
    } finally {
      isTogglingCollect.value = false
    }
  }

  const fetchPlaylistDetail = async () => {
    if (queryId.value) {
      const playlistDetail = await get(`/playlists/${queryId.value}/info`)
      if (playlistDetail.success) {
        MusicList.value = playlistDetail.data.data
        isCollected.value = playlistDetail.data.data.isCollected ?? false
        return;
      }
    }
  }

  const loadPophitsAndUserLikes = async () => {
    // 防止重复请求
    if (isLoading.value || isFinished.value) return

    isLoading.value = true

    try {
      const result = await get(`/playlists/${queryId.value}/songs`, { page: page.value })

      if (result.success) {
        const { list } = result.data.data

        PlaylistManager.value = [...PlaylistManager.value, ...list]
        currentPlaylistData.value = PlaylistManager.value

        // 从返回的歌曲列表中提取已喜欢的歌曲 id
        const likedIds = list.filter((s: Song) => s.isLiked).map((s: Song) => s.id)
        if (likedIds.length) {
          store.UserLikesSong = [...new Set([...store.UserLikesSong, ...likedIds])]
        }

        nextPage()

        // 检查是否到达底部
        if (list.length === 0) {
          isFinished.value = true
        }
      }
    } catch (error) {
      console.error('加载歌曲列表失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    queryId,
    currentPlaylistData,
    MusicList,
    isCollected,
    PlaylistManager,
    isFinished,
    isLoading,
    handleFavorite,
    fetchPlaylistDetail,
    loadPophitsAndUserLikes
  }
}
