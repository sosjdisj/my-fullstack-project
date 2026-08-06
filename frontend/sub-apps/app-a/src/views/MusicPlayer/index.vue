<template>
  <div class="music-player-wrapper">
    <div class="glass-blobs">
      <div class="blob blob-purple"></div>
      <div class="blob blob-blue"></div>
      <div class="blob blob-cyan"></div>
    </div>

    <div class="music-player-container">
      <Sidebar />

      <div class="content-area">
        <RouterView v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </div>

    </div>

    <PlayerControls />
  </div>
</template>

<script setup lang="ts">
  import Sidebar from '../../components/MusicPlayer/Sidebar.vue'
  import PlayerControls from '@/components/PlayerControls/PlayerControls.vue'
  import { useMusicPlayer } from './useMusicPlayer';

  useMusicPlayer()
</script>

<style lang="less" scoped>
  // 核心变量：极致通透感
  @glass-white: rgba(255, 255, 255, 0.12); // 背景几乎透明
  @glass-border: rgba(255, 255, 255, 0.3); // 细边框
  @glass-glow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);

  .music-player-wrapper {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    // 使用中性的灰白底色，靠色块撑起色彩
    background: #eef2f7;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1;

    // 弥散背景球
    .glass-blobs {
      position: absolute;
      width: 100%;
      height: 100%;
      filter: blur(120px); // 超高模糊度，让色块融化
      z-index: 0;

      .blob {
        position: absolute;
        border-radius: 50%;
        opacity: 0.7;
      }

      .blob-purple {
        width: 500px;
        height: 500px;
        background: #9b6dff;
        top: -100px;
        left: -100px;
      }

      .blob-blue {
        width: 600px;
        height: 600px;
        background: #57c1ff;
        bottom: -200px;
        right: 10%;
        animation-delay: -5s;
      }

      .blob-cyan {
        width: 400px;
        height: 400px;
        background: #50e3c2;
        top: 20%;
        right: -100px;
        animation-delay: -10s;
      }
    }
  }

  .music-player-container {
    width: 90%;
    height: 85%;
    // 关键：背景加一层淡淡的亮色渐变，增加质感
    background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.2),
        rgba(255, 255, 255, 0.05));
    backdrop-filter: blur(60px); // 增加模糊深度
    -webkit-backdrop-filter: blur(60px);

    border-radius: 32px;
    border: 1px solid @glass-border;
    box-shadow: @glass-glow;

    display: flex;
    overflow: hidden;
    position: relative;
    z-index: 1;

    // 内部顶部的光晕效果
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
    }

    .content-area {
      flex: 1;
      padding: 30px 40px;
      overflow-y: auto;
      background: transparent;

      // Firefox：细滚动条 + 透明轨道
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 0, 0, 0.15) transparent;

      // Webkit（Chrome/Safari/Edge）：必须显式设置 track，
      // 否则浏览器会绘制默认的深色轨道，看起来像一条黑滚动条
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.15);
        border-radius: 10px;

        &:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      }
    }
  }

  // 路由切换动画 - 侧滑淡入
  .page-enter-active,
  .page-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .page-enter-from {
    opacity: 0;
    transform: scale(0.98) translateY(10px);
  }

  .page-leave-to {
    opacity: 0;
    transform: scale(1.02) translateY(-10px);
  }
</style>
