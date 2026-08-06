import { ref } from 'vue';
import type { Playlist } from '@/types'
import { get } from '@/api/request';
import { useNavigation } from '@/utils/navigation';

export function useRecommendMusic() {
    const { goPlaylist } = useNavigation()
    const musiclist = ref<Playlist[]>([])

    let clearLoadMoreObserver: (() => void) | null = null;

    const fetchRecommendMusicPlaylist = async () => {
        const result = await get('/playlists', { mode: 'daily' })

        if (result.success) {
            musiclist.value = result.data.data.list
        }
    }

    const clear = () => {
        if (clearLoadMoreObserver) {
            clearLoadMoreObserver()
            clearLoadMoreObserver = null
        }
    }

    return {
        musiclist,
        goPlaylist,
        fetchRecommendMusicPlaylist,
        clear
    }
}