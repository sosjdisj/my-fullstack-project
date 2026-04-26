<template>
    <div class="article-container">
        <div class="left-space" v-for="(item, index) in articleList" :key="index" @click="handTo(item)"
            :ref="el => articleArr[index] = (el as HTMLElement | null)">

            <div class="space-left">
                <div class="category-tag">{{ item.category }}</div>
                <img v-lazy="item.cover" alt="cover">
                <div class="img-overlay"></div>
            </div>

            <div class="space-right">
                <h2 class="right-h2">{{ item.title }}</h2>
                <p class="description">{{ item.content }}</p>

                <div class="right-Echo">
                    <span class="label">标签：</span>
                    <p class="tag-wrapper">
                        <span class="Echo-span"># {{ item.tag }}</span>
                    </p>
                </div>

                <div class="space-div">
                    <span><i class="icon">📅</i> {{ formatDate(item.published) }}</span>
                    <span><i class="icon">🕒</i> {{ formatDate(item.updated) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>


<script lang="ts" setup>
    import type { Article } from '@/types/index'
    import { useRouter } from 'vue-router';
    import { ref, watch, nextTick } from 'vue'
    import { ScrollTrigger } from 'gsap/ScrollTrigger'
    import { gsap } from 'gsap'
    import { formatDate } from '@/utils/helpers'

    const props = defineProps<{
        articleList: Article[]
    }>()

    const articleArr = ref<(HTMLElement | null)[]>([])
    const router = useRouter()
    const handTo = (item: Article) => {
        router.push({
            path: `/articleDetail/${item._id}`,
            query: {
                id: item._id
            }
        })
    }
    gsap.registerPlugin(ScrollTrigger)

    const initGSAPAnimation = async () => {

        await nextTick()

        articleArr.value.forEach(item => {
            if (item) {
                gsap.to(item,
                    {
                        y: -80,
                        opacity: 1,
                        scrollTrigger: {
                            trigger: item,
                            start: "top 83%",
                            end: "bottom 20%",
                            // markers: true,
                        }
                    }
                )
            }
        })
    }

    watch(() => props.articleList, (newList) => {
        if (newList.length > 0) {
            initGSAPAnimation()
        }
    },
        { immediate: true }
    )
</script>

<style lang="less" scoped>
    .article-container {
        width: 850px;
        padding: 20px;
        perspective: 1000px; // 为3D效果做准备
    }

    .left-space {
        width: 100%;
        max-width: 900px;
        height: 300px;
        display: flex;
        margin: 0 auto 40px;
        position: relative;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);

        // 玻璃拟态核心样式
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 20px;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        overflow: hidden;
        opacity: 0; // 配合 GSAP

        &:hover {
            transform: translateY(-10px) scale(1.02);
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 15px 45px rgba(0, 0, 0, 0.5);

            .space-left img {
                transform: scale(1.1);
            }
        }

        &:nth-child(even) {
            flex-direction: row-reverse;
        }

        .space-left {
            flex: 0 0 45%;
            position: relative;
            overflow: hidden;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.6s ease;
            }

            .img-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(to right, rgba(0, 0, 0, 0.3), transparent);
            }

            .category-tag {
                position: absolute;
                top: 0;
                left: 0;
                z-index: 2;
                padding: 8px 15px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(15px) saturate(160%);
                -webkit-backdrop-filter: blur(15px) saturate(160%);

                /* 关键：给边缘加一道“亮线”，模拟玻璃切面 */
                border-right: 1px solid rgba(255, 255, 255, 0.2);
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);

                /* 字体改用纯净的白色，加一点字间距提升高级感 */
                color: #ffffff;
                font-size: 12px;
                font-weight: 500;
                letter-spacing: 1.5px;

                border-bottom-right-radius: 15px;

                /* 微弱的投影，增加悬浮层次感 */
                box-shadow: 4px 4px 15px rgba(0, 0, 0, 0.1);
                border-bottom-right-radius: 15px;
            }

            &:nth-child(odd) {
                left: auto;
                right: 0;
                border-bottom-right-radius: 0;
                border-bottom-left-radius: 15px;
            }
        }

        .space-right {
            flex: 1;
            padding: 30px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            color: #fff;

            .right-h2 {
                font-size: 1.5rem;
                margin: 0;
                background: linear-gradient(120deg, #fff 0%, #a0c4ff 100%);
                background-clip: text;
                -webkit-text-fill-color: transparent;
                transition: 0.3s;
            }

            .description {
                color: rgba(255, 255, 255, 0.6);
                font-size: 14px;
                line-height: 1.6;
                margin: 10px 0;

                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 400px;
            }

            .right-Echo {
                display: flex;
                align-items: center;
                gap: 10px;

                .label {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .tag-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(30, 144, 255, 0.15);
                    border: 1px solid rgba(30, 144, 255, 0.3);
                    padding: 2px 12px;
                    border-radius: 20px;

                    .Echo-span {
                        color: #4facfe;
                        font-size: 12px;
                    }
                }
            }

            .space-div {
                display: flex;
                gap: 20px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.4);
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                padding-top: 15px;
            }
        }
    }
</style>
