import { useRouter } from 'vue-router'

/**
 * 子应用统一导航 composable
 * 集中管理所有路由跳转，避免各组件/composable 各写一份 router.push 导致路径/参数不一致
 */
export function useNavigation() {
    const router = useRouter()

    /** 跳转歌单详情 */
    const goPlaylist = (id: string) => {
        router.push({
            path: `/playlist/${id}`,
            query: { id }
        })
    }

    return { goPlaylist }
}
