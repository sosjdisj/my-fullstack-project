<template>
    <div class="register-page">

        <div class="bg-image">
            <img src="/src/assets/【哲风壁纸】6K-6K画质.png" alt="">
        </div>

        <form class="register-card" @submit.prevent="GoregisterUser">
            <h3 class="register-title">创建新账号</h3>

            <div class="input-group">
                <!-- 输入框组件 -->
                <FormInput @update-form-field="handUpdataUsername" @hand-check="checkPassword" :errors="errors"
                    updata="username" placeholder="用户名" />

                <FormInput @update-form-field="handUpdataPhone" @hand-check="checkPassword" :errors="errors"
                    updata="phone" placeholder="手机号" />
                <FormInput @update-form-field="handUpdataPassword" @hand-check="checkPassword" :errors="errors"
                    updata="password" placeholder="设置密码" />

                <FormInput @update-form-field="handUpdataConfirmPassword" @hand-check="checkPassword" :errors="errors"
                    updata="confirmpassword" placeholder="确认密码" />

                <!-- 验证码按钮和输入框组件 -->
                <CaptchaInput v-model="captchaCode" @send="sendCaptcha" />
            </div>

            <button type="submit" class="submit-btn">立即注册</button>

            <div class="footer-links">
                <p class="hint-text">已有账号？</p>
                <span class="login-link" @click="Torouter">返回登录</span>
            </div>
        </form>
    </div>
</template>


<script setup lang="ts">
    import FormInput from '@/components/ui/FormInput.vue';
    import CaptchaInput from '@/components/ui/CaptchaInput.vue';
    import { useRegister } from './useRegister';

    const { errors, captchaCode, checkPassword, GoregisterUser, Torouter,
        handUpdataUsername, handUpdataPassword, handUpdataConfirmPassword,
        handUpdataPhone, sendCaptcha } = useRegister()

</script>

<style lang="less" scoped>
    @import '/src/styles/bg-image.less';

    // 变量提取，保持设计系统一致
    @bg-dark: #1a202c;
    @card-bg: rgba(255, 255, 255, 0.04);
    @accent-pink: #f472b6;
    @accent-coral: #fb7185;
    @primary-blue: #6366f1;

    .register-page {
        height: 100vh;
        width: 100vw;
        display: flex;
        justify-content: flex-end; // 卡片靠右
        overflow: hidden;

        .register-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 420px;
            height: 100%;
            padding: 0 40px;
            box-sizing: border-box;
            // 玻璃拟态效果
            background: rgba(15, 23, 42, 0.55);
            backdrop-filter: blur(20px);
            border-left: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);

            .register-title {
                color: #fff;
                font-size: 26px;
                font-weight: 600;
                letter-spacing: 1px;
                margin-top: 80px;
                margin-bottom: 40px;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            }

            .input-group {
                display: flex;
                flex-direction: column;
                gap: 4px; // 配合 FormInput 内部的间距
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

            .footer-links {
                margin-top: 24px;
                display: flex;
                gap: 8px;
                font-size: 14px;

                .hint-text {
                    color: rgba(255, 255, 255, 0.5);
                }

                .login-link {
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

</style>
