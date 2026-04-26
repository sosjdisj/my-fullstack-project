import service from '@/api/axios'

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

export async function post(path: string, data: any) {
    const result = await service.post(path, data)

    const isSuccess = result.status === 200 && (result.data.code === 200 || result.data.status === 200);

    return {
        success: isSuccess,
        data: result.data,
        message: result.data.message
    }
}

export async function patch(path: string, data: Record<string, any> | []) {
    const result = await service.patch(path, data)

    const isSuccess = result.status === 200 && (result.data.code === 200 || result.data.status === 200);

    return {
        success: isSuccess,
        data: result.data,
        message: result.data.message
    }
}

export async function Delete(path: string) {
    const result = await service.delete(path)

    const isSuccess = result.status === 200 && (result.data.code === 200 || result.data.status === 200);

    return {
        success: isSuccess,
        data: result.data,
        message: result.data.message
    }
}

export function getModifiedFields(
    objA: Record<string, any>,
    objB: Record<string, any>,
    options?: {
        exclude?: string[];
        include?: string[];
    }
) {
    return Object.keys(objB).reduce((modified, key) => {
        if (options?.include && !options.include.includes(key)) {
            return modified;
        }

        if (options?.exclude?.includes(key)) {
            return modified;
        }

        if (objA[key] !== objB[key]) {
            modified[key] = objA[key];
        }
        return modified;
    }, {} as Record<string, any>);
}
