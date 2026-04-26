import Conversation from '@/models/Conversations'
import Message from '@/models/Ai_Message'
import { getAgent } from '@/service/agent.service';

/**
 * 获取指定对话的历史记录
 * 作用：从数据库捞出最近几轮对话，翻转并格式化，直接喂给 AI
 */
export async function getHistoryMessages(conversationId: string, limit: number = 10) {
    if (!conversationId) return [];

    const rawMessages = await Message.find({
        conversationId: conversationId
    })
        .sort({ createdAt: -1 }) // 先取最新的
        .limit(limit)
        .lean();

    // 翻转数组（变为：旧 -> 新），并映射为 LangChain 角色格式
    return rawMessages.reverse().map(msg => ({
        role: msg.role,
        content: msg.content
    }));
}

export async function createConversation(userId: number) {
    return await Conversation.create({
        userId,
        title: '新的对话', // 默认标题，后面可以根据第一句话自动生成
        createdAt: new Date(),
        updatedAt: new Date()
    });
}

/**
 * 保存对话消息
 * 作用：同时存入数据库，并触发对话表的活跃时间更新
 */
export async function saveChatMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string
) {
    // 1. 创建消息记录
    const message = await Message.create({
        conversationId: conversationId,
        role,
        content
    });

    return message;
}

/**
 * 触碰会话，更新活跃时间
 */
export async function touchConversation(conversationId: string) {
    if (!conversationId) return;

    await Conversation.findByIdAndUpdate(conversationId, {
        $set: { updatedAt: new Date() } // 使用 $set 明确更新字段
    });
}

/**
 * 获取用户的全部对话列表
 * 作用：给前端侧边栏展示历史记录清单
 */
export async function getUserConversations(userId: number) {
    return await Conversation.find({ userId })
        .select('-userId')
        .sort({ updatedAt: -1 })
        .lean();
}

// 专门用来总结标题的函数
export async function generateAndSaveTitle(conversationId: string, userContent: string) {
    const agent = await getAgent();
    const summaryResponse = await agent.invoke({
        messages: [
            {
                role: "system",
                content: "你是一个标题生成助手。请根据用户的输入内容，总结一个 10 字以内的简短标题，不要包含标点符号。"
            },
            { role: "user", content: userContent }
        ]
    });

    // 从 messages 数组中提取最后一条 AI 消息的内容
    const messages = summaryResponse.messages || [];
    const lastMessage = messages[messages.length - 1];
    const title = (lastMessage?.content || '新对话').trim();
    // 更新数据库里的 Conversation 标题
    await Conversation.findByIdAndUpdate(conversationId, { title });

    return title
}

/**
 * 获取聊天历史记录（支持向上分页）
 * @param conversationId 会话ID
 * @param limit 每页获取条数
 * @param cursor 游标（当前页面最顶部消息的 ID）
 */
export async function getChatHistory(
    conversationId: string,
    limit: number = 20,
    cursor?: string
) {
    // 1. 构建查询条件
    const query: any = { conversationId };

    // 2. 如果存在游标，查询比该时间更早的消息
    if (cursor) {
        const cursorDate = new Date(cursor);
        query.createdAt = { $lt: cursorDate };
    }

    // 3. 执行查询
    const rawMessages = await Message.find(query)
        .sort({ createdAt: -1 }) // 关键：按时间倒序取最新的
        .limit(limit)
        .lean();

    /**
     * 注意：
     * 因为我们用了 .sort({ createdAt: -1 })，查出来的数组是 [最新, 稍旧, 最旧]
     * 但前端展示通常需要 [最旧 -> 最新] 的顺序，所以这里要 reverse()
     */
    return rawMessages.reverse().map(msg => ({
        id: msg._id.toString(),
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt
    }));
}