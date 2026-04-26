<template>
    <div class="Avatar-box">
        <div class="Avatar-wrapper" v-if="picture">
            <div class="Avatar">
                <img :src="avatar" alt="头像">
            </div>
        </div>

        <div class="dropdown-container" v-if="picture">
            <div class="arrow-up"></div>
            <div class="Avatar-div">
                <div class="menu-item" @click="handRoute">
                    <el-icon>
                        <Setting />
                    </el-icon>
                    <span>个人设置</span>
                </div>
                <div class="menu-divider"></div>
                <div class="menu-item logout" @click="handLogout">
                    <el-icon>
                        <SwitchButton />
                    </el-icon>
                    <span>退出登录</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { Setting, SwitchButton } from '@element-plus/icons-vue'
    import { useRouter, useRoute } from 'vue-router'
    import { useCounterStore } from '@/stores/counter'
    import { computed } from 'vue'
    import { clearUser } from '@/utils/helpers'

    const props = defineProps<{
        picture: boolean
    }>()
    const router = useRouter()
    const route = useRoute()
    const store = useCounterStore()


    const avatar = computed(() => store.avatar ? store.avatar : '')
    const handRoute = () => {
        router.push('/setting')
    }

    const handLogout = async () => {
        if (route.path === '/setting') {
            router.push('/home')
        }
        // await post('/logout')
        clearUser()
    }
</script>

<style lang="less" scoped>
    .Avatar-box {
        position: relative;

        // 悬浮逻辑优化
        &:hover {
            .dropdown-container {
                opacity: 1;
                visibility: visible;
                transform: translateX(50%) translateY(0);
            }

            .Avatar-wrapper {
                box-shadow: 0 0 15px rgba(64, 158, 255, 0.4);
                border-color: rgba(64, 158, 255, 0.8);
            }
        }

        .Avatar-wrapper {
            cursor: pointer;
            height: 38px;
            width: 38px;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;

            .Avatar {
                height: 100%;
                width: 100%;
                background-size: cover;
                background-position: center;
                background-color: #333;

                img {
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    object-fit: cover;
                }
            }
        }

        .dropdown-container {
            position: absolute;
            top: 110%;
            right: 50%;
            transform: translateX(50%) translateY(10px); // 默认向下偏移，配合淡入
            opacity: 0;
            visibility: hidden;
            transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
            z-index: 100;
        }

        .arrow-up {
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-bottom: 8px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            margin: 0 auto;
        }

        .Avatar-div {
            width: 120px;
            padding: 8px;
            display: flex;
            flex-direction: column;
            background: rgba(255, 255, 255, 0.1); // 玻璃感背景
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            color: #eee;
            gap: 4px;

            .menu-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 12px;
                border-radius: 8px;
                transition: all 0.2s ease;
                cursor: pointer;
                font-size: 13px;

                .el-icon {
                    font-size: 16px;
                }

                &:hover {
                    background: rgba(64, 158, 255, 0.2);
                    color: #409EFF;
                    transform: translateX(3px); // 微小的侧滑交互
                }

                &.logout:hover {
                    background: rgba(245, 108, 108, 0.15);
                    color: #F56C6C;
                }
            }

            .menu-divider {
                height: 1px;
                background: rgba(255, 255, 255, 0.1);
                margin: 4px 8px;
            }
        }
    }
</style>