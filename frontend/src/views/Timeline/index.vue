<template>
    <div class="timeline">

        <div class="cenct-img">
            <transition name="page" mode="out-in">
                <img :key="currentBgImage || defaultBgImage" :src="currentBgImage || defaultBgImage" alt="">
            </transition>
            <div class="vignette"></div>
        </div>

        <div class="timeline-cenct">
            <div class="outside" ref="outside">
                <div class="lnside">
                    <div class="sticky-header">
                        <h2 class="lnside-h2">2025</h2>
                    </div>

                    <div class="flex">
                        <div class="main-line"></div>

                        <div v-for="(item, index) in timelienList" :key="item._id" @click="handArticleData(item._id)"
                            class="timeline-item" :style="{ '--hue': (index * 60) % 360 + 'deg' }">

                            <div class="lnside-div">
                                <div class="box">
                                    <div class="glass-card" :ref="el => setContainerRef(el as HTMLElement, index)">
                                        <div class="img-container">
                                            <img v-lazy="item.cover" alt="" class="imgdiv-img">
                                            <div class="card-glow"></div>
                                        </div>
                                        <div class="content-body">
                                            <p class="content-text">{{ item.title }}</p>
                                        </div>
                                    </div>
                                </div>

                                <div class="time-marker">
                                    <div class="dot-outer">
                                        <div class="dot-inner"></div>
                                    </div>
                                    <h2 class="div-h2">{{ formatDate(item.published) }}</h2>
                                </div>
                            </div>
                        </div>

                        <InfiniteScrollContainer 
                            :is-finished="isFinished"
                            :load-more="loadMore"
                        />

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, onUnmounted } from 'vue'
    import { useTimeline } from './useTimeline'
    import { formatDate } from '@/utils/helpers'
    import InfiniteScrollContainer from '@/components/business/InfiniteScrollContainer.vue'

    const { currentBgImage, timelienList, isFinished, defaultBgImage,
        setContainerRef, initTimeline, cleanup, handArticleData, loadMore
    } = useTimeline()

    onMounted(async () => {
        await initTimeline()
    })

    onUnmounted(() => {
        cleanup()
    })
</script>

<style lang="less" scoped>

    .page-bg-enter-active,
    .page-bg-leave-active {
        transition: opacity 0.4s ease;
    }

    .page-bg-enter-from,
    .page-bg-leave-to {
        opacity: 0;
    }

    .timeline {
        width: 100%;
        min-height: 100vh;
        background: #0f1014; // 深色基调能让玻璃感更高级
        overflow-x: hidden;

        .cenct-img {
            width: 100%;
            height: 100vh;
            position: fixed;
            z-index: 0;

            img {
                width: 100%;
                height: 120%;
                object-fit: cover;
                filter: blur(4px) brightness(0.5);
            }

            .vignette {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle, transparent 20%, rgba(0, 0, 0, 0.8) 100%);
            }
        }

        .timeline-cenct {
            position: relative;
            z-index: 1;
            padding-bottom: 200px;

            .lnside {
                width: 100%;

                .sticky-header {
                    position: sticky;
                    top: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 100px;
                    z-index: 100;

                    .lnside-h2 {
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(20px);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        padding: 10px 60px;
                        border-radius: 40px;
                        color: #fff;
                        font-weight: 200;
                        letter-spacing: 12px;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                    }
                }

                .flex {
                    padding-top: 5%;
                    position: relative;

                    .main-line {
                        position: absolute;
                        left: 50%;
                        width: 2px;
                        height: 100%;
                        background: linear-gradient(to bottom,
                                transparent,
                                rgba(255, 255, 255, 0.2) 5%,
                                rgba(255, 255, 255, 0.2) 95%,
                                transparent);
                        transform: translateX(-50%);
                    }

                    .timeline-item {
                        margin-bottom: 220px;
                        padding-top: 5%;
                        --node-color: hsl(var(--hue), 80%, 60%);

                        &:nth-child(even) {
                            .lnside-div {
                                flex-direction: row-reverse;
                            }
                        }

                        .lnside-div {
                            display: flex;
                            align-items: center;

                            .box {
                                flex: 1;
                                display: flex;
                                justify-content: center;
                                perspective: 1000px;

                                .glass-card {
                                    width: 85%;
                                    max-width: 420px;
                                    background: rgba(255, 255, 255, 0.03);
                                    backdrop-filter: blur(15px);
                                    border-radius: 24px;
                                    border: 1px solid rgba(255, 255, 255, 0.1);
                                    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
                                    overflow: hidden;

                                    &:hover {
                                        transform: translateY(-15px) rotateX(5deg);
                                        border-color: var(--node-color);
                                        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5),
                                            0 0 20px rgba(var(--hue), 0.2);

                                        .img-container .imgdiv-img {
                                            transform: scale(1.1);
                                        }

                                        .card-glow {
                                            opacity: 1;
                                        }
                                    }

                                    .img-container {
                                        position: relative;
                                        height: 240px;
                                        overflow: hidden;

                                        .imgdiv-img {
                                            width: 100%;
                                            height: 100%;
                                            object-fit: cover;
                                            transition: transform 0.8s ease;
                                        }

                                        .card-glow {
                                            position: absolute;
                                            top: 0;
                                            left: 0;
                                            width: 100%;
                                            height: 100%;
                                            background: radial-gradient(circle at center, transparent, var(--node-color));
                                            opacity: 0;
                                            mix-blend-mode: soft-light;
                                            transition: 0.5s;
                                        }
                                    }

                                    .content-body {
                                        padding: 25px;

                                        .content-text {
                                            color: #e0e0e0;
                                            font-size: 1.1rem;
                                            line-height: 1.7;
                                            margin: 0;
                                        }
                                    }
                                }
                            }

                            .time-marker {
                                width: 120px;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                gap: 15px;

                                .dot-outer {
                                    width: 24px;
                                    height: 24px;
                                    border-radius: 50%;
                                    background: rgba(255, 255, 255, 0.1);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    border: 1px solid rgba(255, 255, 255, 0.2);

                                    .dot-inner {
                                        width: 8px;
                                        height: 8px;
                                        border-radius: 50%;
                                        background: var(--node-color);
                                        box-shadow: 0 0 15px var(--node-color);
                                    }
                                }

                                .div-h2 {
                                    color: var(--node-color);
                                    font-size: 1.2rem;
                                    font-family: 'Orbitron', sans-serif; // 如果有这类字体会很酷
                                    filter: brightness(1.2);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
</style>