<template>
    <div class="core-playback">
        <button class="icon-btn-secondary" @click="toggleShuffle" :class="{ active: isShuffleEnabled }">
            <svg viewBox="0 0 24 24" width="22">
                <path fill="currentColor"
                    d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
            </svg>
        </button>

        <button class="step-btn" @click="handPlayPrevious">
            <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
        </button>

        <button class="main-play-trigger" @click="handPlay" :class="{ 'playing': isPlaying }">
            <div class="play-inner">
                <svg v-show="!isPlaying" viewBox="0 0 24 24" width="30">
                    <path fill="currentColor" d="M8 5v14l11-7z" />
                </svg>
                <svg v-show="isPlaying" viewBox="0 0 24 24" width="30">
                    <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
            </div>
        </button>

        <button class="step-btn" @click="handPlayNext">
            <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
        </button>

        <button class="icon-btn-secondary" @click="toggleRepeat" :class="{ active: isRepeatEnabled }">
            <svg viewBox="0 0 24 24" width="22">
                <path fill="currentColor" d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
            </svg>
        </button>
    </div>
</template>

<script lang="ts" setup>
    defineProps<{
        isPlaying: boolean
        isShuffleEnabled: boolean
        isRepeatEnabled: boolean
    }>()

    const emit = defineEmits<{
        (e: 'play'): void
        (e: 'prev'): void
        (e: 'next'): void
        (e: 'toggleShuffle'): void
        (e: 'toggleRepeat'): void
    }>()

    const handPlay = () => {
        emit('play')
    }

    const handPlayPrevious = () => {
        emit('prev')
    }

    const handPlayNext = () => {
        emit('next')
    }

    const toggleShuffle = () => {
        emit('toggleShuffle')
    }
    const toggleRepeat = () => {
        emit('toggleRepeat')
    }
</script>

<style lang="less" scoped>
    @accent: #667eea;
    @active-bg: rgba(102, 126, 234, 0.15); // 激活时的浅色背景

    .core-playback {
        display: flex;
        align-items: center;
        gap: 20px;

        .icon-btn-secondary {
            background: transparent;
            border: none;
            color: #999; // 默认颜色调浅一点，拉开对比度
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px; // 增加点击热区
            height: 36px;
            border-radius: 8px;
            transition: all 0.2s ease;

            &:hover {
                color: #666;
                background: rgba(0, 0, 0, 0.05);
            }

            &.active {
                color: @accent;
                background: @active-bg; // 增加背景色反馈
                filter: drop-shadow(0 0 2px rgba(102, 126, 234, 0.3));

                // 选中小技巧：在下方加一个激活点
                position: relative;

                &::after {
                    content: '';
                    position: absolute;
                    bottom: 2px;
                    width: 4px;
                    height: 4px;
                    background: @accent;
                    border-radius: 50%;
                }
            }
        }

        .step-btn {
            background: transparent;
            border: none;
            color: #444;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

            // --- 核心改动 ---
            width: 44px; // 固定宽度，增大点击范围
            height: 44px; // 固定高度
            display: flex; // 居中图标
            align-items: center;
            justify-content: center;
            border-radius: 50%; // 悬浮时呈圆形
            // ----------------

            &:hover {
                color: @accent;
                background-color: rgba(0, 0, 0, 0.05); // 淡淡的灰色背景反馈
                transform: scale(1.1);
            }

            &:active {
                transform: scale(0.95); // 点击时的缩回反馈，增加机械感
                background-color: rgba(0, 0, 0, 0.1);
            }

            svg {
                // 适当加大图标物理尺寸
                width: 26px;
                height: 26px;
            }
        }


        .main-play-trigger {
            width: 54px;
            height: 54px;
            background: @accent;
            border-radius: 50%;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);

            &:hover {
                transform: scale(1.05);
            }

            &.playing {
                background: #444;
            }
        }
    }
</style>