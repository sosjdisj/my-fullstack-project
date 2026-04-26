<template>
    <div class="clock">
        <p>电子时钟</p>
        <div class="digital-clock">
            <div>{{ currentTime }}</div>
            <span class="time">{{ time.hours }}:</span>
            <span class="time">{{ time.minutes }}:</span>
            <span class="time">{{ time.seconds }}</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { ref, onMounted, onUnmounted } from 'vue'

    let timer: number
    const time = ref({
        hours: '00',
        minutes: '00',
        seconds: '00'
    })
    const currentTime = ref('')
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

    const updateTime = () => {
        const now = new Date()
        time.value = {
            hours: String(now.getHours()).padStart(2, '0'),
            minutes: String(now.getMinutes()).padStart(2, '0'),
            seconds: String(now.getSeconds()).padStart(2, '0')
        }
        //年月
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0') // 月份从0开始
        const date = String(now.getDate()).padStart(2, '0')

        // 星期几
        const weekDay = weekDays[now.getDay()]
        currentTime.value = `${year}-${month}-${date} ${weekDay}`
    }

    onMounted(() => {
        updateTime()
        timer = setInterval(updateTime, 1000)
    })
    onUnmounted(() => {
        clearInterval(timer)
    })
</script>

<style lang="less" scoped>
    .clock {
        width: inherit;
        height: 139.66px;
        background: rgba(20, 20, 25, 0.6); // 使用深色半透，压住背景
        backdrop-filter: blur(15px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        opacity: 0;

        p:first-child {
            color: aliceblue;
            font-size: 20px;
            margin: 10px 0 0 16%;
        }

        .digital-clock {
            width: inherit;
            height: 112.51px;
            text-align: center;
            color: gray;
            font-family: 'Consolas', 'Monaco', 'Roboto Mono', monospace;

            div:first-child {
                margin-top: 5%;
            }

            .time {
                font-size: 40px;
            }
        }
    }
</style>