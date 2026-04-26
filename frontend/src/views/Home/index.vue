<template>
    <div class="home">
        <div class="background-slideshow">
            <div class="wenzi">
                <TextGlitch />
                <TypeWriterEffect />
            </div>
            <div v-for="(value, index) in imgs" :key="index" class='background-layer'>
                <img :src="value" alt="" :ref="el => setImgRef((el as HTMLElement), index)">
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

                <InfiniteScrollContainer 
                    :is-finished="isFinished"
                    :load-more="loadMore"
                />
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
    import Animation from '@/components/business/home/ArticleList/Animation.vue'
    import TypeWriterEffect from '@/components/business/home/TypeWriterEffect.vue'
    import TextGlitch from '@/components/business/home/TextGlitch.vue'
    import ArticleList from '@/components/business/home/ArticleList/ArticleList.vue';
    import ArticleListHeader from '@/components/business/home/ArticleList/ArticleListHeader.vue';
    import PascalCase from '@/components/business/home/Rigth/PascalCase.vue'
    import SidebarNoticePanel from '@/components/business/home/Rigth/SidebarNoticePanel.vue'
    import DigitalClock from '@/components/business/home/Rigth/DigitalClock.vue'
    import RandomArticlePanel from '@/components/business/home/Rigth/RandomArticlePanel.vue'
    import HotTagSection from '@/components/business/home/Rigth/HotTagSection.vue';
    import StatsPanel from '@/components/business/home/Rigth/StatsPanel.vue'
    import { useHome } from './useHome';
    import { onMounted, onUnmounted, } from 'vue';
    import BackToTopTrigger from '@/components/ui/BackToTopTrigger.vue';
    import InfiniteScrollContainer from '@/components/business/InfiniteScrollContainer.vue';

    const { imgs, articleList, isFinished, isShow, setImgRef, initHomePage,
        cleanupHomePage, loadMore, setScroll } = useHome()

    onMounted(async () => {
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
        background: linear-gradient(to bottom, #1a1c2c 0%, #0d0e14 100%);
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
                    opacity: 0;
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
