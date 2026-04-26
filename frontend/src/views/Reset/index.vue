<template>
    <div class="reset-page">

        <div class="bg-image">
            <img src="/src/ass/【哲风壁纸】伞-和服-少女.png" alt="">
        </div>

        <div class="reset-card">
            <div class="reset-header">
                <h3 class="active-title">重置密码</h3>
                <p class="subtitle">我们将向您的注册邮箱发送验证码</p>
            </div>

            <form class="reset-form" @submit.prevent="handleReset">
                <div class="input-group">
                    <!-- 输入框组件 -->
                    <FormInput @update-form-field="handUpdataUsername" @hand-check="checkField" :errors="errors"
                        updata="email" placeholder=" 邮箱地址" />

                    <!-- 验证码按钮和输入框组件 -->
                    <CaptchaInput />
                </div>

                <button type="submit" class="submit-btn">确认重置</button>

                <div class="back-footer">
                    <p class="hint-text">想起密码了？</p>
                    <span class="back-link" @click="Torouter">返回登录</span>
                </div>
            </form>
        </div>
    </div>
</template>


<script setup lang="ts">
    import FormInput from '@/components/ui/FormInput.vue';
    import CaptchaInput from '@/components/ui/CaptchaInput.vue';
    import { useReset } from './useReset';

    const { errors, handUpdataUsername, checkField, Torouter, handleReset } = useReset()

</script>

<style lang="less" scoped>
    @import '/src/styls/bg-image.less';

    // 引用全局设计变量
    @primary-blue: #6366f1;
    @accent-pink: #f472b6;
    @accent-coral: #fb7185;

    .reset-page {
        height: 100vh;
        width: 100vw;
        display: flex;
        justify-content: flex-end; // 与注册页保持一致，卡片靠右

        .reset-card {
            width: 420px;
            height: 100%;
            padding: 0 40px;
            box-sizing: border-box;
            // 核心：深色玻璃拟态
            background: rgba(15, 23, 42, 0.58);
            backdrop-filter: blur(25px);
            border-left: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            align-items: center;
            box-shadow: -10px 0 30px rgba(0, 0, 0, 0.4);

            .reset-header {
                margin-top: 100px;
                margin-bottom: 50px;
                text-align: center;

                .active-title {
                    color: #fff;
                    font-size: 26px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    letter-spacing: 1px;
                }

                .subtitle {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 14px;
                }
            }

            .reset-form {
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;

                .input-group {
                    width: 300px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .submit-btn {
                    width: 300px;
                    height: 46px;
                    margin-top: 40px;
                    border: none;
                    border-radius: 10px;
                    color: #fff;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    background: linear-gradient(135deg, @accent-pink 0%, @accent-coral 100%);
                    box-shadow: 0 4px 15px rgba(244, 114, 182, 0.3);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

                    &:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(244, 114, 182, 0.4);
                        filter: brightness(1.1);
                    }

                    &:active {
                        transform: scale(0.98);
                    }
                }

                .back-footer {
                    margin-top: 24px;
                    display: flex;
                    gap: 8px;
                    font-size: 14px;

                    .hint-text {
                        color: rgba(255, 255, 255, 0.5);
                    }

                    .back-link {
                        color: @primary-blue;
                        cursor: pointer;
                        font-weight: 500;
                        transition: all 0.3s;

                        &:hover {
                            color: lighten(@primary-blue, 10%);
                            text-decoration: underline;
                        }
                    }
                }
            }
        }
    }

</style>
