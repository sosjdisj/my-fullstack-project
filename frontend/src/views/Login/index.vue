<template>
    <div class="login">

        <div class="bg-image">
            <img src="/src/assets/【哲风壁纸】8k-个性背景.png" alt="">
        </div>

        <div class="login-right">
            <form class="login-right-top" @submit.prevent="handleLogin">
                <h3 class="login-right-h3">登录</h3>
                <FormInput @update-form-field="handUpdataUsername" @hand-check="checkPassword" :errors="errors"
                    updata="username" placeholder="用户名" />

                <FormInput @update-form-field="handUpdataPassword" @hand-check="checkPassword" :errors="errors"
                    updata="password" placeholder="密码" />

                <br>
                <div class="action-bar">
                    <!-- <label class="checkbox-wrapper">
                        <input type="checkbox" v-model="isChecked">
                        <span class="checkbox-text" :class="{ 'is-active': isChecked }">记住我</span>
                    </label> -->
                    <span class="forget-link" @click="ToregisterUser('reset')">忘记密码？</span>
                </div>

                <div class="button-group">
                    <button type="submit" class="btn btn-primary">立即登录</button>
                    <button type="button" class="btn btn-secondary" @click="ToregisterUser('/register')">
                        立即注册
                    </button>
                </div>

            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
    import FormInput from '@/components/ui/FormInput.vue';
    import { useLogin } from './useLogin';

    const { errors, handUpdataUsername, handUpdataPassword, ToregisterUser, checkPassword, handleLogin } = useLogin()

</script>

<style lang="less" scoped>
    @import '/src/styles/bg-image.less';

    @purple-primary: #764ba2;
    @gradient-pink: #f093fb;
    @gradient-coral: #f5576c;
    // 继承之前的变量
    @primary-gradient: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    @secondary-gradient: linear-gradient(135deg, #f472b6 0%, #db2777 100%);
    @text-muted: rgba(255, 255, 255, 0.6);

    .login {
        height: 100%;
        position: relative;

        .login-right {
            display: flex;
            flex-direction: column;
            width: 400px;
            height: 100%;
            margin-left: auto;
            backdrop-filter: blur(6px);

            .login-right-top {
                display: flex;
                align-items: center;
                flex-direction: column;
                width: inherit;
                height: 350.8px;

                // .right-span {
                //     width: 305px;
                //     min-height: 19.2px;
                //     font-size: 13px;
                //     color: @danger-red;
                // }

                .login-right-h3 {
                    color: aliceblue;
                    font-size: 22px;
                    margin-top: 20%;
                    margin-bottom: 12%;
                }

                .action-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 300px; // 与输入框宽度保持一致
                    margin-top: 8px;
                    font-size: 13px;

                    .checkbox-wrapper {
                        display: flex;
                        align-items: center;
                        cursor: pointer;
                        user-select: none;

                        input[type="checkbox"] {
                            margin-right: 8px;
                            cursor: pointer;
                            accent-color: #6366f1; // 改变勾选框颜色
                        }

                        .checkbox-text {
                            color: @text-muted;
                            transition: color 0.3s ease;

                            &.is-active {
                                color: #fff;
                                font-weight: 500;
                            }
                        }
                    }

                    .forget-link {
                        cursor: pointer;
                        color: @text-muted;
                        transition: all 0.3s ease;
                        border-bottom: 1px solid transparent;

                        &:hover {
                            color: #fff;
                            border-bottom: 1px solid rgba(255, 255, 255, 0.4);
                        }
                    }
                }

                .button-group {
                    width: 300px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    margin-top: 40px;

                    .btn {
                        width: 100%; // 按钮撑满宽度，更有冲击力
                        height: 44px; // 增加高度，更符合触控习惯
                        border: none;
                        border-radius: 10px; // 更圆润的角
                        font-size: 15px;
                        font-weight: 600;
                        letter-spacing: 1px;
                        color: #ffffff;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
                        position: relative;
                        overflow: hidden;

                        &:active {
                            transform: scale(0.98); // 点击时的缩放反馈
                        }

                        // 登录按钮
                        &.btn-primary {
                            background: @primary-gradient;
                            box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);

                            &:hover {
                                box-shadow: 0 8px 25px rgba(79, 70, 229, 0.4);
                                transform: translateY(-2px);
                                filter: brightness(1.1);
                            }
                        }

                        // 注册按钮
                        &.btn-secondary {
                            background: rgba(255, 255, 255, 0.1); // 这种透明质感更高级
                            border: 1px solid rgba(255, 255, 255, 0.2);
                            backdrop-filter: blur(5px);

                            &:hover {
                                background: rgba(255, 255, 255, 0.15);
                                border-color: rgba(255, 255, 255, 0.4);
                                transform: translateY(-2px);
                            }
                        }
                    }
                }

            }
        }
    }
</style>
