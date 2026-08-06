<template>
  <div class="sidebar">
    <div class="sidebar-section">
      <h3 class="section-title">在线音乐</h3>
      <ul class="menu-list">
        <li class="menu-item" :class="{ active: isActiveRoute(value.path) }" v-for="value in hacder" :key="value.path"
          @click="handGo(value.path)">
          <div class="active-indicator" v-show="isActiveRoute(value.path)"></div>
          <span class="menu-icon">{{ value.icon }}</span>
          <span>{{ value.name }}</span>
        </li>
      </ul>
    </div>

    <div class="sidebar-section">
      <h3 class="section-title">我的音乐</h3>
      <ul class="menu-list">
        <li class="menu-item" :class="{ active: isActiveRoute('/my') }" @click="handGo('/my')">
          <div class="active-indicator" v-show="isActiveRoute('/my')"></div>
          <span class="menu-icon">👤</span>
          <span>我的</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRouter, useRoute } from 'vue-router';

  const router = useRouter()
  const route = useRoute()

  const hacder = [
    {
      name: '推荐',
      icon: '🎵',
      path: '/recommend'
    },
    {
      name: '音乐馆',
      icon: '🎸',
      path: '/musichall'
    },
  ]

  const handGo = (path: string) => {
    router.push(path)
  }

  const isActiveRoute = (path: string): boolean => {
    return route.path === path
  }
</script>

<style lang="less" scoped>
  // 变量定义
  @glass-border: rgba(255, 255, 255, 0.2);
  @accent-color: #667eea;

  .sidebar {
    width: 220px;
    // 核心：不再使用白背景，改用极淡的玻璃叠加，甚至可以全透明
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px); // 相比内容区模糊度低一点，形成视觉层次
    border-right: 1px solid @glass-border;
    padding: 30px 15px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;

    .sidebar-section {
      margin-bottom: 35px;

      .section-title {
        font-size: 12px;
        font-weight: 700;
        color: rgba(0, 0, 0, 0.4); // 柔和的深灰色
        text-transform: uppercase;
        letter-spacing: 1.5px;
        margin-bottom: 20px;
        padding-left: 15px;
      }

      .menu-list {
        list-style: none;
        padding: 0;
        margin: 0;

        .menu-item {
          position: relative;
          display: flex;
          align-items: center;
          padding: 14px 18px;
          margin-bottom: 8px;
          border-radius: 16px; // 更圆润
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          color: #4a4a4a;
          font-weight: 500;

          &:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateX(4px);
            color: @accent-color;
          }

          &.active {
            // 激活态不再是死板的渐变块，而是半透明发光感
            background: rgba(255, 255, 255, 0.5);
            backdrop-filter: blur(5px);
            color: @accent-color;
            font-weight: 700;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);

            .menu-icon {
              filter: drop-shadow(0 0 5px rgba(102, 126, 234, 0.5));
            }
          }

          // 左侧激活小条（呼吸感点缀）
          .active-indicator {
            position: absolute;
            left: 0;
            width: 4px;
            height: 20px;
            background: @accent-color;
            border-radius: 0 4px 4px 0;
            box-shadow: 2px 0 10px rgba(102, 126, 234, 0.5);
          }

          .menu-icon {
            margin-right: 14px;
            font-size: 20px;
            transition: all 0.3s;
          }
        }
      }
    }

    // 隐藏式微型滚动条
    &::-webkit-scrollbar {
      width: 3px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 10px;
    }
  }
</style>