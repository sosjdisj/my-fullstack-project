<template>
  <div :ref="el => setLoadMoreContainerRefWrapper(el as HTMLElement)" class="load-more-container">
    <LoadMore v-show="showLoading" />
    <p class="bottom-p" v-show="isFinished">到底啦~</p>
  </div>
</template>

<script setup lang="ts">
  // Vue/Vue Router/Pinia API 由 unplugin-auto-import 全局注入
  import { setLoadMoreContainerRef } from '@/utils/helpers'
  import LoadMore from '@/components/ui/LoadMore.vue'

  const props = defineProps<{
    loadMore: () => Promise<void>
    isFinished: boolean
    isLoading?: boolean
  }>()

  const showLoading = computed(() =>
    props.isLoading !== undefined ? props.isLoading : !props.isFinished
  )

  let clearLoadMoreObserver: (() => void) | null = null

  const setLoadMoreContainerRefWrapper = (el: Element | null) => {
    if (!el) return

    clearLoadMoreObserver = setLoadMoreContainerRef(el, props.loadMore)
  }

  onUnmounted(() => {
    if (clearLoadMoreObserver) {
      clearLoadMoreObserver()
      clearLoadMoreObserver = null
    }
  })
</script>

<style lang="less" scoped>
  // --- 玻璃风变量（与项目暗色玻璃风一致） ---
  @glass-bg: rgba(255, 255, 255, 0.08);
  @glass-border: rgba(255, 255, 255, 0.12);

  .load-more-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px 0;
  }

  .bottom-p {
    display: inline-flex;
    align-items: center;
    padding: 10px 24px;
    margin: 0;
    font-size: 13px;
    letter-spacing: 1px;

    // --- 玻璃风核心 ---
    background: @glass-bg;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid @glass-border;
    border-radius: 100px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

    color: rgba(255, 255, 255, 0.55);
  }
</style>