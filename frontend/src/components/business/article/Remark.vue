<template>
    <div class="remark-container">
        <div class="remark-header" ref="remark">
            <h2 class="title">
                <i class="icon">💬</i> 评论 <span class="count">{{ comments }}</span>
            </h2>
        </div>

        <form @submit.prevent="handPinglun" class="comment-form">
            <div class="input-wrapper">
                <textarea placeholder="说点什么吧，你的评论就是最好的支持..." rows="4" v-model="content"
                    :class="{ 'has-content': content }"></textarea>
                <div class="input-focus-line"></div>
            </div>

            <div class="toolbar-footer">
                <div class="emoji-placeholder">
                    <span class="tip">Markdown Supported</span>
                </div>
                <div class="action-btns">
                    <div class="btn-preview" @click="handYulan" :class="{ 'active': isYulan }">
                        {{ isYulan ? '关闭预览' : '预览' }}
                    </div>
                    <button class="btn-submit" type="submit">发布评论</button>
                </div>
            </div>
        </form>

        <Transition name="fade-slide">
            <div class="preview-area" v-show="isYulan && content">
                <div class="preview-badge">PREVIEW</div>
                <p>{{ content }}</p>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import { ElMessage } from 'element-plus'
    import { post } from '@/api/request';

    const props = defineProps<{
        comments: number
        id: string
    }>()

    const isYulan = ref(false)
    const content = ref('')

    const remark = ref<HTMLDivElement | null>(null)

    defineExpose({ remark });

    const handYulan = () => {
        if (!isYulan.value) {
            isYulan.value = true
            return;
        }

        isYulan.value = false
    }
    const handPinglun = async () => {
        if (!content.value) return ElMessage.error('评论内容不能为空')

        const result = await post(`/article/${props.id}/comments`, { content: content.value })

        if (result.success) {
            ElMessage.success(result.message)
            content.value = ''
        }
    }
</script>

<style lang="less" scoped>
    @accent-blue: #00e5ff;
    @glass-bg: rgba(255, 255, 255, 0.05);
    @glass-border: rgba(255, 255, 255, 0.1);
    @text-main: #e2e8f0;

    .remark-container {
        width: 94%;
        max-width: 920px;
        margin: 60px auto 40px;
        position: relative;

        .remark-header {
            margin-bottom: 24px;

            .title {
                color: #fff;
                font-size: 1.25rem;
                display: flex;
                align-items: center;
                gap: 10px;

                .count {
                    font-size: 14px;
                    color: @accent-blue;
                    font-weight: 400;
                }
            }
        }
    }

    .comment-form {
        background: rgba(30, 32, 40, 0.4);
        border: 1px solid @glass-border;
        border-radius: 16px;
        padding: 20px;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;

        &:focus-within {
            border-color: rgba(0, 229, 255, 0.3);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        }

        .input-wrapper {
            position: relative;

            textarea {
                width: 100%;
                min-height: 120px;
                background: transparent;
                border: none;
                resize: none;
                outline: none;
                color: #fff;
                font-size: 15px;
                line-height: 1.6;
                caret-color: @accent-blue;
                padding: 10px;
                box-sizing: border-box;

                &::placeholder {
                    color: rgba(255, 255, 255, 0.2);
                    font-weight: 400;
                }
            }

            .input-focus-line {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 0;
                height: 1px;
                background: linear-gradient(90deg, transparent, @accent-blue, transparent);
                transition: width 0.4s ease;
            }
        }

        &:focus-within .input-focus-line {
            width: 100%;
        }
    }

    .toolbar-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);

        .tip {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.3);
            font-style: italic;
        }

        .action-btns {
            display: flex;
            gap: 12px;

            .btn-preview {
                padding: 6px 16px;
                font-size: 13px;
                color: rgba(255, 255, 255, 0.6);
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid @glass-border;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;

                &:hover,
                &.active {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                    border-color: @accent-blue;
                }
            }

            .btn-submit {
                padding: 6px 20px;
                font-size: 13px;
                font-weight: 600;
                color: #000;
                background: #fff;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
                transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);

                &:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 229, 255, 0.3);
                    background: @accent-blue;
                }

                &:active {
                    transform: translateY(0) scale(0.95);
                }
            }
        }
    }

    /* 预览区优化 */
    .preview-area {
        margin-top: 20px;
        padding: 25px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px dashed rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        color: @text-main;
        position: relative;

        .preview-badge {
            position: absolute;
            top: -10px;
            left: 20px;
            background: #333;
            color: rgba(255, 255, 255, 0.4);
            font-size: 10px;
            padding: 2px 8px;
            border-radius: 4px;
            letter-spacing: 1px;
        }

        p {
            margin: 0;
            line-height: 1.6;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
    }

    /* 动画 */
    .fade-slide-enter-active,
    .fade-slide-leave-active {
        transition: all 0.3s ease;
    }

    .fade-slide-enter-from,
    .fade-slide-leave-to {
        opacity: 0;
        transform: translateY(-10px);
    }
</style>
