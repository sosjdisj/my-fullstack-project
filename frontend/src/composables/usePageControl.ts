// Vue API 由 unplugin-auto-import 全局注入，无需显式导入

export function usePageControl(initialPage = "1") {
    const page = ref<string>(initialPage)

    const nextPage = () => {
        const currentPage = Number(page.value) + 1;
        page.value = currentPage.toString()
    }

    const resetPage = () => {
        page.value = initialPage
    }

    return {
        page,
        nextPage,
        resetPage
    }
}