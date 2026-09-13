<template>
    <div class="Treehole">
        <div class="danmu" ref="danmu" @mouseover="handleDanmuOver" @mouseout="handleDanmuOut">
            <vue-danmaku :ref="setDanmakuRef" :danmus="allDanmus" :channels="4" :speeds="100" :loop="false"
                :randomChannel="true" :performanceMode="false" style="height: 100%; width: 100%;">

                <template #danmu="{ danmu }">
                    <div class="usertext">
                        <div class="content-wrapper">
                            <div class="avatar">
                                <img :src="danmu.avatar" alt="头像">
                            </div>
                            <div class="text">
                                <span>{{ danmu.text }}</span>
                            </div>
                        </div>
                        <div class="bottom-line"></div>
                    </div>
                </template>
            </vue-danmaku>
        </div>

        <div class="danmaku-container">
            <div class="glass-card">
                <h1>树洞</h1>
                <form @submit.prevent="handleTreehole" class="input-group">
                    <input type="text" class="danmaku-input" placeholder="在这里留下自己的足迹吧..." @focus="handleFocus"
                        v-model="content">
                    <button class="danmaku-button" :class="{ show: isShow }" :disabled="isSubmitting">
                        <GlassSpinner v-if="isSubmitting" />
                        <span v-else>提交</span>
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    // Vue/Vue Router/Pinia API 由 unplugin-auto-import 全局注入
    import vueDanmaku from 'vue-danmaku'
    import GlassSpinner from '@/components/ui/GlassSpinner.vue'
    import { useTreehole } from './useTreehole'

    const { isShow, isSubmitting, allDanmus, content, setDanmakuRef,
        handleFocus, handleTreehole, initTreehole, clearIntervalTimer,
        handleDanmuOver, handleDanmuOut
    } = useTreehole()

    onMounted(() => {
        initTreehole()
    })
    onUnmounted(() => {
        clearIntervalTimer()
    })
</script>

<style lang="less" scoped>

    // 1. 定义动画
    @keyframes floating {

        0%,
        100% {
            transform: translateY(0);
        }

        50% {
            transform: translateY(-10px);
        }
    }

    @keyframes shine {
        from {
            left: -150%;
        }

        to {
            left: 150%;
        }
    }

    .Treehole {
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        // 增加深色渐变叠加，让玻璃感更强
        background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('../../assets/5.jpg');
        background-size: cover;
        background-position: center;
        overflow: hidden;

        .danmu {
            margin-top: 60px;
            width: 100%;
            height: 320px;
            z-index: 2;

            // 悬停冻结单条弹幕；置顶让后方同轨道弹幕从其下方穿过
            :deep(.dm.dm-pause) {
                animation-play-state: paused !important;
                z-index: 10 !important;
            }

            .usertext {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 5px;
                cursor: pointer;
                // 弹幕上下浮动动画
                animation: floating 4s ease-in-out infinite;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

                &:hover {
                    animation-play-state: paused;
                    transform: scale(1.1);
                    z-index: 100;
                }

                .content-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 12px;

                    .avatar {
                        width: 45px;
                        height: 45px;
                        box-sizing: content-box;
                        border-radius: 50%;
                        overflow: hidden;
                        background: rgba(255, 255, 255, 0.3);
                        border: 1px solid rgba(255, 255, 255, 0.4);
                        backdrop-filter: blur(5px);
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

                        img {
                            display: block;
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                        }
                    }

                    .text {
                        min-height: 42px;
                        display: flex;
                        align-items: center;
                        padding: 0 18px;
                        border-radius: 20px;
                        // 核心玻璃材质
                        background: rgba(255, 255, 255, 0.15);
                        backdrop-filter: blur(12px);
                        -webkit-backdrop-filter: blur(12px);
                        border: 1px solid rgba(255, 255, 255, 0.25);
                        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
                        color: #ffffff;
                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

                        span {
                            font-size: 15px;
                            font-weight: 400;
                            white-space: nowrap;
                        }
                    }
                }

                .bottom-line {
                    margin-top: 6px;
                    width: 0;
                    height: 3px;
                    border-radius: 2px;
                    background: linear-gradient(90deg, transparent, #409EFF, transparent);
                    transition: width 0.4s ease;
                }

                &:hover>.bottom-line {
                    width: 70%;
                }
            }
        }

        .danmaku-container {
            margin-top: 50px;
            width: 100%;
            display: flex;
            justify-content: center;
            z-index: 3;

            .glass-card {
                position: relative;
                padding: 40px 60px;
                border-radius: 30px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
                overflow: hidden; // 剪裁流光
                display: flex;
                flex-direction: column;
                align-items: center;

                // 流光动效
                &::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: -150%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                    animation: shine 6s infinite;
                }

                h1 {
                    color: #fff;
                    font-size: 32px;
                    font-weight: 300;
                    letter-spacing: 10px;
                    margin-bottom: 30px;
                    text-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                }

                .input-group {
                    display: flex;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 30px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    padding: 5px;
                    transition: all 0.3s ease;

                    &:focus-within {
                        border-color: rgba(64, 158, 255, 0.8);
                        box-shadow: 0 0 15px rgba(64, 158, 255, 0.2);
                    }

                    .danmaku-input {
                        width: 280px;
                        height: 40px;
                        box-sizing: content-box;
                        background: transparent;
                        border: none;
                        outline: none;
                        color: #fff;
                        padding: 0 20px;
                        font-size: 15px;

                        &::placeholder {
                            color: rgba(255, 255, 255, 0.5);
                        }
                    }

                    .danmaku-button {
                        // 常驻渲染：聚焦时从 0 宽度展开，让外层容器跟着平滑变宽
                        max-width: 0;
                        height: 40px;
                        padding: 0;
                        border-radius: 20px;
                        border: none;
                        background: #409EFF;
                        color: white;
                        font-weight: 600;
                        opacity: 0;
                        overflow: hidden;
                        white-space: nowrap;
                        cursor: pointer;
                        transition: max-width 0.3s ease, padding 0.3s ease, opacity 0.3s ease,
                            background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;

                        &.show {
                            max-width: 120px;
                            padding: 0 25px;
                            opacity: 1;
                        }

                        // 提交中展示加载动画
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;

                        &:disabled {
                            pointer-events: none;
                            opacity: 0.7;
                        }

                        &:hover {
                            background: #66b1ff;
                            box-shadow: 0 5px 15px rgba(64, 158, 255, 0.4);
                            transform: translateY(-2px);
                        }

                        &:active {
                            transform: translateY(0);
                        }
                    }
                }
            }
        }
    }
</style>
