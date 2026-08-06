<template>
  <transition name="modal">
    <div v-show="isVisible" class="play-queue-modal-overlay" @click.self="handleClose">
      <div class="play-queue-modal-container">
        <div class="play-queue-modal">
          <!-- 模态框头部 -->
          <div class="modal-header">
            <h3 class="modal-title">播放队列</h3>
            <button class="close-btn" @click="handleClose" title="关闭">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor"
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          <!-- 播放队列内容区域 -->
          <div class="modal-content">
            <!-- 这里可以放置播放列表内容 -->
            <div class="queue-list">
              <div v-for="(value, index) in songlist" :key="index" @click="handStart(index)" class="queue-item"
                :class="{ 'playing': isCurrentPlaying(value.id) }">

                <div class="item-info">
                  <div class="item-left">
                    <span v-if="isCurrentPlaying(value.id)" class="playing-icon">
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path fill="currentColor" d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                    <span v-else class="song-index">{{ index + 1 }}</span>
                  </div>

                  <div class="song-details">
                    <div class="song-name">{{ value.name }}</div>
                    <div class="artist-name">{{ value.singer }}</div>
                  </div>
                </div>

                <div class="item-actions">
                  <button class="like-btn" :class="{ liked: store.UserLikesSong.includes(value.id) }" title="喜欢"
                    @click.stop="store.toggleSongLikeStatus(value.id)">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path :fill="store.UserLikesSong.includes(value.id) ? '#f06' : 'currentColor'"
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                  <div class="item-duration">{{ value.duration }}</div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
  import { useUserStore } from '../../stores/user'

  const store = useUserStore()
  const songlist = store.songs
  defineProps<{
    isVisible: boolean
  }>()

  const emit = defineEmits(['close'])

  // 关闭模态框的方法
  const handleClose = () => {
    emit('close')
  }
  const handStart = (index: number) => {
    if (songlist) {
      store.selectedmusic = songlist[index]
      store.index = index
    }
  }

  // 检查当前歌曲是否正在播放
  const isCurrentPlaying = (id: string) => {
    return store.selectedmusic?.id === id
  }

</script>

<style lang="less" scoped>
  // --- 变量定义：轻盈玻璃风 (Glassmorphism) ---
  @glass-bg: rgba(255, 255, 255, 0.45); // 较高的透明白，适应偏白背景
  @glass-border: rgba(255, 255, 255, 0.6); // 边框亮色，勾勒出玻璃边缘
  @glass-blur: 20px;

  // 字体颜色：放弃纯黑，改用深灰蓝，视觉更柔和
  @text-main: #34495e;
  @text-dim: #95a5a6;

  // 选中状态：莫兰迪蓝色调，优雅不刺眼
  @accent-color: #5d8aa8;
  @accent-bg: rgba(93, 138, 168, 0.12);

  /* 模态框覆盖层 */
  .play-queue-modal-overlay {
    position: fixed;
    right: 0;
    bottom: 20px;
    background: transparent;
    z-index: 2000;
  }

  /* 定位容器 */
  .play-queue-modal-container {
    position: absolute;
    right: 30px;
    bottom: 90px;
    z-index: 2001;

    /* 模态框本体 */
    .play-queue-modal {
      background: @glass-bg;
      backdrop-filter: blur(@glass-blur);
      -webkit-backdrop-filter: blur(@glass-blur);
      border: 1px solid @glass-border;
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
      color: @text-main;
      width: 360px;
      max-height: 420px;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      /* 头部区域 */
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 18px 20px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.03);

        .modal-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: @text-main;
          letter-spacing: 0.3px;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: @text-dim;
          cursor: pointer;
          padding: 5px;
          border-radius: 8px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;

          &:hover {
            background: rgba(0, 0, 0, 0.05);
            color: @text-main;
          }
        }
      }

      /* 内容滚动区 */
      .modal-content {
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;

        /* 自定义滚动条 */
        &::-webkit-scrollbar {
          width: 4px;
        }

        &::-webkit-scrollbar-track {
          background: transparent;
        }

        &::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }

        .queue-list {
          .queue-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 2px 10px; // 卡片式间距
            padding: 10px 12px;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

            &:hover {
              background: rgba(255, 255, 255, 0.6);
            }

            /* --- 选中/播放中样式 --- */
            &.playing {
              background: @accent-bg;

              .song-name {
                color: @accent-color;
                font-weight: 600;
              }

              .item-left {
                color: @accent-color;

                .playing-icon {
                  animation: pulse 1.8s infinite ease-in-out;
                }
              }
            }

            .item-info {
              flex: 1;
              display: flex;
              align-items: center;
              overflow: hidden;

              .item-left {
                width: 24px;
                margin-right: 12px;
                color: @text-dim;
                font-size: 13px;
                display: flex;
                justify-content: center;
              }

              .song-details {
                flex: 1;
                overflow: hidden;

                .song-name {
                  font-size: 14px;
                  color: @text-main;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  margin-bottom: 2px;
                }

                .artist-name {
                  font-size: 12px;
                  color: @text-dim;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                }
              }
            }

            .item-actions {
              display: flex;
              align-items: center;
              gap: 12px;

              .like-btn {
                background: transparent;
                border: none;
                color: @text-dim;
                cursor: pointer;
                transition: all 0.2s ease;

                &:hover {
                  color: @text-main;
                  transform: scale(1.1);
                }

                &.liked {
                  color: #e77e8e; // 柔和的干枯玫瑰色，不突兀
                }
              }

              .item-duration {
                font-size: 11px;
                color: @text-dim;
                min-width: 35px;
                text-align: right;
              }
            }
          }
        }
      }
    }
  }

  /* 动画序列 */
  @keyframes pulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }

    50% {
      opacity: 0.5;
      transform: scale(0.9);
    }

    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Vue/模态框过渡动画 */
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.3s ease;

    .play-queue-modal {
      transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), opacity 0.3s ease;
    }
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;

    .play-queue-modal {
      transform: translateY(30px) scale(0.95);
      opacity: 0;
    }
  }

  /* 移动端适配 */
  @media (max-width: 480px) {
    .play-queue-modal-container {
      right: 15px;
      left: 15px; // 全宽感
      bottom: 85px;

      .play-queue-modal {
        width: auto;
        max-height: 60vh;
      }
    }
  }

</style>