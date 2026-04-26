<template>
  <div :ref="el => setLoadMoreContainerRefWrapper(el as HTMLElement)" class="load-more-container">
    <LoadMore v-show="!isFinished" />
    <p class="bottom-p" v-show="isFinished">~~到达底部咯~~</p>
  </div>
</template>

<script setup lang="ts">
  import { onUnmounted } from 'vue'
  import { setLoadMoreContainerRef } from '@/utils/helpers'
  import LoadMore from '@/components/ui/LoadMore.vue'

  const props = defineProps<{
    loadMore: () => Promise<void>
    isFinished: boolean
  }>()

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
  .load-more-container {
    padding: 20px 0;
    text-align: center;
  }

  .bottom-p {
    font-size: 13px;
    color: #999;
    margin: 0;
  }
</style>