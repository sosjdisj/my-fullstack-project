<template>
    <div class="wave-wrapper">
        <svg width="200%" height="100%" viewBox="0 0 1200 120" preserveAspectRatio="none" class="svg">
            <defs>
                <linearGradient id="wave-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="rgba(255, 255, 255, 0.1)" />
                    <stop offset="50%" stop-color="rgba(255, 255, 255, 0.4)" />
                    <stop offset="100%" stop-color="rgba(255, 255, 255, 0.6)" />
                </linearGradient>
            </defs>

            <path fill="url(#wave-gradient)"
                d="M0,60 C200,10 400,110 600,60 S800,10 1000,60 S1200,110 1200,60 V120 H0 Z" class="wave wact1" />

            <path fill="url(#wave-gradient)"
                d="M0,70 C250,20 450,120 650,70 S850,20 1050,70 S1200,120 1200,70 V120 H0 Z" class="wave wact2" />

            <path fill="url(#wave-gradient)"
                d="M0,80 C300,30 500,130 700,80 S900,30 1100,80 S1200,130 1200,80 V120 H0 Z" class="wave wact3" />
        </svg>
    </div>
</template>

<style lang="less" scoped>
    .wave-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        // 降低模糊度，让波浪更有“形”，不至于太散
        filter: blur(2px);
        overflow: hidden;
    }

    .svg {
        display: block;
        width: 200%;
        height: 100%;
    }

    .wave {
        // 使用 screen 混合模式可以让波浪在暗色背景下非常明亮
        mix-blend-mode: screen;
    }

    /* 恢复你原来的动画配置：alternate (往返) 保证无缝衔接 */
    .wact1 {
        animation: isfw 6s ease-in-out infinite alternate;
        opacity: 0.4;
    }

    .wact2 {
        animation: isfw 4s ease-in-out infinite alternate;
        opacity: 0.6;
    }

    .wact3 {
        animation: isfw 2.8s ease-in-out infinite alternate;
        opacity: 0.9;
    }

    @keyframes isfw {
        0% {
            transform: translateX(0);
        }

        100% {
            // 往左移动一半，配合 width: 200%
            transform: translateX(-50%);
        }
    }
</style>
