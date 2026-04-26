<template>
    <div class="luna">
        <div class="luna-header">
            <h3>随机文章</h3>
            <button class="refresh-btn" @click="shuaxin" :disabled="loading">
                <span v-if="!loading">🔄</span>
                <span v-else class="loading-icon">⏳</span>
                换一批
            </button>
        </div>
        <div class="stella">
            <div class="iris" v-for="item in RandomArticle" :key="item._id" @click="handnavigateTo(item)">
                <div class="iris-one">
                    <img v-lazy="item.cover" alt="">
                </div>
                <div class="iris-two">
                    <p class="ellipsis">{{ item.title }}</p>
                    <p class="ellipsis">{{ formatDate(item.published) }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { ref, onMounted } from 'vue'
    import type { ArticleNeighbor } from '@/types/index'
    import { useRouter } from 'vue-router';
    import { get } from '@/api/request'
    import { formatDate } from '@/utils/helpers'

    const RandomArticle = ref<ArticleNeighbor[]>([])
    const loading = ref()
    const router = useRouter()

    const shuaxin = async () => {
        // 🚀 添加加载状态
        loading.value = true

        getRandomArticle()

        // 模拟加载延迟，让用户看到加载效果
        setTimeout(() => {
            loading.value = false
        }, 300) // 300ms延迟，让用户看到加载效果
    }
    const handnavigateTo = (item: ArticleNeighbor) => {
        router.push({
            path: `/articleDetail/${item._id}`,
            query: {
                id: item._id
            }
        })
    }
    const getRandomArticle = async () => {
        const resulTow = await get('/article/random/list')
        if (resulTow.success) {
            RandomArticle.value = resulTow.data.data.list
        }
    }

    onMounted(async () => {
        getRandomArticle()
    })
</script>

<style lang="less" scoped>
    .luna {
        width: inherit;
        height: 348.38px;
        background: rgba(20, 20, 25, 0.6); // 使用深色半透，压住背景
        backdrop-filter: blur(15px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        opacity: 0;

        .luna-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 10px 16px 7% 16%;

            h3 {
                margin: 0;
                font-weight: 400;
                color: aliceblue;
            }

            .refresh-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                border-radius: 20px;
                padding: 6px 16px;
                color: white;
                font-size: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);

                &:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
                }

                &:active:not(:disabled) {
                    transform: translateY(0);
                }

                &:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }

                .loading-icon {
                    animation: pulse 1.5s infinite;
                }
            }
        }

        .stella {
            width: inherit;
            height: 265.43px;
            cursor: pointer;

            .iris {
                width: inherit;
                display: flex;
                height: 90px;

                .iris-one {
                    margin: 5px 0 5px 10px;
                    flex: 50%;
                    border-radius: 10px;
                    overflow: hidden;

                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: transform 0.3s ease;

                        &:hover {
                            transform: scale(1.2);
                        }
                    }
                }

                .iris-two {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    flex: 50%;

                    p:first-child {
                        width: 100px;
                        height: auto;
                        white-space: nowrap;
                        /* 不换行 */
                        overflow: hidden;
                        /* 隐藏超出部分 */
                        text-overflow: ellipsis; //显示省略号
                        color: gray;
                    }

                    .ellipsis {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        max-width: 150px;
                        /* 根据实际需求调整 */
                    }

                    p:last-child {
                        font-size: 13px;
                        color: gray;
                    }

                    p {
                        transition: color 0.3s ease;
                    }

                    &:hover p {
                        color: #1e90ff;
                    }

                }
            }
        }
    }

    // 添加脉冲动画
    @keyframes pulse {

        0%,
        100% {
            opacity: 1;
        }

        50% {
            opacity: 0.5;
        }
    }
</style>