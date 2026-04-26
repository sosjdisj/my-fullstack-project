import express from 'express'
import { asyncHandler } from '@/middleware/asyncHandler'
import { sendCode, codeCache } from '@/controller/sendCode.controller'

const router = express.Router()

// 发送验证码
router.post('', asyncHandler(sendCode))

// 导出codeCache以便其他模块使用
export { codeCache }

export default router