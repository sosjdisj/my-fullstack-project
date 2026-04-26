import express from 'express'
import { asyncHandler } from '@/middleware/asyncHandler'
import * as authController from '@/controller/auth.controller'

const router = express.Router()

// 登录
router.post('/login', asyncHandler(authController.login))

// 注册
router.post('/register', asyncHandler(authController.register))

// 3. 编写刷新的路由
router.post('/refresh-token', asyncHandler(authController.refreshToken))

export default router