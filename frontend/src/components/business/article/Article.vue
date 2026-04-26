<template>
    <div>
        <div class="Comment" @click="handleClick">
            <div class="Comment-tooltip">
                <div>
                    <p>前往评论区...</p>
                </div>
            </div>
            <el-icon :size="24">
                <ChatDotRound />
            </el-icon>
        </div>

        <div class="ScrollProgress">
            {{ scrollProgress }}%
        </div>

        <div class="Article">

            <div class="pulseWave">
                <slot></slot>
            </div>

            <div class="article-right">
                <div class="home-right">
                    <PascalCase />

                    <SidebarNoticePanel />

                    <DigitalClock />

                    <RandomArticlePanel :articleListProps="articleList" />

                    <HotTagSection />

                    <StatsPanel />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ChatDotRound } from '@element-plus/icons-vue'
    import { onMounted, onUnmounted, ref } from 'vue'//用于定义异步组件的函数
    import PascalCase from '@/components/business/home/Rigth/PascalCase.vue'
    import SidebarNoticePanel from '@/components/business/home/Rigth/SidebarNoticePanel.vue'
    import DigitalClock from '@/components/business/home/Rigth/DigitalClock.vue'
    import RandomArticlePanel from '@/components/business/home/Rigth/RandomArticlePanel.vue'
    import HotTagSection from '@/components/business/home/Rigth/HotTagSection.vue';
    import { initHomeRightScrollAnimations } from '@/utils/helpers'
    import type { Article } from '@/types/index'
    import StatsPanel from '@/components/business/home/Rigth/StatsPanel.vue'

    const articleList = ref<Article[]>([])

    const emit = defineEmits(['scroll-to-comment'])

    const scrollProgress = ref(0)
    const getScrollProgress = () => {
        const scrollTop = window.scrollY  // 使用更标准的属性名
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
        return Math.round(Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)))
    }
    const updateProgress = () => {
        scrollProgress.value = getScrollProgress()
    }

    const handleClick = () => {
        emit('scroll-to-comment')
    }

    onMounted(() => {

        setTimeout(() => {
            initHomeRightScrollAnimations('.home-right>*')
        }, 0)

        window.addEventListener('scroll', updateProgress)
    })
    onUnmounted(() => {

        window.removeEventListener('scroll', updateProgress)
    })
</script>

<style lang="less" scoped>
    @import '/src/styles/home-right.less';

    // 抽取玻璃风格复用变量
    @glass-bg: rgba(255, 255, 255, 0.05);
    @glass-border: rgba(255, 255, 255, 0.1);
    @glass-blur: blur(12px);
    @accent-color: #4facfe;

    .Article {
        width: 100%;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        background: radial-gradient(circle at top left, #2c3e50, #000000); // 渐变背景增强玻璃感
        padding: 40px 0;
        gap: 30px;

        .pulseWave {
            width: 65%;
            min-height: 120vh;
            background: @glass-bg;
            backdrop-filter: @glass-blur;
            border: 1px solid @glass-border;
            border-radius: 20px;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            padding: 25px;
            transition: transform 0.3s ease;
        }

        .article-right {
            width: 280px; // 建议固定宽度更稳重

            .home-right>div {
                background: rgba(20, 20, 25, 0.6); // 使用深色半透，压住背景
                backdrop-filter: blur(15px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            }
        }
    }

    // 悬浮评论按钮
    .Comment {
        width: 65px;
        height: 65px;
        position: fixed;
        bottom: 25%;
        right: 27px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(15px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #c4a7e8;
        box-shadow: 0 0 12px rgba(196, 136, 255, 0.7);
        transition: all 0.3s ease;
        z-index: 99;
        cursor: pointer;

        &:hover {
            box-shadow: 0 0 15px rgba(192, 100, 255, 0.9);
            transform: translateY(-3px);
        }

        .Comment-tooltip {
            position: absolute;
            bottom: 75px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(30, 20, 40, 0.85);
            backdrop-filter: blur(10px);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-family: 'Inter', sans-serif;
            font-weight: 500;
            color: #c4a7e8;
            white-space: nowrap;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            pointer-events: none;
            border: 1px solid rgba(196, 136, 255, 0.3);
            box-shadow: 0 0 8px rgba(196, 136, 255, 0.3);

            p {
                margin: 0;
                padding: 0;
                white-space: nowrap;
            }
        }

        &:hover .Comment-tooltip {
            opacity: 1;
            visibility: visible;
        }

        .el-icon {
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    // 滚动进度指示器
    .ScrollProgress {
        width: 65px;
        height: 65px;
        position: fixed;
        bottom: 13%;
        right: 27px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(15px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-family: 'Inter', sans-serif;
        font-weight: 600;
        /* --- 颜色修改：改为柔和的紫罗兰色 --- */
        color: #c4a7e8;
        box-shadow: 0 0 12px rgba(196, 136, 255, 0.7);
        transition: all 0.3s ease;
        z-index: 99;
        /* 阴影色也同步修改 */

        /* 如果没有特定的 hover 触发器，直接使用 ::hover */
        &:hover {
            box-shadow: 0 0 15px rgba(192, 100, 255, 0.9);
            transform: translateY(-3px);
        }

    }

</style>