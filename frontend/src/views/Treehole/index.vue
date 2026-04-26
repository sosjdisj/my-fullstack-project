<template>
    <div class="Treehole">
        <div class="danmu" ref="danmu">
            <danmaku :danmus="allDanmus" :channels="4" :speeds="100" :fontSize="18" :loop="false" :randomChannel="true"
                is-suspend style="height: 100%; width: 100%;" use-slot enter>

                <template v-slot:dm="{ danmu }">
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
            </danmaku>
        </div>

        <div class="danmaku-container">
            <div class="glass-card">
                <h1>树洞</h1>
                <form @submit.prevent="handleTreehole" class="input-group">
                    <input type="text" class="danmaku-input" placeholder="在这里留下自己的足迹吧..." @focus="handleFocus"
                        v-model="content">
                    <button v-if="isShow" class="danmaku-button">提交</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, onUnmounted } from 'vue'
    import Danmaku from 'vue3-danmaku'
    import { useTreehole } from './useTreehole'

    const { isShow, allDanmus, content, handleFocus, handleTreehole, initTreehole, clearIntervalTimer } = useTreehole()

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
        background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('/src/ass/【哲风壁纸】8k-个性背景.png');
        background-size: cover;
        background-position: center;
        overflow: hidden;

        .danmu {
            margin-top: 60px;
            width: 100%;
            height: 320px;
            z-index: 2;

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
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.3);
                        border: 1px solid rgba(255, 255, 255, 0.4);
                        backdrop-filter: blur(5px);
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

                        img {
                            width: 100%;
                            height: 100%;
                            overflow: hidden;
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
                        height: 40px;
                        padding: 0 25px;
                        border-radius: 20px;
                        border: none;
                        background: #409EFF;
                        color: white;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;

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
