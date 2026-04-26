<template>
    <div class="typewriter-box">
        <div class="glass-module">
            <h2 class="content">
                <span class="text">{{ displayText }}</span>
                <span class="cursor"></span>
            </h2>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, onUnmounted } from 'vue';

    const displayText = ref<string>('');
    const phrases = ref([
        '这个世界好不公平！我陪你一路走过最低迷的时光，见过你最狼狈的样子，可后来的人却轻易摘走了最好的你',
        '烟火再美，终究会消失，倒不如远远地看着它…至少我看清了它的全部轮廓',
        '对于这个世界，你就是一个麻烦，对于我，你就是整个世界',
        `我在你的心里种了一颗种子，如果几年以后有雨水滋润了你，你要记得让这颗种子萌芽开花`,
        `简薇拿到了一张试卷，米彩也拿到了一张一样的，只是米彩答了满分，而乐瑶……昭阳连试卷都没有发给她`,
        `只能在睡着的时候假装死了几次，醒来后在还活着的苦恼中，继续面对世事煮沸后的灼痛`,
        `人性的背后是白云苍狗，愿你我都是生活的高手`,
    ]);

    let wordIndex = 0;
    let charIndex = 0;
    // 状态控制（打字，删除，等待）
    let status = 'typing'; // typing | waiting | deleting
    //精准计算两次 RAF 执行的时间差
    let lastTime = performance.now();

    const TYPING_SPEED = 150;//打字速度
    const ERASING_SPEED = 50;//删除速度
    const WAIT_END = 3000; // 打完字停 3 秒
    const WAIT_START = 500; // 删完字停 0.5 秒

    let rafHandle: number | null = null;

    const animate = (currentTime: number) => {
        //currentTime 的值 等价于调用 performance.now() 的结果
        const deltaTime = currentTime - lastTime;
        const currentPhrase = phrases.value[wordIndex] || '';

        let currentDelay = 0;

        // 根据当前状态判断需要的延迟
        switch (status) {
            case 'typing': currentDelay = TYPING_SPEED; break;
            case 'deleting': currentDelay = ERASING_SPEED; break;
            case 'waiting':
                // 如果正在等待，判断是“打完等”还是“删完等”
                currentDelay = (charIndex === 0) ? WAIT_START : WAIT_END;
                break;
        }

        if (deltaTime >= currentDelay) {
            if (status === 'typing') {
                charIndex++;
                displayText.value = currentPhrase.substring(0, charIndex);
                if (charIndex === currentPhrase.length) {
                    status = 'waiting'; // 打完了，进等待态
                }
            }
            else if (status === 'deleting') {
                charIndex--;
                displayText.value = currentPhrase.substring(0, charIndex);
                if (charIndex === 0) {
                    status = 'waiting'; // 删完了，进等待态
                    wordIndex = (wordIndex + 1) % phrases.value.length;
                }
            }
            else if (status === 'waiting') {
                // 等待时间到了，切换下一个状态
                status = (charIndex === 0) ? 'typing' : 'deleting';
            }

            lastTime = currentTime; // 重置计时器
        }

        rafHandle = requestAnimationFrame(animate);
    };

    onMounted(async () => {
        rafHandle = requestAnimationFrame(animate);
    });
    onUnmounted(() => {
        if (rafHandle !== null) {
            cancelAnimationFrame(rafHandle);
        }
    });
</script>


<<style lang="less" scoped>
    // --- Less 变量配置区 ---
    @theme-color: #00ffcc; // 主题色（青绿色）
    @text-color: #ffffff; // 文字基本色
    @font-size-desktop: 28px; // 桌面端字号
    @font-size-mobile: 18px; // 移动端字号
    @cursor-width: 3px; // 光标宽度

    .typewriter-box {
        display: flex;
        justify-content: center;
        padding: 40px 20px;
        user-select: none;

        .glass-module {
            min-height: 1.6em;
            position: relative;
            padding: 20px 40px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 16px;
            // 毛玻璃效果
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;

            &:hover {
                border-color: rgba(@theme-color, 0.4);
                box-shadow: 0 10px 40px rgba(@theme-color, 0.1);
            }
        }

        .content {
            margin: 0;
            display: flex;
            align-items: center;
            min-height: 1.6em; // 保持高度，防止空字时抖动

            .text {
                font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
                font-size: @font-size-desktop;
                font-weight: 500;
                color: @text-color;
                letter-spacing: 1px;
                // 这里的阴影让文字有种“微光”感
                text-shadow: 0 0 10px rgba(@text-color, 0.3);
                word-break: break-all;
            }

            .cursor {
                display: inline-block;
                width: @cursor-width;
                height: (@font-size-desktop * 0.9);
                background-color: @theme-color;
                margin-left: 10px;
                border-radius: @cursor-width;
                box-shadow: 0 0 12px @theme-color;
                // 引用光标闪烁动画
                animation: cursorBlink 1s infinite;
            }
        }
    }

    // --- 动画定义 ---
    @keyframes cursorBlink {

        0%,
        100% {
            opacity: 1;
            transform: scaleY(1);
        }

        50% {
            opacity: 0;
            transform: scaleY(0.8);
        }
    }

    // --- 媒体查询适配 ---
    @media (max-width: 768px) {
        .typewriter-box {
            .content {
                .text {
                    font-size: @font-size-mobile;
                }

                .cursor {
                    height: (@font-size-mobile * 0.9);
                }
            }

            .glass-module {
                padding: 15px 25px;
            }
        }
    }
</style>