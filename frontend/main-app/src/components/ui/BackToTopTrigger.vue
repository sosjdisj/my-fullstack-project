<template>
    <button class="back-to-top" title="回到顶部" :class="{ 'show': props.isShow }" @click="goToTop">
        <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path>
        </svg>
    </button>
</template>

<script lang="ts" setup>
    import { goToTop } from '@/utils/helpers'

    const props = defineProps<{
        isShow: boolean
    }>()

</script>

<style lang="less" scoped>
    // 1. 定义变量，方便一键换色
    @primary-color: #007AFF;
    @hover-color: darken(@primary-color, 10%);
    @btn-size: 50px;
    @transition-speed: 0.3s;

    // 2. 定义一个复用的混合 (Mixin)
    .flex-center() {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .back-to-top {
        // 定位与尺寸
        position: fixed;
        bottom: 100px;
        right: 50px;
        width: @btn-size;
        height: @btn-size;
        z-index: 999;

        // 装饰
        background-color: @primary-color;
        color: #fff;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        .flex-center();

        // 初始隐藏状态 (带有下沉效果)
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px);
        transition: all @transition-speed cubic-bezier(0.4, 0, 0.2, 1);

        cursor: pointer;
        border: none;

        // 嵌套语法：当拥有 .show 类时
        &.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        // 嵌套语法：交互反馈
        &:hover {
            background-color: @hover-color;
            transform: translateY(-5px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
        }

        &:active {
            transform: scale(0.9);
        }

        // 内部图标样式
        svg {
            width: 24px;
            height: 24px;
            fill: currentColor; // 随文字颜色变化
        }
    }

</style>