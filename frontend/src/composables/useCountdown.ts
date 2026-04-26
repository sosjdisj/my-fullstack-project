import { ElMessage } from 'element-plus'
import type { Ref } from 'vue';
import { ref } from 'vue';

const countdown = ref(60)

export function sendVerificationCode(isValid: Ref<boolean>) {
    isValid.value = true
    ElMessage.success('验证码发送成功')
    const endtime = Date.now() + 60 * 1000
    localStorage.setItem('Minute', '60')
    localStorage.setItem('ClosingTime', endtime.toString())
    const time = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
            clearInterval(time)
            isValid.value = false
            localStorage.removeItem('Minute')
            localStorage.removeItem('ClosingTime')
        }
    }, 1000)
}

export function restoreCountdown(isValid: Ref<boolean>) {
    const Minute = localStorage.getItem('Minute')
    const ClosingTime = localStorage.getItem('ClosingTime')
    if (Minute && ClosingTime) {
        const now = Date.now()
        const remaining = Math.ceil((parseInt(ClosingTime) - now) / 1000)
        if (remaining > 0) {
            countdown.value = remaining
            isValid.value = true

            //重新启动定时器
            const time = setInterval(() => {
                countdown.value--
                if (countdown.value <= 0) {
                    clearInterval(time)
                    isValid.value = false
                    localStorage.removeItem('Minute')
                    localStorage.removeItem('ClosingTime')
                }
            }, 1000)
        }
    }
}

export function getCountdownText() {
    if (countdown.value === 60 || countdown.value === 0) {
        countdown.value = 60
        return '发送验证码'
    } else {
        return `${countdown.value}秒后重新发送`
    }
}
