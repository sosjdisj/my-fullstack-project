import { useCounterStore } from "@/stores/counter";
import axios from "axios";
import { ElMessage } from 'element-plus'
import { clearUser, saveUserInfo } from '@/utils/helpers'

const service = axios.create({
    baseURL: 'http://localhost:3001/api',
    timeout: 180000,
    withCredentials: true
})

let isRefreshing = false;

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
                    const res = await axios.post('http://localhost:3001/api/auth/refresh-token', {}, {
                        withCredentials: true
                    });

                    if (res.data.code === 200) {
                        const Data = res.data.data
                        const newToken = Data.token;

                        const store = useCounterStore();

                        saveUserInfo(store, {
                            username: Data.username,
                            token: newToken,
                            avatar: Data.avatar,
                            signature: Data.signature
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
