import { nextTick } from 'vue'

export function setLoadMoreContainerRef(el: Element, fn: Function): (() => void) | null {

    const tryLoad = async () => {
        await Promise.resolve(fn())
        await nextTick()
        // 加载完后如果加载动画仍可见（内容不够一屏），继续加载下一页
        if (isLoadMoreSentinelVisible()) {
            await fn()
        }
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                tryLoad()
            }
        })
    }, { threshold: 0.1 })
    observer.observe(el as Element)

    return () => {
        observer.unobserve(el);
        observer.disconnect();
    }
}

function isLoadMoreSentinelVisible(sentinelSelector = '.load-more-container') {
    const sentinel = document.querySelector(sentinelSelector)
    if (sentinel) {
        const rect = sentinel.getBoundingClientRect()
        return rect.top < window.innerHeight && rect.bottom > 0
    }
    return document.documentElement.scrollHeight <= document.documentElement.clientHeight
}
