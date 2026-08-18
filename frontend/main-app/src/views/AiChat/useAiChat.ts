// Vue API 由 unplugin-auto-import 全局注入
import { get, post } from '@/api/request';
import type { AiChat, Conversations } from '@/types/index';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { setLoadMoreContainerRef } from '@/utils/helpers';
import { validateContent } from '@/utils/validation';

// 同时进行的流式回复上限：超过则取消最早发起的那个
const MAX_CONCURRENT_STREAMS = 2;

export function useAiChat() {
    const isCollapsed = ref(true);
    const isChatting = ref(false); // 控制欢迎页和聊天页切换
    const chatContainer = ref<HTMLElement | null>(null);

    const inputVal = ref('');
    const conversationId = ref('');

    // 按会话隔离的状态：消息列表 / 分页完成标记 / AI 回复中标记
    // 切换会话时不再清空旧会话数据，后台流仍可继续写入对应数组
    const messagesMap = ref(new Map<string, AiChat[]>());
    const finishedMap = ref(new Map<string, boolean>());
    const loadingMap = ref(new Map<string, boolean>());

    const messages = computed(() => messagesMap.value.get(conversationId.value) || []);
    const isLoading = computed(() => loadingMap.value.get(conversationId.value) || false);
    const isFinished = computed(() => finishedMap.value.get(conversationId.value) || false);

    const isHistoryLoading = ref(false);
    const conversations = ref<Conversations[]>([]);

    // 进行中的流：convId -> AbortController；streamQueue 记录发起顺序用于超限淘汰
    const ctrlMap = new Map<string, AbortController>();
    const streamQueue: string[] = [];

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
                behavior: 'smooth', // 平滑滚动
            });
        }
    };

    // 获取会话列表
    const fetchConversations = async () => {
        try {
            const res = await get('/chat/conversations');
            conversations.value = res.data.data;
        } catch (error) {
            console.error('获取列表失败', error);
        }
    };

    // 选择某个历史会话
    const selectConversation = async (id: string) => {
        // 如果正在加载（防抖），直接返回
        if (isHistoryLoading.value) return;

        // 切换会话时不取消进行中的流：后台流继续写它自己的会话数组
        conversationId.value = id;
        isChatting.value = true;

        // 仅当该会话从未加载过时才拉历史，避免覆盖已有数据或重复请求
        if (!messagesMap.value.has(id)) {
            messagesMap.value.set(id, []);
            finishedMap.value.set(id, false);
            await fetchChatHistory();
        } else {
            await scrollToBottom();
        }
    };

    /**
    * 获取历史消息（基于游标的向上滚动分页）
    * @param isLoadMore 是否为加载更多（true 为向上拉取，false 为切换会话初始化）
    */
    const fetchChatHistory = async (isLoadMore = false) => {
        const convId = conversationId.value;

        // 1. 状态拦截：正在加载中，或已经加载完毕且是"加载更多"操作，则跳过
        if (isHistoryLoading.value || (isLoadMore && isFinished.value)) return;

        isHistoryLoading.value = true;

        // 2. 确定游标：
        // 加载更多时，取当前列表最顶部（最旧）的消息时间
        // 初始化加载时，游标为空，后端将返回最新的 size 条数据
        const cursor = isLoadMore && messages.value.length > 0
            ? messages.value[0]?.createdAt
            : '';

        try {
            const res = cursor
                ? await get(`/chat/${convId}/history`, { cursor })
                : await get(`/chat/${convId}/history`);
            const newMessages = res.data.data.messages || [];

            // 3. 判断是否加载完成：返回数量小于请求数量，标记不再加载
            if (newMessages.length < 20) {
                finishedMap.value.set(convId, true);
            }

            const arr = messagesMap.value.get(convId) || [];
            if (isLoadMore) {
                // --- 关键点：向上滚动加载的数据拼接 ---
                // 记录加载前的容器高度，用于修正滚动位置（防止内容跳动）
                const oldScrollHeight = chatContainer.value?.scrollHeight || 0;

                // 将老消息塞到数组最前面
                messagesMap.value.set(convId, [...newMessages, ...arr]);

                // 修正滚动条位置：让用户视口停留在加载前的位置
                await nextTick();
                if (chatContainer.value && conversationId.value === convId) {
                    const newScrollHeight = chatContainer.value.scrollHeight;
                    chatContainer.value.scrollTop = newScrollHeight - oldScrollHeight;
                }
            } else {
                // --- 初始加载：直接赋值并滚动到底部 ---
                messagesMap.value.set(convId, newMessages);
                if (conversationId.value === convId) {
                    await scrollToBottom();
                }
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
        // 按当前会话判断：当前会话正在回复时不允许新建，避免切走又开新流造成混乱
        if (isLoading.value) return;

        try {
            const res = await post('/chat/new', {});
            const conv = res.data.data;

            conversationId.value = conv._id;
            conversations.value.push(conv);

            messagesMap.value.set(conv._id, []);
            finishedMap.value.set(conv._id, false);
            isChatting.value = true;
            inputVal.value = '';
        } catch (error) {
            ElMessage.error('开启新会话失败');
        }
    };

    // 结束某个会话的流：清理 controller、出队、解除 loading
    const finalizeStream = (convId: string) => {
        ctrlMap.delete(convId);
        const i = streamQueue.indexOf(convId);
        if (i !== -1) streamQueue.splice(i, 1);
        loadingMap.value.set(convId, false);
    };

    // 超过并发上限时取消最早发起的流
    const evictOldestStream = () => {
        while (streamQueue.length > 0) {
            const oldestId = streamQueue[0];
            // 跳过空项（理论上不应出现，防御性处理）
            if (!oldestId) {
                streamQueue.shift();
                continue;
            }
            const ctrl = ctrlMap.get(oldestId);
            streamQueue.shift();
            if (ctrl) {
                ctrl.abort();
                finalizeStream(oldestId);
                return; // 一次只淘汰一个
            }
        }
    };

    // 核心：发送消息（流式）
    const handleSend = async () => {
        if (isLoading.value) return

        const error = validateContent(inputVal.value, { max: 2000, name: '问题' })
        if (error) return ElMessage.error(error)

        // 如果当前没有会话 ID，先创建一个
        if (!conversationId.value && !isChatting.value) {
            await handleNewChat();
        }

        // 快照：避免切换会话后被闭包内的 conversationId.value 影响写入目标
        const convId = conversationId.value;
        const userContent = inputVal.value.trim();

        if (!messagesMap.value.has(convId)) {
            messagesMap.value.set(convId, []);
            finishedMap.value.set(convId, false);
        }
        const arr = messagesMap.value.get(convId)!;

        arr.push({ role: 'user', content: userContent });
        inputVal.value = '';
        isChatting.value = true;
        loadingMap.value.set(convId, true);

        // 占位索引：基于该会话数组长度，首 chunk 时 push assistant 后正好命中
        const aiMessageIndex = arr.length;

        if (conversationId.value === convId) {
            await scrollToBottom();
        }

        // 并发上限控制：超过则取消最早发起的进行中流
        if (streamQueue.length >= MAX_CONCURRENT_STREAMS) {
            evictOldestStream();
        }

        const ctrl = new AbortController();
        ctrlMap.set(convId, ctrl);
        streamQueue.push(convId);

        let isFirstChunk = true;

        try {
            await fetchEventSource(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/chat/${convId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ content: userContent }),
                signal: ctrl.signal,
                onmessage(msg) {
                    if (msg.event === 'FatalError') throw new Error(msg.data);

                    const data = JSON.parse(msg.data);
                    // 始终写入发起时快照的会话，绝不被中途切换影响
                    const target = messagesMap.value.get(convId);
                    if (!target) return;

                    if (data.type === 'answer') {
                        // 实时更新 AI 的回复内容
                        if (isFirstChunk) {
                            target.push({ role: 'assistant', content: '' });
                            isFirstChunk = false;
                            loadingMap.value.set(convId, false);  // 收到第一个回复后隐藏加载动画
                        }

                        if (target[aiMessageIndex]) {
                            target[aiMessageIndex].content += data.content;
                        }

                        // 仅当前显示的会话才滚动，避免后台流引发视口跳动
                        if (conversationId.value === convId) {
                            scrollToBottom();
                        }
                    } else if (data.type === 'title') {
                        // 如果后端返回了新标题，更新左侧列表里的标题
                        const conv = conversations.value.find(c => c.id === convId);
                        if (conv) conv.title = data.content;
                    } else if (data.type === 'error') {
                        // AI 服务异常：已收到部分回复则把错误填入占位消息，否则用提示框展示
                        loadingMap.value.set(convId, false);
                        const errMsg = data.content || 'AI 服务异常';
                        if (!isFirstChunk && target[aiMessageIndex]) {
                            target[aiMessageIndex].content = errMsg;
                        } else if (conversationId.value === convId) {
                            ElMessage.error(errMsg);
                        }
                    }
                },
                onclose() {
                    finalizeStream(convId);
                },
                onerror(err) {
                    finalizeStream(convId);
                    ctrl.abort();
                    throw err;
                },
            });
        } catch (err) {
            finalizeStream(convId);
            // 主动取消（淘汰或卸载）会抛 AbortError，不应再弹错误提示
            if (ctrl.signal.aborted) return;
            if (conversationId.value === convId) {
                ElMessage.error('对话中断，请稍后重试');
            }
        }
    };

    const clear = () => {
        if (cleanupLoadMoreObserver) {
            cleanupLoadMoreObserver();
            cleanupLoadMoreObserver = null;
        }
        // 组件卸载时中止所有进行中的流，避免后台连接泄漏
        for (const ctrl of ctrlMap.values()) {
            ctrl.abort();
        }
        ctrlMap.clear();
        streamQueue.length = 0;
        loadingMap.value.clear();
    };

    // 对应你 template 里的 setLoadMoreContainerRefWrapper
    const setLoadMoreContainerRefWrapper = (el: HTMLElement) => {
        if (!el) return;
        cleanupLoadMoreObserver = setLoadMoreContainerRef(el, () => fetchChatHistory(true));
    };

    return {
        isCollapsed, inputVal, isLoading, messages, handleSend, tags,
        shouldShowLoadMoreObserver, isChatting, conversations, conversationId,
        handleNewChat, setLoadMoreContainerRefWrapper, handleTag, selectConversation,
        fetchConversations, clear, chatContainer,
    };
}
