import { ref } from 'vue'
import { Playlist, ChartData } from '@/types'
import { get } from '@/api/request'
import { useNavigation } from '@/utils/navigation'

export function useMusicHall() {
  const playlists = ref<Playlist[]>([])
  const charts = ref<ChartData[]>([])

  const { goPlaylist } = useNavigation()

  const getPlaylists = async () => {
    const [songList, songsCharts] = await Promise.all([
      get('/playlists', { mode: 'normal', limit: 6 }),
      get('/songs/charts', { tagNames: '华语' })
    ])
    if (songList.success) {
      playlists.value = songList.data.data.list
    }
    if (songsCharts.success) {
      charts.value = Object.values(songsCharts.data.data)
    }
  }

  return {
    playlists,
    charts,
    goPlaylist,
    getPlaylists
  }
}
