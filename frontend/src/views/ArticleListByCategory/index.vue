t'sts<template>
    <div class="CategoryDetail">
        <div class="bg-glow"></div>

        <div class="Container">
            <div class="MainContent">
                <div class="CategoryHeader">
                    <div class="HeaderInfo">
                        <el-icon :size="40">
                            <Collection />
                        </el-icon>
                        <div class="TextGroup">
                            <h1>{{ queryData.title }}</h1>
                            <p>{{ queryData.desc }}</p>
                        </div>
                    </div>
                    <div class="Stats">
                        <span class="count">共 {{ queryData.articleCount }} 篇文章</span>
                    </div>
                </div>

                <div v-for="item in articleList" :key="item._id" class="ArticleItem">
                    <div class="ArticleCover">
                        <img v-lazy="item.cover" alt="cover">
                    </div>
                    <div class="ArticleInfo">
                        <h2 class="title">{{ item.title }}</h2>
                        <p class="summary">
                            {{ item.content }}
                        </p>
                        <div class="meta">
                            <span class="time">{{ item.published }}</span>
                            <span class="tags"># {{ item[categoryTab] }}</span>
                        </div>
                    </div>
                </div>

                <div class="article-loadmore-container">
                    <InfiniteScrollContainer :is-finished="isFinished" :load-more="fetchArticleCategoryTagList" />
                </div>

            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { onMounted, onUnmounted } from 'vue'
    import { useArticleListByCategory } from './useArticleListByCategory'
    import { Collection } from '@element-plus/icons-vue';
    import InfiniteScrollContainer from '@/components/business/InfiniteScrollContainer.vue';

    const { queryData, articleList, categoryTab, isFinished, fetchArticleCategoryTagList } = useArticleListByCategory()

    onMounted(async () => {
        await fetchArticleCategoryTagList()
    })
</script>

<style lang="less" scoped>
    // 基础变量
    @glass-white: rgba(255, 255, 255, 0.1);
    @glass-border: rgba(255, 255, 255, 0.15);
    @text-bright: #e1e1e1;
    @accent-blue: #4facfe;

    .CategoryDetail {
        min-height: 100vh;
        background: radial-gradient(circle at top, #2a3441 0%, #111418 100%);
        padding: 60px 20px;
        position: relative;
        overflow: hidden;

        // 背景氛围灯，解决“太黑”
        .bg-glow {
            position: absolute;
            top: 10%;
            right: 20%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(79, 172, 254, 0.15), transparent 70%);
            filter: blur(60px);
            pointer-events: none;
        }
    }

    .Container {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        gap: 30px;
        position: relative;
        z-index: 1;
    }

    .MainContent {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 25px;

        // 分类头部展示
        .CategoryHeader {
            background: @glass-white;
            backdrop-filter: blur(20px);
            border: 1px solid @glass-border;
            border-radius: 20px;
            padding: 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

            .HeaderInfo {
                display: flex;
                align-items: center;
                gap: 20px;

                .el-icon {
                    color: @accent-blue;
                }

                h1 {
                    font-size: 2rem;
                    color: #fff;
                    margin: 0;
                }

                p {
                    color: #aaa;
                    margin-top: 5px;
                }
            }

            .count {
                background: rgba(255, 255, 255, 0.05);
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                color: @accent-blue;
                border: 1px solid rgba(79, 172, 254, 0.3);
            }
        }

        // 文章列表项
        .ArticleItem {
            background: rgba(255, 255, 255, 0.06); // 降低基础透明度，更清透
            backdrop-filter: blur(15px) saturate(150%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05); // 底部边框微弱，模拟光向
            border-radius: 24px; // 更加圆润的倒角
            display: flex;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
            cursor: pointer;

            // 关键：给个外阴影，模拟物理厚度
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);

            &:hover {
                transform: translateY(-8px); // 悬浮跳动幅度稍微大一点
                background: rgba(255, 255, 255, 0.12);
                border-color: rgba(79, 172, 254, 0.5); // 悬浮时边框亮起

                // 悬浮时增加淡蓝色氛围光
                box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6),
                    0 0 20px rgba(79, 172, 254, 0.2);

                .ArticleCover img {
                    transform: scale(1.08); // 图片缩放反馈
                }
            }

            .ArticleCover {
                width: 280px; // 稍微加宽封面图比例
                height: 180px;
                overflow: hidden;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.6s ease;
                }
            }

            .ArticleInfo {
                padding: 25px 30px; // 增加内部补白
                flex: 1;
                display: flex;
                flex-direction: column;

                .title {
                    font-size: 1.4rem; // 标题大一点
                    font-weight: 600;
                    color: #ffffff;
                    margin-bottom: 12px;
                    letter-spacing: 0.5px;
                }

                .summary {
                    color: rgba(255, 255, 255, 0.6); // 降低正文亮度，突出标题
                    font-size: 0.95rem;
                    line-height: 1.7;
                    // 限制行数，保持整齐
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    white-space: hidden;
                    line-clamp: 2;
                    text-overflow: ellipsis;
                    overflow: hidden;
                }

                .meta {
                    margin-top: auto; // 强制元信息到底部
                    padding-top: 15px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.05); // 内部分割线

                    .time {
                        color: rgba(255, 255, 255, 0.4);
                        font-size: 13px;
                    }

                    .tags {
                        background: rgba(79, 172, 254, 0.1);
                        color: #4facfe;
                        padding: 2px 10px;
                        border-radius: 6px;
                        font-size: 12px;
                    }
                }
            }
        }

        .article-loadmore-container {
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
        }

    }

</style>
