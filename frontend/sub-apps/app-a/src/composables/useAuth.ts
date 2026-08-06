import { useUserStore } from "@/stores/user";

/**
 * 保存用户信息到 store 和 localStorage
 * @param store 目标 store 对象
 * @param data 用户数据
 */
export function saveUserInfo(
    store: { username: string | null; avatar: string | null; token: string | null },
    data: { username: string; avatar: string; token?: string }
) {
    store.username = data.username
    store.avatar = data.avatar
    if (data.token) {
        store.token = data.token
        localStorage.setItem('token', data.token)
    }
}

export function clearUser() {
    const store = useUserStore()
    store.username = null
    store.avatar = null
    localStorage.removeItem('token')
}