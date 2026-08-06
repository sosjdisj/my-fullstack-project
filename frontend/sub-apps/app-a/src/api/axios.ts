import { useUserStore } from "@/stores/user";
import axios from "axios";
import { ElMessage } from 'element-plus'
import { clearUser, saveUserInfo } from "@/composables/useAuth";

const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    timeout: 5000,
    withCredentials: true
})

let isRefreshing = false;

//请求之前干什么
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