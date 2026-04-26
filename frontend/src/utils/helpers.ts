import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCounterStore } from '@/stores/counter'

// 🌟 核心优化：封装一个获取 store 的内部函数，统一复用
function getStore() {
    return useCounterStore()
}

export function clearUser() {
    const store = getStore()
    store.username = null
    store.avatar = null
    store.signature = ''
    localStorage.removeItem('token')
}

export function initHomeRightScrollAnimations(DOM: string) {
    gsap.registerPlugin(ScrollTrigger)

    const elements = gsap.utils.toArray(DOM)
    elements.forEach((value: unknown) => {
        const element = value as HTMLElement
        if (element) {
            gsap.fromTo(element,
                {
                    opacity: 0,
                    y: 92
                },
                {
                    opacity: 1,
                    y: 0,
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 80%',
                        end: 'bottom 10%',
                        // markers: true
                    }
                }
            )
        }
    })
}

//分页缓存函数(get)
export async function usePaginationCache<T extends Record<string, any>>(
    CACHE_NAME: string,
    key: string,
    path: string,
    data?: T
) {
    const store = getStore()
    //拿缓存
    const getCacheItem = store.getCache(CACHE_NAME, key)
    if (getCacheItem) {
        return getCacheItem
    }

    const resulOne = await store.setCache(CACHE_NAME, key, path,
        { ...data }
    )
    if (resulOne) {
        return resulOne
    }

    return false
}

export function setLoadMoreContainerRef(el: Element, fn: Function): (() => void) | null {

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                fn()
            }
        })
    }, { threshold: 0.1 })
    observer.observe(el as Element)
    return () => {
        observer.unobserve(el);
        observer.disconnect();
    }
}

export function handleScroll(onChange: (isShow: boolean) => void, el: HTMLElement) {

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            // 当元素顶部已经滚动到视口上方时，说明已经滚动过了，显示按钮
            // entry.boundingClientRect.top < 0 表示元素顶部在视口上方
            const hasScrolledPast = entry.boundingClientRect.top < 0
            onChange(hasScrolledPast)
        })
    }, { threshold: 0 })
    observer.observe(el)

    return () => {
        observer.unobserve(el);
        observer.disconnect();
    };
}

export function goToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
}

//滚动到指定位置
export const scrollToComment = (el: HTMLElement) => {
    el?.scrollIntoView({
        behavior: 'smooth'
    });
};

// 2. 基础：清本地Token
// export const clearLocalToken = () => {
//     localStorage.removeItem('token');
//     sessionStorage.removeItem('token');
// };

/**
 * 保存用户信息到 store 和 localStorage
 * @param store 目标 store 对象
 * @param data 用户数据
 */
export function saveUserInfo(
    store: { username: string | null; avatar: string | null; token: string | null, signature: string },
    data: { username: string; avatar: string; signature?: string, token?: string }
) {
    store.username = data.username
    store.avatar = data.avatar
    store.signature = data.signature || ''
    if (data.token) {
        store.token = data.token
        localStorage.setItem('token', data.token)
    }
}

/**
 * 格式化日期，提取日期部分（YYYY-MM-DD）
 * @param dateTime - ISO 格式的时间字符串，如 "2025-07-10T00:00:00.000+00:00"
 * @returns 格式化后的日期字符串，如 "2025-07-10"
 * @example
 * formatDate("2025-07-10T00:00:00.000+00:00") // "2025-07-10"
 */
export const formatDate = (dateTime: string | undefined | null) => {
    if (!dateTime) return;
    return dateTime.split('T')[0]
}

//判断填写的表单数据是否完整
export function isFormDataComplete(
    obj: Record<string, any>,
    optionalFields?: string[]
) {
    // 如果没有传入可选字段数组，则所有字段都必须填写
    if (!optionalFields) {
        return Object.keys(obj).every(item => obj[item] !== '' && obj[item]);
    }

    // 如果有可选字段，则跳过这些字段的验证
    return Object.keys(obj).every(item => {
        if (optionalFields.includes(item)) {
            return true;
        }
        return obj[item] !== '' && obj[item];
    });
}

export function deepEqual(objA: Record<string, any>, objB: Record<string, any>) {
    // 处理 null 和 undefined
    if (objA === objB) return true;
    if (objA === null || objB === null) return false;
    if (typeof objA !== 'object' || typeof objB !== 'object') return objA === objB;

    // 比较对象
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!deepEqual(objA[key], objB[key])) return false;
    }

    return true;
}

export function buildArticleFormData(formData: FormData, record: Record<string, any>, coverFile: File | null) {
    if (coverFile) {
        formData.append('avatar', coverFile)
    }
    formData.append('data', JSON.stringify(record))
}