<template>
    <div class="interaction-container">
        <div class="action-board">
            <div class="egg-wrapper">
                <div class="popover-box">
                    <span class="p-text">点个赞心情会变好哦！</span>
                </div>
                <div class="trigger-btn">ヾ(≧▽≦*)o</div>
            </div>

            <div class="btn-group">
                <div class="action-item" :class="{ 'is-active': isLiked }" @click="handtoggleLike">
                    <i :class="isLiked ? 'fa-solid fa-thumbs-up' : 'fa-regular fa-thumbs-up'"></i>
                    <span class="count">{{ likes }}</span>
                </div>

                <div class="action-item" :class="{ 'is-active': isCollected }" @click="handtoggleCollect">
                    <el-icon :size="20">
                        <Star v-show="!isCollected" />
                        <StarFilled v-show="isCollected" />
                    </el-icon>
                    <span class="count">{{ collects }}</span>
                </div>

                <div class="action-item share" @click="handleShareClick">
                    <i class="fa-solid fa-share-nodes"></i>
                    <span>分享</span>
                </div>
            </div>
        </div>

        <div class="neighbor-nav">
            <div v-if="leftArticle" class="nav-card prev" @click="handLeft">
                <span class="dir">PREVIOUS</span>
                <p class="title">{{ leftArticle }}</p>
            </div>
            <div v-else class="nav-card placeholder"></div>

            <div v-if="rightArticle" class="nav-card next" @click="handRigth">
                <span class="dir">NEXT</span>
                <p class="title">{{ rightArticle }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { Star, StarFilled } from '@element-plus/icons-vue'
    import { ref, computed, onMounted } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import type { Article, ArticleNeighbor } from '@/types/index'
    import { Delete, post } from '@/api/request'
    import { ElMessage } from 'element-plus'

    const route = useRoute()
    const isCollected = ref(false)
    const isLiked = ref(false)
    const isPostLike = ref<boolean>(true)//点赞状态判断
    const isPostCollects = ref<boolean>(true)//收藏状态判断
    const router = useRouter()
    const props = defineProps<{
        articleData: Article,
        prev?: ArticleNeighbor,
        next?: ArticleNeighbor,
    }>()
    const emit = defineEmits(['updateLike', 'updateCollects'])

    // 使用计算属性，确保始终从 props 获取最新值
    const likes = computed(() => props.articleData.likes)
    const collects = computed(() => props.articleData.collects)

    const interactionEndpoints = {
        like: `/article/likes`,
        collects: `/article/collects`
    }

    const leftArticle = computed(() => {
        if (props.next) {
            return props.next.title
        }
        return;
    })
    const rightArticle = computed(() => {
        if (props.prev) {
            return props.prev.title
        }
        return;
    })
    const handtoggleLike = async () => {

        if (!isPostLike.value) return ElMessage.warning('点太快啦，给系统一点反应时间哦～')

        try {
            isPostLike.value = false

            const isCurrentlyLiked = isLiked.value
            const actionText = isCurrentlyLiked ? '取消点赞' : '点赞'

            // 根据状态调用不同方法
            const apiCall = isCurrentlyLiked
                ? Delete(`${interactionEndpoints.like}/${props.articleData._id}`)
                : post(interactionEndpoints.like, { id: props.articleData._id })

            const result = await apiCall

            if (result.success) {
                const { updatedLikes, status } = result.data.data
                const newIsLiked = !isCurrentlyLiked
                isLiked.value = newIsLiked
                emit('updateLike', updatedLikes, newIsLiked)

                const message = result.message || `${actionText}成功`
                ElMessage[status === 'like' ? 'success' : 'info'](message)
            }
        } catch (error) {
            ElMessage.error('操作失败，请稍后重试～')
            console.error('Toggle like error:', error)
        } finally {
            isPostLike.value = true
        }
    }
    const handtoggleCollect = async () => {

        if (!isPostCollects.value) return ElMessage.warning('点太快啦，给系统一点反应时间哦～')

        try {
            isPostCollects.value = false

            const isCurrentlyCollects = isCollected.value
            const actionText = isCurrentlyCollects ? '取消收藏' : '收藏'

            // 根据状态调用不同方法
            const apiCall = isCurrentlyCollects
                ? Delete(`${interactionEndpoints.collects}/${props.articleData._id}`)
                : post(interactionEndpoints.collects, { id: props.articleData._id })

            const result = await apiCall

            if (result.success) {
                const { updatedCollects, status } = result.data.data
                const newIsCollected = !isCurrentlyCollects
                isCollected.value = newIsCollected
                emit('updateCollects', updatedCollects, newIsCollected)

                const message = result.message || `${actionText}成功`
                ElMessage[status === 'collect' ? 'success' : 'info'](message)
            }
        } catch (error) {
            ElMessage.error('操作失败，请稍后重试～')
            console.error('Toggle like error:', error)
        } finally {
            isPostCollects.value = true
        }
    }
    const handleShareClick = async () => {
        const textToCopy = route.path

        await navigator.clipboard.writeText(textToCopy)
        ElMessage.success('复制成功~')
    }
    const handLeft = () => {

        if (props.next?._id) {
            router.push({
                path: `/articleDetail/${props.next._id}`,
                query: {
                    id: String(props.next._id)
                }
            })
        }
    }
    const handRigth = () => {

        if (props.prev?._id) {
            router.push({
                path: `/articleDetail/${props.prev._id}`,
                query: {
                    id: String(props.prev._id)
                }
            })
        }
    }

    onMounted(() => {
        isLiked.value = props.articleData.isLiked
        isCollected.value = props.articleData.isCollected
    })
</script>

<style lang="less" scoped>
    @accent-blue: #00e5ff;
    @glass-bg: rgba(255, 255, 255, 0.05);
    @glass-border: rgba(255, 255, 255, 0.1);

    .interaction-container {
        width: 94%;
        max-width: 920px;
        margin: 40px auto;
        display: flex;
        flex-direction: column;
        gap: 30px;
    }

    .action-board {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        padding: 30px;
        background: @glass-bg;
        border: 1px solid @glass-border;
        border-radius: 24px;
        backdrop-filter: blur(10px);

        /* 颜文字悬浮框 */
        .egg-wrapper {
            position: relative;

            .trigger-btn {
                background: #f39c12; // 更有活力的橙色
                color: #fff;
                padding: 6px 20px;
                border-radius: 100px;
                font-size: 14px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s;

                &:hover {
                    transform: scale(1.1);
                    background: #e67e22;
                }
            }

            .popover-box {
                position: absolute;
                bottom: 140%;
                left: 50%;
                transform: translateX(-50%) translateY(10px);
                width: 160px;
                padding: 12px;
                background: rgba(40, 40, 45, 0.95);
                border: 1px solid @glass-border;
                border-radius: 12px;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                text-align: center;
                font-size: 12px;
                color: #fff;
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);

                &::after {
                    // 小箭头
                    content: '';
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    margin-left: -6px;
                    border: 6px solid transparent;
                    border-top-color: rgba(40, 40, 45, 0.95);
                }
            }

            &:hover .popover-box {
                opacity: 1;
                visibility: visible;
                transform: translateX(-50%) translateY(0);
            }
        }

        .btn-group {
            display: flex;
            gap: 15px;

            .action-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 22px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid @glass-border;
                border-radius: 12px;
                color: #b0b0b0;
                cursor: pointer;
                transition: all 0.3s;

                .count {
                    font-weight: 600;
                    font-size: 15px;
                }

                &:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                    transform: translateY(-2px);
                }

                &.is-active {
                    color: @accent-blue;
                    background: rgba(0, 229, 255, 0.1);
                    border-color: @accent-blue;
                    box-shadow: 0 0 15px rgba(0, 229, 255, 0.2);
                }

                &.share:active {
                    transform: scale(0.95);
                }
            }
        }
    }

    /* 翻页导航 */
    .neighbor-nav {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;

        .nav-card {
            padding: 20px;
            background: @glass-bg;
            border: 1px solid @glass-border;
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            flex-direction: column;
            gap: 8px;

            .dir {
                font-size: 10px;
                letter-spacing: 2px;
                color: @accent-blue;
                opacity: 0.7;
            }

            .title {
                margin: 0;
                font-size: 14px;
                color: #e2e8f0;
                font-weight: 500;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            &:hover {
                background: rgba(255, 255, 255, 0.08);
                border-color: @accent-blue;
                transform: translateY(-3px);
            }

            &.next {
                align-items: flex-end;

                .title {
                    text-align: right;
                }
            }

            &.placeholder {
                background: transparent;
                border: none;
                cursor: default;
            }
        }
    }

    @media (max-width: 600px) {
        .neighbor-nav {
            grid-template-columns: 1fr;
        }

        .btn-group {
            flex-direction: column;
            width: 100%;

            .action-item {
                justify-content: center;
            }
        }
    }
</style>