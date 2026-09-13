<template>
  <div :ref="el => setLoadMoreContainerRefWrapper(el as HTMLElement)" class="load-more-container">
    <LoadMore v-show="showLoading" />
    <p class="bottom-p" v-show="isFinished">到底啦~</p>
  </div>
</template>

<script setup lang="ts">
  import { computed, onUnmounted } from 'vue'
  import { setLoadMoreContainerRef } from '@/utils/observer'
  import LoadMore from './LoadMore.vue'

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
  // --- 玻璃风变量（与微应用浅色玻璃风一致） ---
  @glass-bg: rgba(255, 255, 255, 0.45);
  @glass-border: rgba(255, 255, 255, 0.6);

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
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid @glass-border;
    border-radius: 100px;
    box-shadow: 0 8px 24px rgba(31, 38, 135, 0.12);

    color: rgba(52, 73, 94, 0.6);
  }
</style>