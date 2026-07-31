<template>
    <div class="home">
        <div class="background-slideshow">
            <div class="wenzi">
                <GradientText class="custom-title"  :colors="['#5227FF', '#FF9FFC', '#B19EEF']" :animation-speed="8">
                    欢迎来到我的博客！
                </GradientText>
                <!-- <TextGlitch /> -->
                <TypeWriterEffect />
            </div>
            <div class='background-layer'>
                <SplashCursor v-if="showSplash" :splat-radius='0.2' :curl='3' :shading='true' />
                <img :src="imgUrl" alt="" fetchpriority="high" decoding="async">
            </div>
        </div>

        <!-- 波浪 -->
        <div class="blue-header">
            <Animation />
        </div>

        <div class="home-div" ref="homediv">
            <div class="left">

                <ArticleListHeader :articleList />

                <ArticleList :articleList />

                <InfiniteScrollContainer :is-finished="isFinished" :load-more="loadMore" />
            </div>

            <div class="right">
                <div class="home-right">
                    <div class="scroll-observer-anchor" :ref="el => setScroll((el as HTMLElement))"></div>

                    <PascalCase />

                    <SidebarNoticePanel />

                    <DigitalClock />

                    <RandomArticlePanel />

                    <HotTagSection />

                    <StatsPanel />
                </div>
            </div>

            <BackToTopTrigger :isShow="isShow" />

        </div>
    </div>


</template>

<script setup lang="ts">
    import TypeWriterEffect from '@/components/business/home/TypeWriterEffect.vue'
    import ArticleList from '@/components/business/home/ArticleList/ArticleList.vue';
    import ArticleListHeader from '@/components/business/home/ArticleList/ArticleListHeader.vue';
    import PascalCase from '@/components/business/home/Rigth/PascalCase.vue'
    import { useHome } from './useHome';
    // Vue/Vue Router/Pinia API 由 unplugin-auto-import 全局注入
    import BackToTopTrigger from '@/components/ui/BackToTopTrigger.vue';
    import InfiniteScrollContainer from '@/components/business/InfiniteScrollContainer.vue';
    import GradientText from '@/components/ui/gradient-text/GradientText.vue'
    import imgUrl from '@/assets/1.jpg'

    // 非首屏关键组件：异步加载，避免阻塞首屏渲染
    const Animation = defineAsyncComponent(() => import('@/components/business/home/ArticleList/Animation.vue'))
    const SplashCursor = defineAsyncComponent(() => import('@/components/ui/splash-cursor/SplashCursor.vue'))
    const SidebarNoticePanel = defineAsyncComponent(() => import('@/components/business/home/Rigth/SidebarNoticePanel.vue'))
    const DigitalClock = defineAsyncComponent(() => import('@/components/business/home/Rigth/DigitalClock.vue'))
    const RandomArticlePanel = defineAsyncComponent(() => import('@/components/business/home/Rigth/RandomArticlePanel.vue'))
    const HotTagSection = defineAsyncComponent(() => import('@/components/business/home/Rigth/HotTagSection.vue'))
    const StatsPanel = defineAsyncComponent(() => import('@/components/business/home/Rigth/StatsPanel.vue'))

    // SplashCursor 是 WebGL 重型组件，延迟到浏览器空闲后再挂载，避免抢占首屏主线程
    const showSplash = ref(false)
    const scheduleSplash = () => {
        const start = () => { showSplash.value = true }
        if ('requestIdleCallback' in window) {
            ;(window as any).requestIdleCallback(start, { timeout: 2000 })
        } else {
            setTimeout(start, 1500)
        }
    }

    const { articleList, isFinished, isShow, initHomePage,
        cleanupHomePage, loadMore, setScroll } = useHome()

    onMounted(async () => {
        scheduleSplash()
        await loadMore()
        await initHomePage()
    })

    onUnmounted(() => {
        cleanupHomePage()
    })

</script>

<style lang="less" scoped>
    @import '/src/styles/home-right.less';

    .home {
        width: 100%;
        height: auto;
        // 关键改动：换成更深邃、带点蓝紫调的深色背景，能更好地衬托玻璃感
        // background: linear-gradient(to bottom, #1a1c2c 0%, #0d0e14 100%);
        min-height: 100vh;

        .background-slideshow {
            width: inherit;
            height: 100vh;
            position: relative;

            // 增加一个遮罩，让顶部的文字更清晰
            &::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.3);
            }

            .wenzi {
                width: inherit;
                min-height: 200px;
                position: absolute;
                top: 40%; // 稍微下移一点，视觉中心更稳
                z-index: 89;
                display: flex;
                align-items: center;
                gap: 24px;
                flex-direction: column;
                text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);

                .custom-title{
                    font-size: 60px;
                    font-weight: 600;
                }
            }

            .background-layer {
                width: inherit;
                height: inherit;
                position: fixed;
                top: 0; // 确保对齐

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }
        }

        .blue-header {
            position: absolute;
            bottom: -2px; // 消除缝隙
            width: 100%;
            height: 200px;
            z-index: 10;
            overflow: hidden;
            /* 波浪可以加一个淡入淡出的遮罩 */
            mask-image: linear-gradient(to top, white 80%, transparent);
        }

        .home-div {
            width: 100%;
            // max-width: 1400px;
            margin: 0 auto;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
            gap: 30px;
            position: relative;
            box-sizing: border-box;
            z-index: 20;

            // --- 新增：给整个内容区加一个非常淡的背景，用于统一视觉 ---
            // 这样背景图就不会直接撞上文字，而是隔了一层“薄雾”
            &::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.01); // 极淡的白色覆盖
                backdrop-filter: blur(8px); // 全局轻微模糊，增加景深
                pointer-events: none;
                z-index: -1;
            }

            .left {
                width: 65%;
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .right {
                width: 280px;
                position: relative;

                .scroll-observer-anchor {
                    width: 100px;
                    height: 100px;
                    left: 0;
                    top: 800px;
                    overflow: 0;
                    position: absolute;
                }
            }
        }
    }

    .backToTopTrigger {
        position: fixed;
    }
</style>
