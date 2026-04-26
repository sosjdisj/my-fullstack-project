<template>
    <div class="article-header" :style="{ backgroundImage: `url(${props.articleData.cover})` }">
        <div class="content-overlay">
            <div class="info-top">
                <div class="tags-row">
                    <span class="topic-tag">{{ props.articleData.category }}</span>
                    <span class="topic-tag"># {{ props.articleData.tag }}</span>
                </div>
                <h1 class="article-title">{{ props.articleData.title }}</h1>
            </div>

            <div class="info-bottom">
                <div class="meta-stats-group">
                    <div class="word-count">
                        <span class="label">Total Words</span>
                        <span class="value">{{ props.articleData.wordCount }}</span>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <i class="icon">👁</i> {{ props.articleData.pageViews }}
                        </div>
                        <div class="stat-item">
                            <i class="icon">💬</i> {{ props.articleData.comments }}
                        </div>
                        <div class="stat-item">
                            <i class="icon">👍</i> {{ props.articleData.likes }}
                        </div>
                        <div class="stat-item">
                            <i class="icon">⭐</i> {{ props.articleData.collects }}
                        </div>
                        <div class="time-item published">
                            <span class="label">Released:</span> {{ formatDate(props.articleData.published) }}
                        </div>
                        <div class="time-item updated">
                            <span class="label">Updated:</span> {{ formatDate(props.articleData.updated) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
    import type { Article } from '@/types/index'
    import { formatDate } from '@/utils/helpers'

    const props = defineProps<{
        articleData: Article
    }>()
</script>

<style lang="less" scoped>
    @accent-blue: #00e5ff;
    @glass-bg: rgba(255, 255, 255, 0.1);
    @glass-border: rgba(255, 255, 255, 0.15);

    .article-header {
        width: 100%;
        height: 400px; // 稍微加高，更有气势
        background-size: cover;
        background-position: center;
        position: relative;
        border-radius: 24px; // 更大的圆角
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        cursor: default;

        // 核心遮罩：底部加深，确保文字清晰
        .content-overlay {
            width: 100%;
            height: 100%;
            background: linear-gradient(to bottom,
                    rgba(0, 0, 0, 0.2) 0%,
                    rgba(0, 0, 0, 0.8) 100%);
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding: 40px;
            box-sizing: border-box;
        }

        .info-top {
            margin-bottom: 24px;

            .tags-row {
                display: flex;
                gap: 12px;
                margin-bottom: 20px;

                .topic-tag {
                    // 这里的蓝色去掉，改为低调的边框风格
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 13px;
                    font-weight: 400;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(8px);
                    padding: 4px 12px;
                    border-radius: 6px;
                    border: 1px solid rgba(255, 255, 255, 0.15); // 淡淡的白边
                    transition: all 0.3s ease;

                    &:hover {
                        border-color: @accent-blue; // 只有在鼠标悬停时才显露那一抹蓝
                        color: #fff;
                        background: rgba(0, 229, 255, 0.05);
                    }
                }
            }


            .article-title {
                color: #fff;
                font-size: 2.5rem;
                font-weight: 800;
                margin: 0;
                line-height: 1.2;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
            }
        }

        .info-bottom {
            .meta-stats-group {
                display: flex;
                flex-wrap: wrap;
                align-items: flex-end;
                gap: 20px;

                .word-count {
                    background: @glass-bg;
                    border: 1px solid @glass-border;
                    backdrop-filter: blur(10px);
                    padding: 10px 20px;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;

                    .label {
                        font-size: 10px;
                        color: rgba(255, 255, 255, 0.5);
                        text-transform: uppercase;
                    }

                    .value {
                        color: #fff;
                        font-weight: 700;
                        font-size: 18px;
                    }
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, auto);
                    gap: 8px;

                    .stat-item {
                        background: @glass-bg;
                        border: 1px solid @glass-border;
                        backdrop-filter: blur(10px);
                        padding: 6px 14px;
                        border-radius: 10px;
                        color: #fff;
                        font-size: 13px;
                        display: flex;
                        align-items: center;
                        gap: 6px;

                        .icon {
                            font-style: normal;
                            font-size: 14px;
                        }
                    }

                    .time-item {
                        grid-column: span 2;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid @glass-border;
                        padding: 6px 14px;
                        border-radius: 10px;
                        color: rgba(255, 255, 255, 0.7);
                        font-size: 12px;

                        .label {
                            color: rgba(255, 255, 255, 0.4);
                            margin-right: 4px;
                        }
                    }
                }
            }
        }
    }

    // 适配移动端
    @media (max-width: 768px) {
        .article-header {
            height: auto;
            min-height: 350px;

            .article-title {
                font-size: 1.8rem;
            }

            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    }
</style>
