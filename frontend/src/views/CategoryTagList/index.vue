<template>

    <div class="category">

        <div class="bg-image">
            <img src="/src/assets/【哲风壁纸】6K-6K画质.png" alt="">
        </div>

        <div class="category-container">
            <header class="category-header">
                <h1>{{ headerConfig.title }}<span>{{ headerConfig.titleSuffix }}</span></h1>
                <p>{{ headerConfig.subtitle }}</p>
            </header>

            <main class="category-grid">
                <section class="category-card featured" v-for="value in items"
                    @click="handArticleListByCategory(value)">
                    <div class="card-icon">{{ value.icon }}</div>
                    <h3>{{ value.name }}</h3>
                    <p>{{ value.desc }}</p>
                    <div class="meta">
                        <span class="article-count">{{ value.articleCount }} 篇文章</span>
                        <div href=" " class="enter-arrow">→</div>
                    </div>
                </section>

            </main>
        </div>
    </div>


</template>

<script setup lang="ts">
    import { onMounted } from 'vue'
    import { useCategoryTagList } from '@/views/CategoryTagList/useCategoryTagList'

    const props = defineProps<{
        path: string
    }>()
    const { headerConfig, items, handArticleListByCategory,
        initCategoryTabData } = useCategoryTagList(props.path)

    onMounted(async () => {
        await initCategoryTabData()
    })
</script>

<style scoped lang="less">

    // --- 1. 变量定义 ---
    @accent-primary: #6366f1; // 主色调：靛蓝
    @accent-secondary: #a855f7; // 辅助色：紫色
    @glass-bg: rgba(255, 255, 255, 0.45);
    @glass-border: rgba(255, 255, 255, 0.6);
    @text-main: #1e293b;
    @text-sub: #64748b;
    @blur-val: 16px;

    // --- 2. 复用混合 (Mixins) ---
    .glass-effect() {
        background: @glass-bg;
        backdrop-filter: blur(@blur-val);
        -webkit-backdrop-filter: blur(@blur-val);
        border: 1px solid @glass-border;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
    }

    .flex-center() {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    // --- 3. 页面布局 ---
    .category {
        width: 100%;
        min-height: 100vh;
        position: relative;

        .bg-image {
            width: 100%;
            height: 100%;
            position: fixed;
            left: 0;
            top: 0;
            z-index: -1;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }

        .category-container {
            position: relative;
            z-index: 1;
            max-width: 1200px;
            margin: 60px auto;
            padding: 0 30px;
            font-family: "PingFang SC", "Microsoft YaHei", sans-serif;

            .category-header {
                margin-bottom: 60px;

                h1 {
                    font-size: 3rem;
                    font-weight: 800;
                    background: linear-gradient(45deg, @text-main, @accent-primary);
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 12px;

                    span {
                        font-size: 1rem;
                        text-transform: uppercase;
                        letter-spacing: 4px;
                        margin-left: 15px;
                        -webkit-text-fill-color: @accent-secondary; // 恢复颜色
                        opacity: 0.7;
                    }
                }

                p {
                    color: @text-sub;
                    font-size: 1.1rem;
                    border-left: 3px solid @accent-primary;
                    padding-left: 15px;
                }
            }

            // 网格系统
            .category-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr); // 三列布局
                gap: 30px;

                // 响应式调整
                @media (max-width: 992px) {
                    grid-template-columns: repeat(2, 1fr);
                }

                @media (max-width: 640px) {
                    grid-template-columns: 1fr;
                }

                .category-card {
                    .glass-effect();
                    position: relative;
                    border-radius: 30px;
                    padding: 40px;
                    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                    overflow: hidden;
                    min-height: 200px;
                    cursor: pointer;

                    // 内部装饰物
                    &::before {
                        content: '';
                        position: absolute;
                        top: -20%;
                        right: -20%;
                        width: 100px;
                        height: 100px;
                        background: radial-gradient(circle, @accent-primary 0%, transparent 70%);
                        opacity: 0.1;
                        transition: 0.5s;
                    }

                    &:hover {
                        transform: translateY(-12px) scale(1.02);
                        background: rgba(255, 255, 255, 0.6);
                        border-color: @accent-primary;

                        &::before {
                            opacity: 0.3;
                            transform: scale(2);
                        }

                        .card-icon {
                            transform: rotate(15deg) scale(1.1);
                            color: @accent-primary;
                        }
                    }

                    // 卡片内具体元素
                    .card-icon {
                        font-size: 2.5rem;
                        margin-bottom: 20px;
                        display: block;
                        transition: 0.4s;
                        color: @text-sub;
                    }

                    h3 {
                        font-size: 1.5rem;
                        margin-bottom: 15px;
                        color: @text-main;
                    }

                    p {
                        font-size: 0.95rem;
                        color: @text-sub;
                        line-height: 1.7;
                        margin-bottom: 30px;
                    }

                    .meta {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;

                        .article-count {
                            font-weight: 700;
                            font-size: 0.9rem;
                            background: rgba(0, 0, 0, 0.05);
                            padding: 4px 12px;
                            border-radius: 20px;
                        }

                        .enter-arrow {
                            width: 35px;
                            height: 35px;
                            border-radius: 50%;
                            background: @accent-primary;
                            color: white;
                            .flex-center();
                            transition: 0.3s;

                            &:hover {
                                box-shadow: 0 0 15px @accent-primary;
                            }
                        }
                    }

                    // 针对不同位置的卡片做特殊处理（让布局不土的关键）
                    &:nth-child(even) {
                        margin-top: 40px; // 奇偶错位感

                        @media (max-width: 640px) {
                            margin-top: 0;
                        }
                    }

                    &.featured {
                        background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05));
                    }
                }
            }
        }
    }

</style>