import { getAgent } from "@/service/agent.service";
import { getAuthenticatedUser, validateParams } from "@/utils/validateQueryParams";
import { chat, idSchema, cursorPaginationSchema } from '@/utils/validationSchemas'
import { Request, Response } from 'express'
import * as chatService from '@/service/chat.service'
import { retrieveRelevantChunks, buildRagContext, buildRagPrompt, buildMultiTurnQuery } from '@/service/rag.service'
import { AIMessage } from "@langchain/core/messages";


/**
 * 获取当前用户的所有对话列表
 * @param req - Express 请求对象
 * @param res - Express 响应对象
 * @returns 返回用户的对话列表
 */
export async function getUserConversations(req: Request, res: Response) {
    if (!req.auth) return res.status(200).json({
        code: 200,
        message: '登陆后获取对话数据哦~',
        data: []
    })

    const { userId } = req.auth
    const conversations = await chatService.getUserConversations(userId)

    return res.status(200).json({
        code: 200,
        message: '获取成功',
        data: {
            conversations
        }
    })
}

/**
 * 创建新的对话会话
 * @param req - Express 请求对象
 * @param res - Express 响应对象
 * @returns 返回新创建的对话信息
 */
export async function startNewChat(req: Request, res: Response) {
    if (!req.auth) return res.status(401).json({ message: '还未登录' });

    const { userId } = req.auth;
    const newChat = await chatService.createConversation(userId);

    return res.status(200).json({
        code: 200,
        message: '新会话已开启',
        data: newChat
    });
}

/**
 * 发送单条消息并获取 AI 回复
 * @param req - Express 请求对象，包含消息内容和对话 ID
 * @param res - Express 响应对象
 * @returns 返回 AI 助手的回复消息
 */
export async function chatOnce(req: Request, res: Response) {
    const userInfo = getAuthenticatedUser(req, res)

    if (!userInfo) return;

    const bodyValidation = validateParams(req.body, res, chat)

    if (!bodyValidation.valid) return

    const paramsValidation = validateParams(req.params, res, idSchema)

    if (!paramsValidation.valid) return;

    const { content } = bodyValidation.data
    const { id } = paramsValidation.data

    // 1. 设置 SSE 响应头
    res.status(200); // 显式设置状态码
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const history = await chatService.getHistoryMessages(id)

    // RAG 检索，失败时降级为普通对话
    let enhancedContent = content
    try {
        const searchQuery = buildMultiTurnQuery(history, content, 3)
        const ragResults = await retrieveRelevantChunks(searchQuery, 5, 20)
        const ragContext = buildRagContext(ragResults)
        enhancedContent = buildRagPrompt(content, ragContext)
    } catch (error) {
        console.error('[RAG] 检索失败，降级为普通对话:', error)
    }

    const agent = await getAgent();

    // 2. 调用 AI 并获取流 (假设你的 agent 支持 stream)
    const stream = await agent.stream(
        { messages: [...history, { role: "user", content: enhancedContent }] },
        { streamMode: "messages" }
    );

    let fullAnswer = "";

    for await (const [message, _] of stream) {
        // 1. 过滤：只处理 AI 的回复内容
        // 这里用 message.type 替代已弃用的 _getType()
        if (message.type === "ai") {

            // 2. 过滤：排除 AI 发起工具调用的中间状态 (使用 instanceof 解决 TS 报错)
            const isToolCall = message instanceof AIMessage &&
                message.tool_calls &&
                message.tool_calls.length > 0;

            if (!isToolCall) {
                const text = message.content;

                if (typeof text === 'string' && text.length > 0) {
                    fullAnswer += text;

                    // 推送给前端
                    res.write(`data: ${JSON.stringify({ type: 'answer', content: fullAnswer })}\n\n`);
                }
            }
        }
        // 注意：message.type 为 "tool" 的消息（即 JSON 结果）在这里会被自动跳过
    }

    // 4. AI 回复结束后逻辑
    if (history.length === 0) {
        const title = await chatService.generateAndSaveTitle(id, content);
        res.write(`data: ${JSON.stringify({ type: 'title', content: title })}\n\n`);
    }

    // 【修改点 3】：务必加上 await，否则主线程结束了数据库还没存完，可能会导致连接过早关闭

    await chatService.saveChatMessage(id, 'user', content)

    if (fullAnswer && fullAnswer.trim() !== "") {
        await chatService.saveChatMessage(id, 'assistant', fullAnswer);
    }

    await chatService.touchConversation(id)

    // 记得结束响应
    res.end();
}

/**
 * 获取指定对话的历史消息记录（支持游标分页）
 * @param req - Express 请求对象，包含对话 ID 和分页参数
 * @param res - Express 响应对象
 * @returns 返回对话历史消息列表
 */
export async function getChatHistory(req: Request, res: Response) {
    const queryValidation = validateParams(req.query, res, cursorPaginationSchema)

    if (!queryValidation.valid) return;

    const paramsValidation = validateParams(req.params, res, idSchema)

    if (!paramsValidation.valid) return;

    const { size, cursor } = queryValidation.data
    const { id } = paramsValidation.data

    const chatHistory = await chatService.getChatHistory(id, size, cursor)

    return res.status(200).json({
        code: 200,
        messagge: '查询成功',
        data: {
            chatHistory
        }
    })
}