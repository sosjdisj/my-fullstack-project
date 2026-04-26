<template>
    <div class="loader-container">
        <div class="glass-loader">
            <span>加载中...</span>
        </div>
    </div>
</template>

<style lang="less" scoped>

    /* 容器居中 */
    .loader-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
        /* 深色背景更能衬托流光 */
    }

    /* 玻璃主体 */
    .glass-loader {
        position: relative;
        width: 120px;
        height: 90px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 20%;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        overflow: hidden;
        color: #38bdf8;
        font-family: sans-serif;
        font-weight: bold;
        letter-spacing: 1px;
    }

    /* 旋转的流光边框 */
    .glass-loader::before {
        content: '';
        position: absolute;
        width: 200%;
        height: 200%;
        background: conic-gradient(transparent,
                #38bdf8,
                #818cf8,
                #c084fc,
                transparent 30%);
        animation: rotate 2s linear infinite;
    }

    /* 内部遮罩，露出流光边框线 */
    .glass-loader::after {
        content: '';
        position: absolute;
        inset: 4px;
        /* 控制边框粗细 */
        background: #1e293b;
        border-radius: 18%;
        z-index: 0;
    }

    /* 确保文字在最上层 */
    .glass-loader span {
        position: relative;
        z-index: 1;
        text-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
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