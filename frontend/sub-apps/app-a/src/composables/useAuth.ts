import { useUserStore } from "@/stores/user";

// 独立运行时的 token 命名空间，避免与主应用的 localStorage['token'] 互相覆盖
// 嵌入模式下不会写入 localStorage（token 由主应用统管）
const TOKEN_KEY = 'app_a_token'

/**
 * 保存用户信息到 store 和 localStorage
 * - 嵌入模式：只更新内存 store，不写 localStorage（token 归主应用所有）
 * - 独立模式：同步写入命名空间的 localStorage，保证刷新后登录态不丢
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
        // 嵌入模式下 token 由主应用通过 micro-app data 下发，子应用不持久化
        if (!window.__MICRO_APP_ENVIRONMENT__) {
            localStorage.setItem(TOKEN_KEY, data.token)
        }
    }
}

export function clearUser() {
    const store = useUserStore()
    store.username = null
    store.avatar = null
    store.token = null
    localStorage.removeItem(TOKEN_KEY)
}
