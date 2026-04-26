<template>
    <div class="profile-page-container">
        <div class="glass-blob blob-1"></div>
        <div class="glass-blob blob-2"></div>

        <div class="main-content">
            <aside class="left-aside">
                <div class="user-profile-wrapper">
                    <PascalCase />

                    <div class="action-section">
                        <button class="glass-btn primary" @click="router.push('/setting')">编辑资料</button>
                    </div>
                </div>
            </aside>

            <section class="right-main">
                <div class="list-header">
                    <h1 class="page-title">我的收藏</h1>
                    <form class="filter-tools" @submit.prevent="handleSearch">
                        <input v-model="keyword" type="text" placeholder="搜索收藏的文章..." class="search-input" />
                    </form>
                </div>

                <div class="article-grid">
                    <div v-for="item in collectedArticles" :key="item._id" class="article-card"
                        @click="goToArticle(item)">
                        <div class="card-image">
                            <img :src="item.cover" alt="">
                            <div class="tag-wrapper">
                                <span class="tag category-tag">{{ item.category }}</span>
                                <span class="tag">{{ item.tag }}</span>
                            </div>
                        </div>
                        <div class="card-body">
                            <h3>{{ item.title }}</h3>
                            <p>{{ item.content }}</p>

                            <div class="card-footer">
                                <span class="time">{{ formatDate(item.published) }}</span>

                                <div class="fav-action is-active" @click.stop="showUnfavoriteConfirm(item)">
                                    <svg class="star-icon" viewBox="0 0 24 24">
                                        <path
                                            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z">
                                        </path>
                                    </svg>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <InfiniteScrollContainer 
                    :is-finished="isFinished"
                    :load-more="loadMore"
                />

            </section>

        </div>

        <!-- 取消收藏确认弹窗 -->
        <UnfavoriteConfirm :visible="confirmVisible" :title="confirmItem?.title || ''" @confirm="confirmUnfavorite"
            @cancel="closeConfirm" />
    </div>
</template>

<script lang="ts" setup>
    import PascalCase from '@/components/business/home/Rigth/PascalCase.vue';
    import UnfavoriteConfirm from '@/components/ui/UnfavoriteConfirm.vue';
    import router from '@/router';
    import { useFullProfile } from '@/views/FullProfile/useFullProfile'
    import { onMounted } from 'vue';
    import { formatDate } from '@/utils/helpers'
    import InfiniteScrollContainer from '@/components/business/InfiniteScrollContainer.vue';

    const { collectedArticles, confirmVisible, confirmItem, keyword,
        getCollectedArticles, goToArticle, showUnfavoriteConfirm, confirmUnfavorite,
        closeConfirm, handleSearch, isFinished, loadMore,
    } = useFullProfile()

    onMounted(async () => {
        await getCollectedArticles()
    })
</script>

<style lang="less" scoped>
    // --- 核心变量 (同步你组件的蓝色调) ---
    @theme-blue: #409EFF;
    @theme-blue-dark: #0077ff;
    @amber-gold: #ffb800; // 收藏星星的琥珀金
    @glass-bg-dark: rgba(255, 255, 255, 0.05);
    @glass-border: rgba(255, 255, 255, 0.1);

    .profile-page-container {
        min-height: 100vh;
        padding: 60px 5%;
        // 深色底色，完美衬托白色半透明组件
        background: radial-gradient(circle at top, #1e293b 0%, #0f172a 100%);
        position: relative;
        display: flex;
        justify-content: center;
        overflow-x: hidden;
        font-family: 'PingFang SC', sans-serif;

        .glass-blob {
            position: fixed;
            border-radius: 50%;
            filter: blur(120px);
            z-index: 0;
            opacity: 0.3;

            &.blob-1 {
                width: 600px;
                height: 600px;
                background: @theme-blue;
                top: -200px;
                left: -100px;
            }

            &.blob-2 {
                width: 500px;
                height: 500px;
                background: #6366f1;
                bottom: -150px;
                right: -50px;
            }
        }

        .main-content {
            position: relative;
            z-index: 1;
            display: flex;
            gap: 40px;
            width: 100%;
            max-width: 1300px;
            align-items: flex-start;
        }

        // --- 左侧侧边栏 ---
        .left-aside {
            width: 320px;
            flex-shrink: 0;
            position: sticky;
            top: 60px;

            .action-section {
                margin-top: 25px;
                display: flex;
                flex-direction: column;
                gap: 15px;

                .glass-btn {
                    width: 100%;
                    padding: 14px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

                    &.primary {
                        background: linear-gradient(45deg, @theme-blue, @theme-blue-dark);
                        color: white;
                        border: none;
                        box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);

                        &:hover {
                            transform: translateY(-5px) scale(1.02);
                            box-shadow: 0 8px 25px rgba(64, 158, 255, 0.5);
                        }
                    }
                }
            }
        }

        // --- 右侧文章列表 ---
        .right-main {
            flex-grow: 1;

            .list-header {
                margin-bottom: 40px;

                .page-title {
                    font-size: 2.2rem;
                    color: #fff;
                    margin: 0 0 15px;
                    font-weight: 700;
                    letter-spacing: 1px;
                }

                .search-input {
                    background: @glass-bg-dark;
                    backdrop-filter: blur(15px);
                    border: 1px solid @glass-border;
                    padding: 12px 25px;
                    border-radius: 50px;
                    width: 300px;
                    color: #fff;
                    outline: none;
                    transition: all 0.4s ease;

                    &::placeholder {
                        color: rgba(255, 255, 255, 0.3);
                    }

                    &:focus {
                        width: 400px;
                        border-color: @theme-blue;
                        background: rgba(255, 255, 255, 0.08);
                    }
                }
            }

            .article-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: 30px;

                .article-card {
                    background: @glass-bg-dark;
                    backdrop-filter: blur(15px);
                    border: 1px solid @glass-border;
                    border-radius: 20px;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);

                    &:hover {
                        transform: translateY(-10px);
                        border-color: rgba(64, 158, 255, 0.4);
                        background: rgba(255, 255, 255, 0.08);
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    }

                    .card-image {
                        height: 180px;
                        background-size: cover;
                        background-position: center;
                        position: relative;
                        overflow: hidden;

                        img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                        }

                        .tag-wrapper {
                            position: absolute;
                            top: 15px;
                            left: 15px;
                            display: flex;
                            gap: 8px;
                            flex-wrap: wrap;

                            .tag {
                                background: rgba(0, 0, 0, 0.5);
                                color: #fff;
                                padding: 4px 10px;
                                border-radius: 6px;
                                font-size: 11px;
                                font-weight: 500;
                                backdrop-filter: blur(4px);
                                border: 1px solid rgba(255, 255, 255, 0.15);
                                transition: all 0.3s ease;
                                cursor: default;

                                &:hover {
                                    background: @theme-blue;
                                    transform: translateY(-2px);
                                }
                            }

                            .category-tag {
                                background: rgba(64, 158, 255, 0.7);
                                border-color: rgba(64, 158, 255, 0.5);

                                &:hover {
                                    background: @theme-blue;
                                }
                            }
                        }
                    }

                    .card-body {
                        padding: 25px;

                        h3 {
                            font-size: 1.2rem;
                            color: #fff;
                            margin-bottom: 12px;
                            line-height: 1.4;
                        }

                        p {
                            font-size: 0.9rem;
                            color: rgba(255, 255, 255, 0.6);
                            line-height: 1.6;
                            height: 3.2em;

                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            max-width: 400px;
                        }
                    }

                    .card-footer {
                        margin-top: 20px;
                        padding-top: 15px;
                        border-top: 1px solid rgba(255, 255, 255, 0.05);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;

                        .time {
                            color: rgba(255, 255, 255, 0.4);
                            font-size: 12px;
                        }

                        .fav-action {
                            cursor: pointer;
                            transition: all 0.3s ease;

                            .star-icon {
                                width: 22px;
                                height: 22px;
                                fill: none;
                                stroke: rgba(255, 255, 255, 0.3);
                                stroke-width: 1.5;
                                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                            }

                            &.is-active .star-icon {
                                fill: @amber-gold;
                                stroke: @amber-gold;
                                filter: drop-shadow(0 0 5px rgba(255, 184, 0, 0.4));
                            }

                            &:hover {
                                transform: scale(1.2) rotate(15deg);

                                .star-icon {
                                    stroke: @amber-gold;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // 响应式
    @media (max-width: 900px) {
        .main-content {
            flex-direction: column;

            .left-aside {
                width: 100%;
                position: relative;
                top: 0;
            }
        }
    }
</style>