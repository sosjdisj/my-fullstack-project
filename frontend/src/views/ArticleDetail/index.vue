<template>
    <div>
        <Articlen @scroll-to-comment="handleScrollToComment">
            <div class="infinityLoop">

                <ArticleHeader v-if="isDataReady" :articleData="articleData" />

                <div class="bottom">
                    <p>
                        {{ articleData.content }}
                    </p>
                </div>
            </div>
            <div class="xuxian"></div>

            <Statement v-if="isDataReady" :author="articleData.author" :path="`/articleDetail/${queryData.id}`" />

            <LikeButton @update-like="handleUpdateDataLike" @update-collects="handleUpdateDataFavorites"
                v-if="isDataReady" :articleData="articleData" :prev :next />

            <Remark :comments="articleData.comments" :id="articleData._id" ref="remarkComponentRef" />

            <CommentCard v-for="item in comments" :data="item" />

            <div class="article-loadmore-container">
                <InfiniteScrollContainer :is-finished="isFinished" :load-more="loadMore" />
            </div>

        </Articlen>

        <ReadingStatus :id="(queryData.id as string)" />
    </div>
</template>

<script setup lang="ts">
    import { onMounted, onUnmounted, ref } from 'vue';
    import Articlen from '@/components/business/article/Article.vue'
    import ArticleHeader from '@/components/business/article/ArticleHeader.vue';
    import Statement from '@/components/business/article/Statement.vue'
    import LikeButton from '@/components/business/article/LikeButton.vue'
    import Remark from '@/components/business/article/Remark.vue'
    import CommentCard from '@/components/business/article/CommentCard.vue'
    import ReadingStatus from '@/components/business/ReadingStatus.vue';
    import InfiniteScrollContainer from '@/components/business/InfiniteScrollContainer.vue';
    import { useArticleDetail } from './useArticleDetail';

    const remarkComponentRef = ref<InstanceType<typeof Remark> | null>(null);

    const { queryData, articleData, prev, next, isDataReady, isFinished, comments,
        handleUpdateDataLike,
        handleUpdateDataFavorites, fetchArticleData, loadMore,
        cleanupuseArticleListByCategory, handleScrollToComment } = useArticleDetail(remarkComponentRef)

    onMounted(async () => {
        await fetchArticleData()
    })
    onUnmounted(() => {
        cleanupuseArticleListByCategory()
    })
</script>

<style scoped lang="less">
    // 统一样式变量
    @accent-blue: #00e5ff;
    @glass-bg: rgba(255, 255, 255, 0.03);
    @card-bg: rgba(30, 32, 40, 0.6);
    @glass-border: rgba(255, 255, 255, 0.08);
    @text-main: #e2e8f0;

    .infinityLoop {
        width: 94%;
        max-width: 920px;
        margin: 40px auto;

        .bottom {
            width: 100%;
            background: @card-bg;
            backdrop-filter: blur(20px);
            border: 1px solid @glass-border;
            border-radius: 24px; // 稍微大一点的圆角更有高级感
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            overflow: hidden;

            p {
                line-height: 2;
                font-size: 16px;
                color: @text-main;
                padding: 40px;
                white-space: pre-wrap;
                letter-spacing: 0.02em;
            }
        }
    }

    // 分割线：优雅的渐变消隐
    .xuxian {
        height: 1px;
        width: 80%;
        margin: 60px auto;
        background: linear-gradient(90deg,
                transparent 0%,
                @glass-border 50%,
                transparent 100%);
        position: relative;

        &::after {
            content: '✦';
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            color: @accent-blue;
            font-size: 12px;
            text-shadow: 0 0 10px @accent-blue;
        }
    }

    // // 针对底部组件的深度布局优化
    // :deep(.Statement) {
    //     background: rgba(255, 255, 255, 0.02);
    //     border: 1px dashed @glass-border;
    //     border-radius: 16px;
    //     padding: 20px;
    //     margin: 20px auto;
    //     width: 94%;
    //     max-width: 920px;
    //     color: rgba(255, 255, 255, 0.5);
    //     font-size: 13px;
    // }

    // :deep(.LikeButton) {
    //     margin: 40px auto;
    //     display: flex;
    //     justify-content: center;
    //     gap: 20px;

    //     // 假设按钮内部有特定类名，给予发光反馈
    //     button {
    //         transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);

    //         &:hover {
    //             transform: translateY(-5px);
    //             filter: drop-shadow(0 0 8px @accent-blue);
    //         }
    //     }
    // }

    // // 评论区整体容器
    // :deep(.Remark),
    // :deep(.Reply) {
    //     width: 94%;
    //     max-width: 920px;
    //     margin: 15px auto;
    //     background: @card-bg;
    //     backdrop-filter: blur(15px);
    //     border: 1px solid @glass-border;
    //     border-radius: 16px;
    //     padding: 20px;
    //     transition: transform 0.3s ease;

    //     &:hover {
    //         border-color: rgba(0, 229, 255, 0.3);
    //         box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    //     }
    // }
</style>
