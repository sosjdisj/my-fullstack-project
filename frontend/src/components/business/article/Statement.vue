<template>
    <div class="property-card">
        <div class="watermark">COPYRIGHT</div>

        <div class="property-item">
            <span class="label"><i class="icon">👤</i> 本文作者</span>
            <h4 class="value">{{ author }}</h4>
        </div>

        <div class="property-item">
            <span class="label"><i class="icon">🔗</i> 本文链接</span>
            <h4 class="value link">{{ path }}</h4>
        </div>

        <div class="property-item notice">
            <span class="label"><i class="icon">📜</i> 版权声明</span>
            <p class="notice-text">
                本博客所有文章除特别声明外，均采用
                <span class="highlight">
                    CC BY-NC-SA 4.0
                </span>
                许可协议。转载请注明来自
                <span class="highlight">我的主页</span>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
    import type { Article } from '@/types/index'

    const props = defineProps<{
        author: string
        path: string
    }>()
</script>

<style lang="less" scoped>
    @accent-blue: #00e5ff;
    @glass-border: rgba(255, 255, 255, 0.08);
    @text-dim: rgba(240, 248, 255, 0.5); // 调淡后的 aliceblue

    .property-card {
        width: 94%;
        max-width: 920px;
        margin: 40px auto;
        padding: 30px;
        position: relative;
        overflow: hidden;

        // 玻璃质感底色
        background: rgba(255, 255, 255, 0.02);
        backdrop-filter: blur(10px);

        // 左侧特色指示条：使用你喜欢的克莱因蓝
        border-left: 4px solid @accent-blue;
        border-radius: 12px;
        border-top: 1px solid @glass-border;
        border-right: 1px solid @glass-border;
        border-bottom: 1px solid @glass-border;

        display: flex;
        flex-direction: column;
        gap: 24px;
        box-sizing: border-box;

        .watermark {
            position: absolute;
            right: -10px;
            bottom: -10px;
            font-size: 60px;
            font-weight: 900;
            color: rgba(255, 255, 255, 0.03);
            pointer-events: none;
            user-select: none;
        }

        .property-item {
            position: relative;
            z-index: 1;

            .label {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                font-weight: 600;
                color: @accent-blue;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 8px;

                .icon {
                    font-style: normal;
                    font-size: 14px;
                    opacity: 0.8;
                }
            }

            .value {
                margin: 0;
                font-size: 15px;
                color: #fff;
                font-weight: 500;
                word-break: break-all; // 防止长链接撑破容器

                &.link {
                    color: @text-dim;
                    text-decoration: underline;
                    text-underline-offset: 4px;
                    cursor: pointer;
                    transition: color 0.3s;

                    &:hover {
                        color: #fff;
                    }
                }
            }

            &.notice {
                border-top: 1px solid rgba(255, 255, 255, 0.05);
                padding-top: 20px;

                .notice-text {
                    margin: 0;
                    font-size: 13px;
                    line-height: 1.6;
                    color: @text-dim;

                    .highlight {
                        color: #fff;
                        font-weight: 600;
                        border-bottom: 1px solid @accent-blue;
                    }
                }
            }
        }
    }

    // 适配移动端
    @media (max-width: 768px) {
        .property-card {
            padding: 20px;

            .watermark {
                font-size: 40px;
            }
        }
    }
</style>