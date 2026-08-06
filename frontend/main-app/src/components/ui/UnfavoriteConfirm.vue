<template>
    <Teleport to="body">
        <Transition name="fade-scale">
            <div v-if="visible" class="confirm-modal-overlay" @click.self="handleCancel">
                <div class="confirm-modal">
                    <div class="confirm-header">
                        <svg class="warning-icon" viewBox="0 0 24 24">
                            <path d="M12 2L2 22h20L12 2zm0 3.5L18.5 20h-13L12 5.5z" />
                            <path d="M11 10v6h2v-6h-2zm0 8v2h2v-2h-2z" />
                        </svg>
                        <h3>取消收藏</h3>
                    </div>
                    <div class="confirm-body">
                        <p>确定要取消收藏《{{ title }}》吗？</p>
                    </div>
                    <div class="confirm-footer">
                        <button class="confirm-btn cancel" @click="handleCancel">取消</button>
                        <button class="confirm-btn confirm" @click="handleConfirm">确定</button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script lang="ts" setup>
    defineProps<{
        visible: boolean
        title: string
    }>()

    const emit = defineEmits<{
        (e: 'confirm'): void
        (e: 'cancel'): void
    }>()

    const handleConfirm = () => {
        emit('confirm')
    }

    const handleCancel = () => {
        emit('cancel')
    }
</script>

<style lang="less" scoped>
    .confirm-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }

    .confirm-modal {
        background: rgba(30, 41, 59, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        min-width: 360px;
        max-width: 90%;
        overflow: hidden;
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

        .confirm-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 25px 25px 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);

            .warning-icon {
                width: 28px;
                height: 28px;
                fill: #ffb800;
            }

            h3 {
                color: #fff;
                font-size: 18px;
                font-weight: 600;
                margin: 0;
            }
        }

        .confirm-body {
            padding: 20px 25px;

            p {
                color: rgba(255, 255, 255, 0.8);
                font-size: 14px;
                line-height: 1.6;
                margin: 0;
            }
        }

        .confirm-footer {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            padding: 15px 25px 25px;

            .confirm-btn {
                padding: 10px 24px;
                border-radius: 10px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                border: none;

                &:hover {
                    transform: translateY(-2px);
                }

                &.cancel {
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.15);

                    &:hover {
                        background: rgba(255, 255, 255, 0.15);
                        color: #fff;
                    }
                }

                &.confirm {
                    background: linear-gradient(135deg, #f56c6c, #e64c4c);
                    color: #fff;
                    box-shadow: 0 4px 15px rgba(245, 108, 108, 0.3);

                    &:hover {
                        background: linear-gradient(135deg, #ff7b7b, #f56c6c);
                        box-shadow: 0 6px 20px rgba(245, 108, 108, 0.5);
                    }
                }
            }
        }
    }

    // 弹窗动画
    .fade-scale-enter-active {
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .fade-scale-leave-active {
        transition: all 0.25s ease;
    }

    .fade-scale-enter-from,
    .fade-scale-leave-to {
        opacity: 0;
    }

    .fade-scale-enter-from .confirm-modal,
    .fade-scale-leave-to .confirm-modal {
        transform: scale(0.85);
    }
</style>
