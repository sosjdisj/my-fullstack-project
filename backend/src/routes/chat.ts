import express from 'express'
import { asyncHandler } from '@/middleware/asyncHandler'
import * as chatController from '@/controller/chat.controller'

const router = express.Router()

// 获取用户的所有对话列表
router.get('/conversations', asyncHandler(chatController.getUserConversations))

// 创建新的对话会话
router.post('/new', asyncHandler(chatController.startNewChat))

// 获取指定对话的历史消息记录（支持游标分页）
router.get('/:id/history', asyncHandler(chatController.getChatHistory))

// 在指定对话中发送消息并获取 AI 回复
router.post('/:id', asyncHandler(chatController.chatOnce))

export default router