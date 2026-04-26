<template>
    <div class="reading-status-tag">
        <div class="eye-icon">
            <div class="eye-ball"></div>
        </div>

        <div class="content">
            <span class="label">正在阅读</span>
            <span class="value">{{ readerCount }}</span>
        </div>

        <div class="shimmer"></div>
    </div>
</template>

<script lang="ts" setup>
    import { useArticleSocket } from '@/composables/useArticleSocket'

    const props = defineProps<{
        id: string
    }>()

    const { readerCount } = useArticleSocket(props.id)
</script>

<style lang="less" scoped>
    // --- 变量：使用蓝色调区分“正在阅读” ---
    @reading-blue: #38bdf8;
    @glass-bg: rgba(255, 255, 255, 0.08);
    @glass-border: rgba(255, 255, 255, 0.12);

    .reading-status-tag {
        // --- 固定定位：通常放在全局人数的上方 ---
        position: fixed;
        top: 120px; // 比全局组件高出一些，堆叠在一起
        left: 24px;
        z-index: 1000;

        height: 32px;
        padding: 0 12px;
        display: flex;
        align-items: center;
        gap: 8px;

        // --- 玻璃风核心 ---
        background: @glass-bg;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid @glass-border;
        border-radius: 100px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

        color: #fff;
        font-family: 'Inter', system-ui, sans-serif;
        overflow: hidden;
        transition: all 0.3s ease;

        &:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateX(-4px); // 悬停时向左微动
        }

        // --- CSS 眼睛图标 ---
        .eye-icon {
            width: 14px;
            height: 8px;
            border: 1.5px solid @reading-blue;
            border-radius: 80% 10%; // 模拟眼眶形状
            transform: rotate(45deg);
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;

            .eye-ball {
                width: 4px;
                height: 4px;
                background: @reading-blue;
                border-radius: 50%;
                // 模拟视线扫动
                animation: look-around 4s infinite ease-in-out;
            }
        }

        .content {
            display: flex;
            align-items: baseline;
            gap: 5px;
            white-space: nowrap;

            .label {
                font-size: 11px;
                font-weight: 500;
                opacity: 0.5;
            }

            .value {
                font-size: 14px;
                font-weight: 700;
                color: @reading-blue; // 数字高亮显示
                text-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
            }
        }

        .shimmer {
            position: absolute;
            top: 0;
            left: -100%;
            width: 60%;
            height: 100%;
            background: linear-gradient(90deg,
                    transparent,
                    rgba(56, 189, 248, 0.15),
                    transparent);
            animation: scan 5s infinite 1s ease-in-out;
        }
    }

    // --- 动画 ---
    @keyframes look-around {

        0%,
        100% {
            transform: translate(0, 0);
        }

        25% {
            transform: translate(1px, -1px);
        }

        75% {
            transform: translate(-1px, 1px);
        }
    }

    @keyframes scan {
        0% {
            left: -120%;
        }

        30%,
        100% {
            left: 150%;
        }
    }
</style>