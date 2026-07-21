import { useUserStore } from "@/stores/user";
import axios from "axios";
import { clearUser, saveUserInfo } from '@/utils/helpers'

const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    timeout: 180000,
    withCredentials: true
})

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

service.interceptors.request.use(function (config) {
    const token = localStorage.getItem('token')

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
                            signature: Data.signature
                        })

                        // 刷新成功，重放所有排队请求
                        pendingRequests.forEach(cb => cb(newToken))
                        pendingRequests = []
                        isRefreshing = false;

                        config.headers.Authorization = `Bearer ${newToken}`;
                        return service(config);
                    }
                } catch (refreshError) {
                    // 刷新失败，清空排队请求
                    pendingRequests = []
                    isRefreshing = false;
                    clearUser()
                    ElMessage.error('登录已过期，请重新登录');
                    return Promise.reject(refreshError);
                }
            } else {
                // 正在刷新，将请求排队等待新 token 后重试
                return new Promise((resolve) => {
                    pendingRequests.push((newToken: string) => {
                        config.headers.Authorization = `Bearer ${newToken}`;
                        resolve(service(config));
                    });
                });
            }

        }

        ElMessage.error(error.response?.data?.message || '网络错误');
        return Promise.reject(error);
    }
)

export default service
