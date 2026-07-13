import { ref, computed, nextTick, onUnmounted } from 'vue';
import { get, post } from '@/api/request';
import type { AiChat, Conversations } from '@/types/index';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { ElMessage } from 'element-plus';
import { setLoadMoreContainerRef } from '@/utils/helpers';

export function useAiChat() {
    const isCollapsed = ref(true);
    const isChatting = ref(false); // 控制欢迎页和聊天页切换
    const chatContainer = ref<HTMLElement | null>(null);

    const inputVal = ref('');
    const conversationId = ref('');

    const isLoading = ref(false);

    const isFinished = ref(false)
    const isHistoryLoading = ref(false)

    const messages = ref<AiChat[]>([]);
    const conversations = ref<Conversations[]>([]);

    // 存储清理函数
    let cleanupLoadMoreObserver: (() => void) | null = null;

    const shouldShowLoadMoreObserver = computed(() => messages.value.length > 0);

    // 固定的推荐标签
    const tags = ref(['写一段 JavaScript 排序算法', '如何优化 Vue 项目性能？', '帮我写一封求职邮件']);

    // 自动滚动到底部
    const scrollToBottom = async () => {
        await nextTick();
        if (chatContainer.value) {
            chatContainer.value.scrollTo({
                top: chatContainer.value.scrollHeight,
                behavior: 'smooth' // 平滑滚动
            });
        }
    };

    // 获取会话列表
    const fetchConversations = async () => {
        try {
            const res = await get('/chat/conversations'); // 根据你后端路由调整
            conversations.value = res.data.data.conversations;
        } catch (error) {
            console.error('获取列表失败', error);
        }
    };

    // 选择某个历史会话
    const selectConversation = async (id: string) => {
        // 如果正在加载（防抖），直接返回
        if (isHistoryLoading.value) return;

        // 1. 更新当前活跃的 ID
        conversationId.value = id;
        isChatting.value = true;

        // 2. 【关键】切换会话时，必须重置这些状态，否则会带入上一个会话的数据和分页状态
        messages.value = [];
        isFinished.value = false;

        // 3. 直接复用逻辑，不传参即为 isLoadMore = false
        await fetchChatHistory();
    };


    /**
    * 获取历史消息（基于游标的向上滚动分页）
    * @param isLoadMore 是否为加载更多（true 为向上拉取，false 为切换会话初始化）
    */
    const fetchChatHistory = async (isLoadMore = false) => {
        // 1. 状态拦截：正在加载中，或已经加载完毕且是“加载更多”操作，则跳过
        if (isHistoryLoading.value || (isLoadMore && isFinished.value)) return;

        isHistoryLoading.value = true;

        // 2. 确定游标：
        // 加载更多时，取当前列表最顶部（最旧）的消息时间
        // 初始化加载时，游标为空，后端将返回最新的 size 条数据
        const cursor = isLoadMore && messages.value.length > 0
            ? messages.value[0]?.createdAt
            : '';

        try {
            const res = cursor ?
                await get(`/chat/${conversationId.value}/history`, { cursor: cursor }) :
                await get(`/chat/${conversationId.value}/history`)

            const newMessages = res.data.data.chatHistory || [];

            // 3. 判断是否加载完成：返回数量小于请求数量，标记不再加载
            if (newMessages.length < 20) {
                isFinished.value = true;
            }

            if (isLoadMore) {
                // --- 关键点：向上滚动加载的数据拼接 ---
                // 记录加载前的容器高度，用于修正滚动位置（防止内容跳动）
                const oldScrollHeight = chatContainer.value?.scrollHeight || 0;

                // 将老消息塞到数组最前面
                messages.value = [...newMessages, ...messages.value];

                // 修正滚动条位置：让用户视口停留在加载前的位置
                await nextTick();
                if (chatContainer.value) {
                    const newScrollHeight = chatContainer.value.scrollHeight;
                    chatContainer.value.scrollTop = newScrollHeight - oldScrollHeight;
                }
            } else {
                // --- 初始加载：直接赋值并滚动到底部 ---
                messages.value = newMessages;
                await scrollToBottom();
            }
        } catch (error) {
            console.error('Fetch history failed:', error);
        } finally {
            isHistoryLoading.value = false;
        }
    };

    // 点击标签发起聊天
    const handleTag = (tag: string) => {
        inputVal.value = tag;
        // 如果当前有会话ID，说明是从历史会话点击的，需要清空以创建新会话
        if (conversationId.value && !isChatting.value) {
            conversationId.value = '';
        }
        handleSend();
    };

    // 发起新对话
    const handleNewChat = async () => {
        if (isLoading.value) return;

        try {
            const res = await post('/chat/new', {});

            conversationId.value = res.data.data._id;
            console.log(conversationId.value)
            conversations.value.push(res.data.data)

            messages.value = [];
            isChatting.value = true;
            inputVal.value = '';
        } catch (error) {
            ElMessage.error('开启新会话失败');
        }
    };

    // 核心：发送消息（流式）
    const handleSend = async () => {
        if (!inputVal.value.trim() || isLoading.value) return;

        // 如果当前没有会话 ID，先创建一个
        if (!conversationId.value && !isChatting.value) {
            await handleNewChat();
        }

        const userContent = inputVal.value;
        messages.value.push({ role: 'user', content: userContent });
        inputVal.value = '';
        isChatting.value = true;
        isLoading.value = true;

        // 在消息队列里先占个位给 AI
        const aiMessageIndex = messages.value.length;

        await scrollToBottom();

        const ctrl = new AbortController();
        let isFirstChunk = true;

        try {
            await fetchEventSource(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/chat/${conversationId.value}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ content: userContent }),
                signal: ctrl.signal,
                onmessage(msg) {
                    if (msg.event === 'FatalError') throw new Error(msg.data);

                    const data = JSON.parse(msg.data);

                    if (data.type === 'answer') {
                        // 实时更新 AI 的回复内容

                        if (isFirstChunk) {
                            messages.value.push({ role: 'assistant', content: '' })
                            isFirstChunk = false
                            isLoading.value = false  // 收到第一个回复后隐藏加载动画
                        }

                        if (messages.value[aiMessageIndex]) {
                            messages.value[aiMessageIndex].content = data.content;
                        }

                        scrollToBottom();
                    } else if (data.type === 'title') {
                        // 如果后端返回了新标题，更新左侧列表里的标题
                        const conv = conversations.value.find(c => c._id === conversationId.value);
                        if (conv) conv.title = data.content;
                    }
                },
                onclose() {
                    isLoading.value = false;
                },
                onerror(err) {
                    isLoading.value = false;
                    ctrl.abort();
                    throw err;
                }
            });
        } catch (err) {
            isLoading.value = false;
            ElMessage.error('对话中断，请稍后重试');
        }
    };

    const clear = () => {
        if (cleanupLoadMoreObserver) {
            cleanupLoadMoreObserver();
            cleanupLoadMoreObserver = null;
        }
    };

    // 对应你 template 里的 setLoadMoreContainerRefWrapper
    const setLoadMoreContainerRefWrapper = (el: HTMLElement) => {
        if (!el) return;

        cleanupLoadMoreObserver = setLoadMoreContainerRef(el, () => fetchChatHistory(true))
    };

    return {
        isCollapsed, inputVal, isLoading, messages, handleSend, tags,
        shouldShowLoadMoreObserver, isChatting, conversations, conversationId,
        handleNewChat, setLoadMoreContainerRefWrapper, handleTag, selectConversation,
        fetchConversations, clear, chatContainer
    };
}
