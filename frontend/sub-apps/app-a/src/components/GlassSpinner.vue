<template>
  <span class="glass-spinner" :style="{ width: `${size}px`, height: `${size}px` }"></span>
</template>

<script setup lang="ts">
  // 通用玻璃风加载动画：流光环（配色取自弥散背景球），用于按钮等等待场景
  withDefaults(defineProps<{
      /** 直径（px） */
      size?: number
  }>(), { size: 16 })
</script>

<style lang="less" scoped>
  .glass-spinner {
    display: inline-block;
    flex-shrink: 0;
    border-radius: 50%;
    background: conic-gradient(transparent 0%, #667eea 30%, #9b6dff 60%, #57c1ff 90%, transparent 100%);
    /* 遮罩挖空中间，形成流光环 */
    mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px));
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px));
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
