<template>
    <div class="right-one-card" v-if="LoginStatus">
        <div class="header-section">
            <img src="/src/assets/1.webp" alt="" class="backgroundImg">
            <div class="overlay"></div>

            <div class="avatar-wrapper">
                <div class="top-avatar">
                    <img src="" alt="">
                </div>
            </div>

            <h2 class="user-name">{{ store.username }}</h2>
            <p class="img-p">{{ store.signature }}</p>
        </div>

        <!-- 人性的背后是白云苍狗，愿你我都能做生活的高手 -->

        <div class="data-section">
            <div class="data-item">
                <span class="num">0</span>
                <span class="label">文章</span>
            </div>
            <div class="divider"></div>
            <div class="data-item">
                <span class="num">0</span> <span class="label">分类</span>
            </div>
            <div class="divider"></div>
            <div class="data-item">
                <span class="num">0</span>
                <span class="label">访问</span>
            </div>
        </div>

        <div v-if="isNotFullProfile" class="bottom-action">
            <button class="follow-btn" @click="router.push('/fullProfile')">个人主页</button>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { inject, computed } from 'vue'
    import { useRouter } from 'vue-router'
    import type { Article } from '@/types/index'
    import { useCounterStore } from '@/stores/counter'
    import { useRoute } from 'vue-router'

    const route = useRoute()

    const articleList = inject('ARTICLELIST', [] as Article[])
    const store = useCounterStore()
    const router = useRouter()
    const LoginStatus = computed(() => store.username)

    const isNotFullProfile = computed(() => route.path !== '/fullProfile')
</script>

<style lang="less" scoped>
    .right-one-card {
        width: 100%;
        height: auto;
        min-height: 320px;
        border-radius: 20px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(15px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        // 初始透明度改为 1 配合全局动画，或者保持你的 0
        opacity: 1;

        &:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
            border-color: rgba(64, 158, 255, 0.3);
        }

        .header-section {
            width: 100%;
            height: 250px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            gap: 12px;

            .backgroundImg {
                width: 100%;
                height: 100%;
                position: absolute;
                top: 0;
                left: 0;
                object-fit: cover;
                z-index: -2;
            }

            .overlay {
                width: 100%;
                height: 100%;
                position: absolute;
                top: 0;
                left: 0;
                background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.7));
                z-index: -1;
            }

            .avatar-wrapper {
                padding: 4px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                backdrop-filter: blur(5px);
                transition: all 0.5s ease;

                .top-avatar {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background-color: #eee;
                    background-size: cover;
                    background-position: center;
                    border: 2px solid #fff;
                    transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    overflow: hidden;

                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                }

                &:hover .top-avatar {
                    transform: rotate(360deg) scale(1.1);
                }
            }

            .user-name {
                font-size: 20px;
                font-weight: 600;
                color: #fff;
                margin: 0;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
            }

            .img-p {
                font-size: 13px;
                color: rgba(255, 255, 255, 0.7);
                padding: 0 20px;
                text-align: center;
                line-height: 1.5;
            }
        }

        .data-section {
            display: flex;
            align-items: center;
            padding: 20px 0;
            background: rgba(255, 255, 255, 0.03);

            .data-item {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;

                .num {
                    color: #409EFF;
                    font-size: 18px;
                    font-weight: 600;
                }

                .label {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 12px;
                }
            }

            .divider {
                width: 1px;
                height: 30px;
                background: rgba(255, 255, 255, 0.1);
            }
        }

        .bottom-action {
            padding: 20px;
            display: flex;
            justify-content: center;

            .follow-btn {
                width: 80%;
                padding: 10px 0;
                border: none;
                border-radius: 12px;
                background: linear-gradient(45deg, #409EFF, #0077ff);
                color: white;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);

                &:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 20px rgba(64, 158, 255, 0.5);
                }
            }
        }
    }
</style>
