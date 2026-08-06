<template>
    <div class="ai-page">
        <div class="wallpaper">
            <img src="/src/assets/18390764516330880.jpg" alt="">
        </div>

        <aside :class="['sidebar-glass', { collapsed: isCollapsed }]">
            <div class="sidebar-header">
                <div class="logo-wrapper">
                    <div class="logo-box">
                        <el-icon v-if="isCollapsed" class="logo-icon">
                            <Lightning />
                        </el-icon>
                        <span v-else class="logo-text">GEMINI AI</span>
                    </div>
                    <div class="toggle-trigger" @click="isCollapsed = !isCollapsed">
                        <el-icon v-if="isCollapsed">
                            <Expand />
                        </el-icon>
                        <el-icon v-else>
                            <Fold />
                        </el-icon>
                    </div>
                </div>

                <transition name="fade">
                    <div v-if="!isCollapsed" class="btn-container">
                        <button class="new-chat-btn" @click="isChatting = false">
                            <el-icon>
                                <Plus />
                            </el-icon>
                            <span>发起新对话</span>
                        </button>
                    </div>
                </transition>
            </div>

            <div class="history-list" v-if="!isCollapsed">
                <div class="section-divider">最近对话</div>
                <div v-for="item in conversations" :key="item.id"
                    :class="['history-item', { active: conversationId === item.id }]"
                    @click="selectConversation(item.id)">
                    <el-icon class="msg-icon">
                        <ChatLineRound />
                    </el-icon>
                    <span class="item-text">{{ item.title }}</span>
                </div>
            </div>
        </aside>

        <main class="chat-main">
            <div class="chat-content" ref="chatContainerRef">
                <div v-if="shouldShowLoadMoreObserver" :ref="el => setLoadMoreContainerRefWrapper(el as HTMLElement)">
                </div>

                <div v-if="!isChatting" class="guide-state">
                    <div class="ai-avatar-glow">
                        <el-icon>
                            <MagicStick />
                        </el-icon>
                    </div>
                    <h2>有什么我可以帮你的？</h2>
                    <div>
                        <span v-for="tag in tags" :key="tag" class="pill-tag" @click="handleTag(tag)">
                            {{ tag }}
                        </span>
                    </div>
                </div>

                <div v-else class="message-flow">
                    <div v-for="(msg, idx) in messages" :key="idx" :class="['message-item', msg.role]">
                        <div v-if="msg.role === 'assistant'" class="avatar-wrapper">
                            <div class="custom-avatar ai-avatar">
                                <el-icon>
                                    <Odometer />
                                </el-icon>
                            </div>
                        </div>
                        <MarkdownBubble :content="msg.content" :role="msg.role" class="bubble-glass" />
                    </div>

                    <div v-if="isLoading" class="message-item assistant">
                        <div class="avatar-wrapper">
                            <div class="custom-avatar ai-avatar">
                                <el-icon>
                                    <Odometer />
                                </el-icon>
                            </div>
                        </div>
                        <div class="dot-flashing-wrapper">
                            <div class="dot-flashing"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="input-area">
                <div class="input-glass-wrapper">
                    <input v-model="inputVal" placeholder="输入您的问题..." class="native-input" @keyup.enter="handleSend" />
                    <button class="send-btn" :disabled="!inputVal && !isLoading" @click="handleSend">
                        <el-icon>
                            <Top />
                        </el-icon>
                    </button>
                </div>
                <p class="hint">个人博客助手</p>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
    // Vue/Vue Router/Pinia API 由 unplugin-auto-import 全局注入
    import MarkdownBubble from '@/components/ui/MarkdownBubble .vue';
    import { useAiChat } from '@/views/AiChat/useAiChat'

    const { isCollapsed, inputVal, isLoading, messages, handleSend, tags,
        shouldShowLoadMoreObserver, isChatting, conversations, conversationId,
        handleNewChat, setLoadMoreContainerRefWrapper, handleTag, selectConversation,
        fetchConversations, clear, chatContainer
    } = useAiChat()

    const chatContainerRef = ref<HTMLElement | null>(null)

    watch(chatContainerRef, (el) => {
        if (el) {
            chatContainer.value = el
        }
    })

    onMounted(async () => {
        await fetchConversations()
    })
    onUnmounted(() => {
        clear()
    })
</script>

<style lang="less" scoped>
    // --- 变量定义 ---
    @text-dim: #9ca3af;
    @glass-border: rgba(255, 255, 255, 0.08);

    // 模糊度层级
    @blur-low: 8px;
    @blur-med: 15px;
    @blur-high: 30px;

    // 颜色系
    @ai-avatar-bg: linear-gradient(135deg, #1a1a1c 0%, #2d2d30 100%);
    @user-bubble-bg: rgba(255, 255, 255, 0.08);
    @asst-bubble-bg: rgba(0, 0, 0, 0.15);

    .ai-page {
        display: flex;
        width: 100%;
        height: 100vh;
        position: relative;
        overflow: hidden;
        color: #fff;
        background: transparent;

        &::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            backdrop-filter: blur(5px) saturate(120%);
            -webkit-backdrop-filter: blur(5px) saturate(120%);
            background: rgba(0, 0, 0, 0.4);
        }

        .wallpaper {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }

        aside,
        main {
            position: relative;
            z-index: 2;
        }

        .sidebar-glass {
            width: 260px;
            box-sizing: content-box;
            background: rgba(15, 15, 17, 0.6);
            backdrop-filter: blur(20px);
            border-right: 1px solid rgba(255, 255, 255, 0.03);
            display: flex;
            flex-direction: column;
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 10;
            overflow: hidden; // 核心：防止子元素溢出导致布局抖动
            white-space: nowrap; // 核心：强制所有内部文字不换行

            &.collapsed {
                width: 68px;

                .logo-box,
                .new-chat-btn,
                .history-list,
                .section-divider {
                    opacity: 0 !important;
                    visibility: hidden; // 核心：折叠时彻底隐藏，防止文字残影占位
                    pointer-events: none;
                }

                .sidebar-header {
                    padding: 24px 0;
                    justify-content: center;
                }

                .logo-wrapper {
                    justify-content: center;
                    margin-bottom: 0;
                    padding: 0;
                }
            }

            .sidebar-header {
                padding: 24px 16px;
                overflow: hidden;

                .logo-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 24px;
                    padding: 0 8px;
                    min-height: 32px;

                    .logo-box {
                        font-weight: 600;
                        color: #ececec;
                        font-size: 18px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .toggle-trigger {
                        color: #80868b;
                        cursor: pointer;
                        font-size: 20px;
                        transition: 0.2s;
                        flex-shrink: 0; // 防止图标被挤压

                        &:hover {
                            color: #fff;
                        }
                    }
                }

                .new-chat-btn {
                    width: 100%;
                    padding: 10px 18px;
                    box-sizing: content-box;
                    border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    background: rgba(255, 255, 255, 0.03);
                    color: #e3e3e3;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.3s;
                    overflow: hidden; // 按钮内文字不溢出

                    &:hover {
                        background: rgba(255, 255, 255, 0.08);
                        border-color: rgba(255, 255, 255, 0.1);
                    }

                    span {
                        flex-shrink: 0;
                    }
                }
            }

            .history-list {
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden; // 禁止横向滚动
                padding: 0 12px;

                &::-webkit-scrollbar {
                    width: 4px;
                }

                &::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }

                .section-divider {
                    font-size: 12px;
                    color: #666;
                    margin: 20px 12px 10px;
                    letter-spacing: 1px;
                    transition: opacity 0.2s;
                }

                .history-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 16px;
                    border-radius: 24px;
                    color: #a0a0a0;
                    cursor: pointer;
                    margin-bottom: 4px;
                    transition: 0.2s;
                    position: relative;

                    .msg-icon {
                        flex-shrink: 0; // 保证图标永远不被挤压
                    }

                    .item-text {
                        font-size: 14px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap; // 确保历史记录标题也不换行
                    }

                    &:hover {
                        background: rgba(255, 255, 255, 0.05);
                        color: #fff;
                    }

                    &.active {
                        background: rgba(255, 255, 255, 0.1);
                        color: #fff;

                        &::before {
                            content: "";
                            position: absolute;
                            left: 0;
                            top: 25%;
                            height: 50%;
                            width: 3px;
                            background: rgba(255, 255, 255, 0.8);
                            border-radius: 0 4px 4px 0;
                        }
                    }
                }
            }
        }

        .chat-main {
            flex: 1;
            display: flex;
            flex-direction: column;
            position: relative;

            .chat-content {
                flex: 1;
                padding: 20px;
                overflow-y: auto;

                >div:first-child {
                    height: 20px;
                    width: 100%;
                    position: absolute;
                }

                .guide-state {
                    text-align: center;
                    margin-top: 15vh;

                    .ai-avatar-glow {
                        width: 60px;
                        height: 60px;
                        box-sizing: content-box;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 50%;
                        margin: 0 auto 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 30px;
                        color: #ccc;
                        backdrop-filter: blur(10px);
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    }

                    .pill-tag {
                        display: inline-block;
                        padding: 6px 16px;
                        border-radius: 20px;
                        border: 1px solid rgba(255, 255, 255, 0.05);
                        margin: 5px;
                        cursor: pointer;
                        font-size: 13px;
                        color: #888;
                        transition: 0.3s;

                        &:hover {
                            border-color: rgba(255, 255, 255, 0.2);
                            color: #fff;
                            background: rgba(255, 255, 255, 0.03);
                        }
                    }
                }

                .message-flow {
                    max-width: 800px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 28px;

                    .message-item {
                        display: flex;
                        gap: 12px;

                        &.user {
                            flex-direction: row;
                            justify-content: flex-end;

                            .bubble-glass {
                                background: @user-bubble-bg;
                                backdrop-filter: blur(@blur-high);
                                -webkit-backdrop-filter: blur(@blur-high);
                                border-radius: 18px 4px 18px 18px;
                                border: 1px solid rgba(255, 255, 255, 0.06);
                                color: #fff;
                                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                            }
                        }

                        &.assistant {
                            justify-content: flex-start;

                            .bubble-glass {
                                background: @asst-bubble-bg;
                                backdrop-filter: blur(@blur-low);
                                -webkit-backdrop-filter: blur(@blur-low);
                                border-radius: 4px 18px 18px 18px;
                                border: 1px solid rgba(255, 255, 255, 0.03);
                                color: #e0e0e0;
                            }
                        }

                        .ai-avatar {
                            width: 36px;
                            height: 36px;
                            box-sizing: content-box;
                            border-radius: 10px;
                            background: rgba(255, 255, 255, 0.1);
                            backdrop-filter: blur(10px);
                            -webkit-backdrop-filter: blur(10px);
                            color: #fff;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 18px;
                            border: 1px solid rgba(255, 255, 255, 0.2);
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                        }

                        .bubble-glass {
                            padding: 12px 18px;
                            max-width: 85%;
                            line-height: 1.6;
                            font-size: 15px;
                        }

                        .dot-flashing-wrapper {
                            display: flex;
                            align-items: center;
                            padding: 12px 16px;
                        }

                        .dot-flashing {
                            position: relative;
                            width: 6px;
                            height: 6px;
                            border-radius: 50%;
                            background-color: rgba(255, 255, 255, 0.6);
                            animation: dot-flashing 1s infinite linear alternate;
                            animation-delay: 0.5s;

                            &::before,
                            &::after {
                                content: "";
                                display: inline-block;
                                position: absolute;
                                top: 0;
                            }

                            &::before {
                                left: -10px;
                                width: 6px;
                                height: 6px;
                                border-radius: 50%;
                                background-color: rgba(255, 255, 255, 0.6);
                                animation: dot-flashing 1s infinite alternate;
                                animation-delay: 0s;
                            }

                            &::after {
                                left: 10px;
                                width: 6px;
                                height: 6px;
                                border-radius: 50%;
                                background-color: rgba(255, 255, 255, 0.6);
                                animation: dot-flashing 1s infinite alternate;
                                animation-delay: 1s;
                            }
                        }

                        @keyframes dot-flashing {
                            0% {
                                background-color: rgba(255, 255, 255, 0.6);
                            }

                            50%,
                            100% {
                                background-color: rgba(255, 255, 255, 0.2);
                            }
                        }
                    }
                }
            }

            .input-area {
                padding: 20px 40px;

                .input-glass-wrapper {
                    max-width: 800px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    background: rgba(20, 20, 22, 0.6);
                    backdrop-filter: blur(@blur-med);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                    padding: 12px 20px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                    transition: 0.3s;

                    &:focus-within {
                        background: rgba(30, 30, 33, 0.8);
                        border-color: rgba(255, 255, 255, 0.1);
                    }

                    .native-input {
                        flex: 1;
                        background: transparent;
                        border: none;
                        color: #fff;
                        font-size: 15px;
                        outline: none;
                        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                        padding: 15px 0;
                        margin: -12px 0;
                        cursor: text;

                        &::placeholder {
                            color: rgba(255, 255, 255, 0.3);
                        }
                    }

                    .send-btn {
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        border: none;
                        background: rgba(255, 255, 255, 0.9);
                        color: #131314;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: 0.2s;

                        &:hover:not(:disabled) {
                            background: #fff;
                            transform: scale(1.05);
                        }

                        &:disabled {
                            opacity: 0.1;
                            background: rgba(255, 255, 255, 0.5);
                        }
                    }
                }

                .hint {
                    font-size: 12px;
                    text-align: center;
                    color: rgba(255, 255, 255, 0.4);
                    margin-top: 12px;
                }
            }
        }
    }
</style>
