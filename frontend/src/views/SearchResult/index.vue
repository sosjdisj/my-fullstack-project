<template>
    <div class="page-wrapper">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>

        <div class="search-results-page">
            <header class="results-header">
                <div class="query-info">
                    搜索结果：<span class="keyword">"{{ queryData }}"</span>
                    <span class="count">找到 {{ searchResult }} 篇相关文章</span>
                </div>
            </header>

            <div class="results-list">
                <div v-for="(article, index) in articles" :key="index" class="article-glass-card"
                    @click="handArticleDetail(article._id)">
                    <div class="card-content">
                        <div v-if="article.cover" class="article-cover">
                            <img :src="article.cover" :alt="article.title" />
                        </div>
                        <h2 class="article-title">{{ article.title }}</h2>
                        <p class="article-excerpt">{{ article.content }}</p>

                        <div class="article-meta">
                            <span class="date">{{ formatDate(article.published) }}</span>
                            <span class="category">{{ article.category }}</span>
                            <div v-if="article.tag" class="tags">
                                <span class="tag">{{ article.tag }}</span>
                            </div>
                        </div>

                        <div class="card-footer">
                            <div class="stats">
                                <span>👁️ {{ article.pageViews }}</span>
                                <span>❤️ {{ article.likes }}</span>
                            </div>
                            <button class="read-more">阅读全文 →</button>
                        </div>
                    </div>
                    <div class="card-glow"></div>
                </div>
            </div>

            <InfiniteScrollContainer :is-finished="isFinished" :load-more="loadSearchArticleList" />

        </div>

    </div>
</template>

<script setup lang="ts">
    import { onMounted, onUnmounted } from 'vue';
    import { useSearchResult } from './useSearchResult';
    import InfiniteScrollContainer from '@/components/business/InfiniteScrollContainer.vue';
    import { formatDate } from '@/utils/helpers'

    const { queryData, searchResult, articles, isFinished,
        handArticleDetail, loadSearchArticleList, clear } = useSearchResult()

    onMounted(async () => {
        await loadSearchArticleList()
    })
    onUnmounted(() => {
        clear()
    })
</script>

<style lang="less" scoped>
    // --- Less 变量 ---
    @bg-dark: #0f172a;
    @accent-blue: #38bdf8;
    @glass-bg: rgba(255, 255, 255, 0.05);
    @glass-border: rgba(255, 255, 255, 0.12);
    @text-main: #f8fafc;
    @text-dim: rgba(248, 250, 252, 0.6);

    // --- 混合 (Mixins) ---
    .glass-effect() {
        background: @glass-bg;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid @glass-border;
    }

    // --- 布局样式 ---
    .page-wrapper {
        min-height: 100vh;
        background: @bg-dark;
        position: relative;
        overflow: hidden;
        font-family: 'PingFang SC', sans-serif;
        padding: 60px 20px;
        cursor: pointer;

        // 背景动态色块
        .blob {
            position: absolute;
            width: 600px;
            height: 600px;
            border-radius: 50%;
            filter: blur(120px);
            opacity: 0.15;
            z-index: 0;
            animation: pulse 15s infinite ease-in-out;
        }

        .blob-1 {
            top: -100px;
            right: -100px;
            background: @accent-blue;
        }

        .blob-2 {
            bottom: -100px;
            left: -100px;
            background: #c084fc;
            animation-delay: -5s;
        }
    }

    @keyframes pulse {

        0%,
        100% {
            transform: scale(1) translate(0, 0);
        }

        50% {
            transform: scale(1.1) translate(20px, 40px);
        }
    }

    .search-results-page {
        position: relative;
        z-index: 1;
        max-width: 860px;
        margin: 0 auto;
    }

    // --- Header 样式 ---
    .results-header {
        margin-bottom: 50px;

        .query-info {
            color: @text-main;
            font-size: 1.4rem;

            .keyword {
                color: @accent-blue;
                font-weight: bold;
                margin: 0 8px;
            }

            .count {
                font-size: 0.9rem;
                color: @text-dim;
                display: block;
                margin-top: 10px;
            }
        }
    }

    // --- 卡片样式 ---
    .results-list {
        display: flex;
        flex-direction: column;
        gap: 25px;
    }

    .article-glass-card {
        position: relative;
        .glass-effect();
        border-radius: 28px;
        padding: 35px;
        transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        overflow: hidden;

        &:hover {
            transform: translateY(-8px);
            border-color: rgba(56, 189, 248, 0.5);
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);

            .read-more {
                background: @accent-blue;
                color: #000;
            }
        }

        .article-cover {
            width: 100%;
            height: 180px;
            border-radius: 16px;
            overflow: hidden;
            margin-bottom: 20px;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.4s ease;
            }

            &:hover img {
                transform: scale(1.05);
            }
        }

        .article-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            font-size: 0.85rem;
            margin-bottom: 18px;
            align-items: center;

            .date {
                color: @text-dim;
            }

            .category {
                color: @accent-blue;
                font-weight: 500;
            }

            .tags {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;

                .tag {
                    background: rgba(56, 189, 248, 0.15);
                    color: @accent-blue;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    border: 1px solid rgba(56, 189, 248, 0.3);
                    transition: all 0.3s ease;

                    &:hover {
                        background: rgba(56, 189, 248, 0.3);
                        transform: translateY(-2px);
                    }
                }
            }
        }

        .article-title {
            font-size: 1.6rem;
            color: @text-main;
            margin-bottom: 15px;
            line-height: 1.3;
        }

        .article-excerpt {
            color: @text-dim;
            line-height: 1.8;
            font-size: 0.95rem;
            margin-bottom: 30px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            text-overflow: ellipsis;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .stats {
                color: @text-dim;
                font-size: 0.9rem;

                span {
                    margin-right: 18px;
                }
            }

            .read-more {
                background: transparent;
                border: 1px solid @accent-blue;
                color: @accent-blue;
                padding: 10px 24px;
                border-radius: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s;
            }
        }
    }
</style>
