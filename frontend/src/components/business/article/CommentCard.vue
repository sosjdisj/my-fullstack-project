<template>
    <div class="reply-card">
        <div class="avatar-section">
            <img :src="avatar" class="avatar-img" alt="avatar" v-if="avatar">
            <div class="avatar-placeholder" v-else></div>
            <div class="connector-line"></div>
        </div>

        <div class="content-section">
            <div class="meta-info">
                <div class="user-details">
                    <span class="username">{{ username }}</span>
                    <span class="post-time">{{ formatDate(createTime) }}</span>
                </div>
            </div>

            <div class="message-body">
                {{ content || '这是一条神秘的评论...' }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import type { ArticleComment } from '@/types/index'
    import { formatDate } from '@/utils/helpers'

    const props = defineProps<{
        data: ArticleComment
    }>()

    const { username, avatar, content, createTime } = props.data
</script>

<style lang="less" scoped>
    @accent-blue: #00e5ff;
    @text-main: #e2e8f0;
    @text-dim: rgba(226, 232, 240, 0.4);
    @glass-border: rgba(255, 255, 255, 0.08);

    .reply-card {
        width: 94%;
        max-width: 920px;
        margin: 16px auto;
        display: flex;
        gap: 16px;
        padding: 12px;
        transition: all 0.3s ease;

        &:hover {
            transform: translateX(4px);
        }

        .avatar-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 48px;

            .avatar-img {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                object-fit: cover;
                border: 1px solid @glass-border;
                background: #333;
            }

            .avatar-placeholder {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                background: linear-gradient(135deg, #444, #222);
            }

            .connector-line {
                width: 2px;
                flex: 1;
                background: linear-gradient(to bottom, @glass-border, transparent);
                margin-top: 8px;
            }
        }

        .content-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 8px;

            .meta-info {
                display: flex;
                justify-content: space-between;
                align-items: center;

                .user-details {
                    display: flex;
                    align-items: center;
                    gap: 12px;

                    .username {
                        color: #fff;
                        font-weight: 600;
                        font-size: 14px;
                        transition: color 0.3s;

                        &:hover {
                            color: @accent-blue;
                            cursor: pointer;
                        }
                    }

                    .post-time {
                        font-size: 12px;
                        color: @text-dim;
                    }
                }

                .interaction-tools {
                    display: flex;
                    gap: 16px;
                    color: @text-dim;

                    .tool-item {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        cursor: pointer;
                        transition: all 0.2s;
                        font-size: 13px;

                        &:hover {
                            color: #fff;
                        }

                        &.like.active {
                            color: @accent-blue;
                            text-shadow: 0 0 8px rgba(0, 229, 255, 0.4);
                        }
                    }
                }
            }

            .message-body {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid @glass-border;
                border-radius: 12px;
                padding: 12px 16px;
                color: @text-main;
                font-size: 14px;
                line-height: 1.6;
                position: relative;

                // 增加一个微弱的小尖角，指向头像
                &::before {
                    content: '';
                    position: absolute;
                    left: -6px;
                    top: 12px;
                    border-top: 6px solid transparent;
                    border-bottom: 6px solid transparent;
                    border-right: 6px solid rgba(255, 255, 255, 0.03);
                }
            }
        }
    }
</style>