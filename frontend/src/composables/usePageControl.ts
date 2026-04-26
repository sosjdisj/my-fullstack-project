import { ref } from 'vue'

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