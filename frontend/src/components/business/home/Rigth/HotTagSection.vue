<template>
    <div class="tag-cloud-card">
        <div class="header">
            <el-icon class="title-icon">
                <PriceTag />
            </el-icon>
            <h3>热门标签</h3>
        </div>

        <div class="tags-wrapper">
            <div class="tag-item" v-for="(value, index) in tagsList" :key="index" @click="handgoPath(value)">
                <span class="hash">#</span>
                <span class="tag-name">{{ value.name }}</span>
            </div>

            <div class="deco-glow blue"></div>
            <div class="deco-glow purple"></div>
            <div class="deco-glow yellow"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import { get } from '@/api/request'
    import { useRouter } from 'vue-router';
    import type { TabCategoryItem } from '@/types/index'
    import { PriceTag } from '@element-plus/icons-vue'

    const tagsList = ref<TabCategoryItem[]>([])
    const router = useRouter()

    const handgoPath = (value: TabCategoryItem) => {
        router.push({
            path: `/articleListBytabs/${value._id}`,
            query: {
                title: value.name,
                desc: value.desc,
                articleCount: value.articleCount,
                path: 'tags'
            }
        })
    }
    onMounted(async () => {
        const tags = await get('/tags')
        tagsList.value = tags.data.data.list
    })
</script>

<style lang="less" scoped>
    .tag-cloud-card {
        width: 100%;
        min-height: 260px;
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        position: relative;
        overflow: hidden; // 裁剪背景光球

        .header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            padding-left: 10px;

            .title-icon {
                color: #409EFF;
                font-size: 20px;
            }

            h3 {
                font-size: 18px;
                font-weight: 500;
                color: #fff;
                margin: 0;
                letter-spacing: 1px;
            }
        }

        .tags-wrapper {
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            justify-content: flex-start;
            position: relative;
            z-index: 1;

            .tag-item {
                display: flex;
                align-items: center;
                padding: 6px 16px;
                border-radius: 50px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                cursor: pointer;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

                .hash {
                    color: #409EFF;
                    font-weight: bold;
                    margin-right: 6px;
                    font-size: 14px;
                }

                .tag-name {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 13px;
                }

                &:hover {
                    background: rgba(64, 158, 255, 0.2);
                    border-color: #409EFF;
                    transform: translateY(-5px) scale(1.05);
                    box-shadow: 0 10px 20px rgba(64, 158, 255, 0.2);

                    .tag-name {
                        color: #fff;
                    }
                }
            }
        }

        /* --- 背景流光装饰 --- */
        .deco-glow {
            position: absolute;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            filter: blur(40px);
            opacity: 0.2;
            z-index: 0;
            pointer-events: none; // 不干扰鼠标点击
        }

        .blue {
            background: #409EFF;
            top: -20px;
            right: -20px;
            animation: moveGlow 8s infinite alternate;
        }

        .purple {
            background: #a062ff;
            bottom: -30px;
            left: -10px;
            animation: moveGlow 12s infinite alternate-reverse;
        }

        .yellow {
            background: #ffcc00;
            top: 40%;
            right: 20%;
            width: 60px;
            height: 60px;
            animation: moveGlow 6s infinite alternate;
        }
    }

    @keyframes moveGlow {
        from {
            transform: translate(0, 0);
        }

        to {
            transform: translate(30px, 40px);
        }
    }
</style>