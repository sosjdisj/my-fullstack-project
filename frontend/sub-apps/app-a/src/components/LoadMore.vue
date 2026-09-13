<template>
    <div class="loader-container">
        <div class="glass-loader">
            <span>加载中...</span>
        </div>
    </div>
</template>

<style lang="less" scoped>
    // --- 玻璃风变量（与微应用浅色玻璃风一致） ---
    @glass-bg: rgba(255, 255, 255, 0.45);
    @glass-border: rgba(255, 255, 255, 0.6);
    @glass-blur: 20px;
    @text-main: #34495e;

    /* 容器居中 */
    .loader-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px 0;
    }

    /* 玻璃主体：胶囊造型，与 PlayQueueModal 等浅色玻璃一致 */
    .glass-loader {
        position: relative;
        padding: 12px 28px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: @glass-bg;
        backdrop-filter: blur(@glass-blur);
        -webkit-backdrop-filter: blur(@glass-blur);
        border: 1px solid @glass-border;
        border-radius: 100px;
        box-shadow: 0 8px 24px rgba(31, 38, 135, 0.12);
        overflow: hidden;
        color: @text-main;
        font-size: 14px;
        font-weight: bold;
        letter-spacing: 1px;
    }

    /* 旋转的流光边框（配色取自弥散背景球） */
    .glass-loader::before {
        content: '';
        position: absolute;
        width: 200%;
        height: 200%;
        background: conic-gradient(transparent,
                #667eea,
                #9b6dff,
                #57c1ff,
                transparent 30%);
        animation: rotate 2s linear infinite;
    }

    /* 内部毛玻璃遮罩，露出流光边框线 */
    .glass-loader::after {
        content: '';
        position: absolute;
        inset: 2px;
        /* 控制边框粗细 */
        background: rgba(255, 255, 255, 0.55);
        border-radius: 100px;
        z-index: 0;
    }

    /* 确保文字在最上层 */
    .glass-loader span {
        position: relative;
        z-index: 1;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
    }

    /* 旋转动画 */
    @keyframes rotate {
        from {
            transform: rotate(0deg);
        }

        to {
            transform: rotate(360deg);
        }
    }
</style>
