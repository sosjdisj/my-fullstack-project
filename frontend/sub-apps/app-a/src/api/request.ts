import service from "./axios"
import { ElMessage } from 'element-plus'

//通用post请求函数
export async function post(path: string, data: any) {
    const result = await service.post(path, data)

    const isSuccess = result.status === 200 && (result.data.code === 200 || result.data.status === 200);

    return {
        success: isSuccess,
        data: result.data,
        message: result.data.message
    }
}

//通用get请求函数
export async function get(path: string, data?: any) {
    const params = typeof data === 'object' && data !== null ? data : {};
    const result = await service.get(path, { params })

    const isSuccess = result.status === 200 && (result.data.code === 200 || result.data.status === 200);

    return {
        success: isSuccess,
        data: result.data,
        message: result.data.message
    }
}

//通用put
export async function put(path: string, data: Record<string, any>) {
    const response = await service.put(path, data)
    if (response.data.status !== 200) {
        ElMessage.error('数据修改失败，请稍后重试')
        throw new Error('请求失败')
    }
}

//通用delete
export async function del(path: string) {
    const result = await service.delete(path)
    return {
        success: result.status === 200 && (result.data.code === 200 || result.data.status === 200),
        data: result.data,
        message: result.data.message
    }
}