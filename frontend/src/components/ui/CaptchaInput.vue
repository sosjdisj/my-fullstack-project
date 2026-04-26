<template>
    <div class="captcha-row">
        <input v-model="captchaValue" type="text" placeholder="验证码" maxlength="6" class="captcha-input"
            autocomplete="one-time-code">

        <button type="button" class="captcha-btn-custom" @click="handleSendVerificationCode" :disabled="isValid"
            :class="{ 'is-counting': isValid }">
            {{ countdownText }}
        </button>
    </div>
</template>

<script lang="ts" setup>
    import { computed, ref, onMounted, onUnmounted } from 'vue'

    const props = defineProps<{
        modelValue: string
    }>()

    const emit = defineEmits<{
        'update:modelValue': [value: string]
        send: [callback: () => void]
    }>()

    const isValid = ref(false)
    const countdown = ref(0) // 倒计时秒数
    const COUNTDOWN_TIME = 60 // 倒计时总时长
    let timer: number | null = null

    const captchaValue = computed({
        get() {
            return props.modelValue
        },
        set(val) {
            emit('update:modelValue', val)
        }
    })

    // 获取倒计时文本
    const getCountdownText = () => {
        if (isValid.value) {
            return `${countdown.value}秒后重试`
        }
        return '发送验证码'
    }

    // 开始倒计时
    const startCountdown = () => {
        isValid.value = true
        countdown.value = COUNTDOWN_TIME

        // 存储倒计时开始时间
        const startTime = Date.now()
        localStorage.setItem('captchaCountdownStart', startTime.toString())

        timer = window.setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000)
            const remaining = COUNTDOWN_TIME - elapsed

            if (remaining <= 0) {
                clearCountdown()
            } else {
                countdown.value = remaining
            }
        }, 1000)
    }

    // 清除倒计时
    const clearCountdown = () => {
        if (timer) {
            clearInterval(timer)
            timer = null
        }
        isValid.value = false
        countdown.value = 0
        localStorage.removeItem('captchaCountdownStart')
    }

    // 恢复倒计时（页面刷新后）
    const restoreCountdown = (isCounting: boolean) => {
        const startTimeStr = localStorage.getItem('captchaCountdownStart')

        if (!startTimeStr) {
            // 没有倒计时记录
            isValid.value = false
            countdown.value = 0
            return
        }

        const startTime = parseInt(startTimeStr)
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        const remaining = COUNTDOWN_TIME - elapsed

        if (remaining <= 0) {
            // 倒计时已结束
            clearCountdown()
        } else {
            // 倒计时还未结束，继续倒计时
            isValid.value = true
            countdown.value = remaining

            timer = window.setInterval(() => {
                const newElapsed = Math.floor((Date.now() - startTime) / 1000)
                const newRemaining = COUNTDOWN_TIME - newElapsed

                if (newRemaining <= 0) {
                    clearCountdown()
                } else {
                    countdown.value = newRemaining
                }
            }, 1000)
        }
    }

    // 清理定时器
    onUnmounted(() => {
        if (timer) {
            clearInterval(timer)
            timer = null
        }
    })

    const countdownText = computed(() => {
        return getCountdownText()
    })

    const handleSendVerificationCode = () => {
        if (isValid.value) return // 正在倒计时，不重复发送

        // 通知父组件发送验证码，父组件调用成功后执行回调开始倒计时
        emit('send', () => {
            startCountdown()
        })
    }

    onMounted(() => {
        restoreCountdown(isValid.value)
    })
</script>

<style lang="less" scoped>
    @primary-blue: #6366f1;
    @text-white: #f8fafc;

    // 验证码特化样式
    .captcha-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        width: 300px;
        gap: 12px;
        margin-top: 10px;

        .captcha-input {
            flex: 1;
            min-width: 0;
            height: 42px;
            padding: 0 15px;
            background: rgba(255, 255, 255, 0.05);
            border: 1.5px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #fff;
            outline: none;
            transition: all 0.3s;

            &:focus {
                border-color: @primary-blue;
                background: rgba(255, 255, 255, 0.1);
            }
        }
    }

    .captcha-btn-custom {
        width: 110px; // 稍微收窄，留出间距
        height: 42px; // 与左侧输入框高度完全一致
        padding: 0 8px;
        border: 1.5px solid rgba(99, 102, 241, 0.4); // 淡淡的紫色边框
        border-radius: 8px;
        background: rgba(99, 102, 241, 0.1); // 极淡的背景色
        color: @text-white;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(4px);
        box-sizing: border-box;
        white-space: nowrap;

        &:hover:not(:disabled) {
            background: rgba(99, 102, 241, 0.25);
            border-color: @primary-blue;
            box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
            transform: translateY(-1px);
        }

        &:active:not(:disabled) {
            transform: translateY(0.5px);
            filter: brightness(0.9);
        }

        // 倒计时/禁用状态
        &:disabled {
            cursor: not-allowed;
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.4);
            box-shadow: none;

            // 如果是在倒计时，可以加个呼吸灯效果
            &.is-counting {
                font-size: 12px;
                border-style: dashed; // 倒计时用虚线边框，更有仪式感
                animation: pulse 2s infinite;
                letter-spacing: 0;
            }
        }
    }

    // 倒计时时的轻微呼吸动画
    @keyframes pulse {
        0% {
            opacity: 1;
        }

        50% {
            opacity: 0.7;
        }

        100% {
            opacity: 1;
        }
    }
</style>