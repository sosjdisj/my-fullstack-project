<template>
    <div class="infoCard">
        <div class="quote-header">
            <h3>每日鸡汤</h3>
            <button class="soup-btn" @click="nextQuote">
                <span>🍲</span>
                换一句
            </button>
        </div>
        <div class="quote-container">
            <transition name="fade-slide" mode="out-in">
                <p :key="value" class="quote">
                    {{ quotesList[value]?.content }}
                </p>
            </transition>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { get } from '@/api/request';
    import { onMounted, onUnmounted, ref } from 'vue';

    interface Quote {
        content: string
        _id?: number
    }

    const quotesList = ref<Array<Quote>>([])
    const value = ref(0)
    let autoPlayInterval: number | null = null

    const nextQuote = () => {
        if (!quotesList.value.length) return
        if (value.value < quotesList.value.length - 1) {
            value.value += 1
        } else {
            value.value = 0
        }
        resetAutoPlay()
    }

    // 启动自动轮播
    const startAutoPlay = () => {
        if (autoPlayInterval) clearInterval(autoPlayInterval)
        autoPlayInterval = setInterval(nextQuote, 5000) // 5秒切换一次
    }

    // 重置定时器
    const resetAutoPlay = () => {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval)
        }
        autoPlayInterval = setInterval(nextQuote, 5000)
    }

    onMounted(async () => {
        const quotes = await get('/quotes/daily')

        if (quotes.success) {

            quotesList.value = quotes.data.data.list
            startAutoPlay()
        }
    })

    onUnmounted(() => {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval)
        }
    })
</script>

<style lang="less" scoped>
    .infoCard {
        width: inherit;
        height: 150px;
        background: rgba(20, 20, 25, 0.6); // 使用深色半透，压住背景
        backdrop-filter: blur(15px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        opacity: 0;

        .quote-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 10px 16px 7% 16%;

            h3 {
                margin: 0;
                font-weight: 400;
                color: aliceblue;
            }

            .soup-btn {
                background: linear-gradient(45deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
                border: 2px solid rgba(255, 154, 158, 0.3);
                border-radius: 15px;
                padding: 5px 12px;
                color: #333;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 3px;
                transition: all 0.3s ease;
                box-shadow: 0 2px 6px rgba(255, 154, 158, 0.2);

                &:hover {
                    transform: scale(1.05) rotate(-2deg);
                    box-shadow: 0 4px 12px rgba(255, 154, 158, 0.4);
                    background: linear-gradient(45deg, #fecfef 0%, #ff9a9e 50%, #fecfef 100%);
                }

                &:active {
                    transform: scale(0.98);
                }

                span {
                    font-size: 14px;
                    animation: bounce-slow 2s infinite;
                }
            }
        }

        .quote-container {
            width: inherit;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;

            .quote {
                width: 200px;
                margin-top: 20px;
                color: azure;
                font-weight: 900;
                font-family: 'Georgia', 'Times New Roman', 'SimSun', serif;
                font-style: italic;
            }
        }
    }

    /* Transition 动画 */
    .fade-slide-enter-active,
    .fade-slide-leave-active {
        transition: all 0.5s ease;
    }

    .fade-slide-enter-from {
        opacity: 0;
        transform: translateY(20px);
    }

    .fade-slide-leave-to {
        opacity: 0;
        transform: translateY(20px);
    }

    /* 慢弹跳动画 */
    @keyframes bounce-slow {

        0%,
        20%,
        50%,
        80%,
        100% {
            transform: translateY(0);
        }

        40% {
            transform: translateY(-3px);
        }

        60% {
            transform: translateY(-1px);
        }
    }
</style>