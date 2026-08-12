import { useUserStore } from "@/stores/user";
import axios from "axios";
import { ElMessage } from 'element-plus'
import { clearUser, saveUserInfo } from "@/composables/useAuth";

// 微前端环境标志：嵌入模式下由主应用统管登录态
const isMicroApp = !!window.__MICRO_APP_ENVIRONMENT__

// 独立运行时的 token 命名空间，避免与主应用的 localStorage['token'] 互相覆盖
const TOKEN_KEY = 'app_a_token'

/**
 * 获取当前 token
 * - 嵌入模式：从主应用下发的 data 快照中取，子应用不持有 token 所有权
 * - 独立模式：从自身命名空间的 localStorage 取
 */
const getToken = (): string | null => {
    if (isMicroApp) {
        return window.microApp.getData()?.token || null
    }
    return localStorage.getItem(TOKEN_KEY)
}

const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    timeout: 5000,
    withCredentials: true
})

let isRefreshing = false;

//请求之前干什么
service.interceptors.request.use(function (config) {

    const token = getToken()

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
}, function (error) {
    return Promise.reject(error)
})

service.interceptors.response.use(
    function (response) {
        return response;
    },
    async (error) => {

        if (!error.response) {
            ElMessage.error('网络连接异常或跨域问题');
            return Promise.reject(error);
        }

        const { status, config } = error.response;

        if (status === 401 && !config.url.includes('/auth')) {

            // 嵌入模式：token 失效由主应用统一处理（刷新或跳登录），子应用不自行续签
            // 避免"子应用刷新了 token、主应用还持有旧 token"的状态不一致
            if (isMicroApp) {
                window.microApp.dispatch({
                    type: 'ROUTE_REQUEST',
                    action: 'REDIRECT_LOGIN'
                })
                return Promise.reject(error)
            }

            // 独立模式：自行走 refresh-token 续签流程
            if (!isRefreshing) {

                isRefreshing = true

                try {
                    const res = await axios.post(`${service.defaults.baseURL}/auth/refresh-token`, {}, {
                        withCredentials: true
                    });

                    if (res.data.code === 200) {
                        const Data = res.data.data
                        const newToken = Data.token;

                        const store = useUserStore();

                        saveUserInfo(store, {
                            username: Data.username,
                            token: newToken,
                            avatar: Data.avatar,
                        })

                        config.headers.Authorization = `Bearer ${newToken}`;

                        isRefreshing = false;

                        return service(config);
                    }
                } catch (refreshError) {
                    clearUser()
                    ElMessage.error('登录已过期，请重新登录');
                    return Promise.reject(refreshError);
                }
            } else {
                return Promise.reject(error);
            }

        }

        ElMessage.error(error.response?.data?.message || '网络错误');
        return Promise.reject(error);
    }
)

export default service
