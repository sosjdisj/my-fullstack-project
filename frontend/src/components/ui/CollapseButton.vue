<template>
  <button
    class="collapse-btn"
    :class="{ 'is-collapsed': isCollapsed }"
    @click="toggle"
  >
    <div class="collapse-icon">
      <span class="line line-1"></span>
      <span class="line line-2"></span>
      <span class="line line-3"></span>
    </div>
  </button>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useCounterStore } from '@/stores/counter'

  const store = useCounterStore()
  const isCollapsed = ref(false)

  onMounted(() => {
    // 同步 store 中的状态
    isCollapsed.value = store.header
  })

  const toggle = () => {
    isCollapsed.value = !isCollapsed.value
    store.header = isCollapsed.value
  }
</script>

<style scoped lang="less">
  .collapse-btn {
    position: fixed;
    top: 10%;
    right: 20px;
    z-index: 100;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(28, 30, 38, 0.6);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: top 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s cubic-bezier(0.23, 1, 0.32, 1), transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    box-shadow:
      0 4px 15px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-2px);
      box-shadow:
        0 8px 25px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);

      .line {
        background: #00e5ff;
      }
    }

    &:active {
      transform: translateY(0) scale(0.95);
    }
  }

  .collapse-icon {
    width: 20px;
    height: 14px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .line {
    display: block;
    width: 100%;
    height: 2px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 2px;
    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
    transform-origin: center;
  }

  // 收起状态的动画 - 汉堡变 X，同时按钮上移
  .collapse-btn.is-collapsed {
    top: 20px;

    .line-1 {
      transform: translateY(6px) rotate(45deg);
    }

    .line-2 {
      opacity: 0;
      transform: scaleX(0);
    }

    .line-3 {
      transform: translateY(-6px) rotate(-45deg);
    }
  }
</style>
