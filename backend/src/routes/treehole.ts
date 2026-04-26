import express from 'express'
import { asyncHandler } from '@/middleware/asyncHandler'
import * as treeholeController from '@/controller/treehole.controller'

const router = express.Router()

//获取弹幕
router.get('', asyncHandler(treeholeController.getMessage))

// 弹幕发送接口
router.post('', asyncHandler(treeholeController.sendMessage))

export default router