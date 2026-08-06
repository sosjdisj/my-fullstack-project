<template>
    <div class="banner-section" @mouseenter="stopAutoPlay" @mouseleave="startAutoPlay">
        <div class="banner-container">
            <div v-for="(item, index) in slide" :key="item.id" class="banner-item"
                :class="{ active: index === currentIndex }">
                <img :src="item.image" alt="" />
                <div class="banner-mask"></div>
                <div class="banner-content">
                    <h2>{{ item.title }}</h2>
                    <p>{{ item.description }}</p>
                </div>
            </div>

            <button class="banner-btn prev-btn" @click="prevSlide" v-if="slide && slide.length > 1">
                <span class="icon">‹</span>
            </button>
            <button class="banner-btn next-btn" @click="nextSlide" v-if="slide && slide.length > 1">
                <span class="icon">›</span>
            </button>
        </div>

        <div class="banner-dots">
            <span v-for="(_, index) in slide" :key="index" class="dot" :class="{ active: index === currentIndex }"
                @click="goToSlide(index)"></span>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { ref, onMounted, onUnmounted } from 'vue'
    import type { MusicRecommendation } from '@/types'

    let intervalId: number | null = null
    const slide = ref<MusicRecommendation[]>([])
    const currentIndex = ref(0)

    // 自动播放
    const startAutoPlay = () => {
        intervalId = setInterval(() => {
            nextSlide()
        }, 3000)
    }
    // 停止自动播放
    const stopAutoPlay = () => {
        if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
        }
    }
    const nextSlide = () => {
        if (slide.value && slide.value.length > 0) {
            currentIndex.value = (currentIndex.value + 1) % slide.value.length
        }
    }

    const prevSlide = () => {
        if (slide.value && slide.value.length > 0) {
            currentIndex.value = currentIndex.value === 0 ? slide.value.length - 1 : currentIndex.value - 1
        }
    }
    const goToSlide = (index: number) => {
        currentIndex.value = index
    }

    onMounted(async () => {
        // const result = await get('/carousel')
        // if (result) {
        slide.value = [
            {
                id: 1,
                image: "/images/1.webp",
                title: "热门推荐",
                description: "为你精心挑选的音乐",
                alt: "热门推荐1"
            },
            {
                id: 2,
                image: "/images/3.jpeg",
                title: "新歌速递",
                description: "最新最热的音乐作品",
                alt: "热门推荐2"
            },
            {
                id: 3,
                image: "/images/4.jpeg",
                title: "经典老歌",
                description: "永恒不变的音乐经典",
                alt: "热门推荐3"
            }
        ]
        //     }
        //     startAutoPlay()
    })
    onUnmounted(() => {
        stopAutoPlay()
    })
</script>

<style lang="less" scoped>
    @glass-border: rgba(255, 255, 255, 0.5);
    @accent-color: #667eea;

    // 轮播图区域
    .banner-section {
        margin-bottom: 50px;

        .banner-container {
            position: relative;
            height: 400px;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            border: 1px solid @glass-border;

            &:hover {
                .banner-btn {
                    opacity: 1;
                    transform: translateY(-50%) scale(1);
                }
            }

            .banner-item {
                position: absolute;
                inset: 0;
                opacity: 0;
                transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 1;

                &.active {
                    opacity: 1;
                    z-index: 2;

                    .banner-content {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transform: scale(1.02); // 保持一点点缩放感
                }

                .banner-mask {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to right, rgba(0, 0, 0, 0.5) 0%, transparent 60%),
                        linear-gradient(to top, rgba(0, 0, 0, 0.3) 0%, transparent 40%);
                }

                .banner-content {
                    position: absolute;
                    bottom: 60px;
                    left: 60px;
                    color: white;
                    max-width: 500px;
                    transform: translateX(-30px);
                    opacity: 0;
                    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s; // 延迟入场

                    h2 {
                        font-size: 42px;
                        font-weight: 800;
                        margin-bottom: 15px;
                        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                    }

                    p {
                        font-size: 18px;
                        opacity: 0.85;
                        line-height: 1.6;
                        padding-left: 15px;
                        border-left: 3px solid @accent-color;
                    }
                }
            }

            .banner-btn {
                position: absolute;
                top: 50%;
                transform: translateY(-50%) scale(0.8);
                width: 44px;
                height: 44px;
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                color: white;
                font-size: 24px;
                cursor: pointer;
                z-index: 10;
                opacity: 0;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;

                &:hover {
                    background: rgba(255, 255, 255, 0.4);
                    box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
                }

                &.prev-btn {
                    left: 20px;
                }

                &.next-btn {
                    right: 20px;
                }
            }
        }

        .banner-dots {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 20px;

            .dot {
                width: 20px;
                height: 4px;
                border-radius: 2px;
                background: rgba(0, 0, 0, 0.1);
                cursor: pointer;
                transition: all 0.3s;

                &.active {
                    width: 40px;
                    background: @accent-color;
                    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
                }
            }
        }
    }
</style>