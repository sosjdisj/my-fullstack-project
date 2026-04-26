<template>
    <div class="mini-status-tag">
        <div class="status-dot"></div>
        <div class="content">
            <span class="label">在线</span>
            <span class="value">{{ store.totalOnline }}</span>
        </div>
        <div class="shimmer"></div>
    </div>
</template>

<script lang="ts" setup>
    import { useCounterStore } from '@/stores/counter'
    import { onMounted } from 'vue';

    const store = useCounterStore()

    onMounted(() => {
        store.initSocketListeners()
    })
</script>

<style lang="less" scoped>
    // --- 变量 ---
    @glass-bg: rgba(255, 255, 255, 0.1);
    @glass-border: rgba(255, 255, 255, 0.15);
    @accent-color: #4ade80; // 呼吸点颜色

    .mini-status-tag {
        // --- 固定定位与尺寸 ---
        position: fixed;
        top: 70px;
        left: 24px;
        z-index: 1000;

        height: 32px; // 显著缩小高度
        padding: 0 12px;
        display: flex;
        align-items: center;
        gap: 8px;

        // --- 精致玻璃风 ---
        background: @glass-bg;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid @glass-border;
        border-radius: 100px; // 圆角胶囊形状
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

        color: #fff;
        font-family: 'Inter', system-ui, sans-serif;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;

        &:hover {
            background: rgba(255, 255, 255, 0.18);
            transform: translateY(-2px);
            border-color: rgba(255, 255, 255, 0.3);
        }

        // --- 呼吸点 ---
        .status-dot {
            width: 6px;
            height: 6px;
            background: @accent-color;
            border-radius: 50%;
            box-shadow: 0 0 8px @accent-color;
            position: relative;

            &::after {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: 50%;
                background: @accent-color;
                animation: pulse 2s infinite;
            }
        }

        // --- 文字内容 ---
        .content {
            display: flex;
            align-items: baseline;
            gap: 4px;
            white-space: nowrap;

            .label {
                font-size: 11px;
                font-weight: 500;
                opacity: 0.6;
            }

            .value {
                font-size: 14px;
                font-weight: 700;
                font-variant-numeric: tabular-nums;
            }
        }

        // --- 扫光 ---
        .shimmer {
            position: absolute;
            top: 0;
            left: -100%;
            width: 50%;
            height: 100%;
            background: linear-gradient(90deg,
                    transparent,
                    rgba(255, 255, 255, 0.2),
                    transparent);
            animation: scan 4s infinite ease-in-out;
        }
    }

    // --- 动画 ---
    @keyframes pulse {
        0% {
            transform: scale(1);
            opacity: 0.8;
        }

        100% {
            transform: scale(2.5);
            opacity: 0;
        }
    }

    @keyframes scan {
        0% {
            left: -100%;
        }

        30%,
        100% {
            left: 150%;
        }

        // 扫一下停顿一会儿
    }
</style>