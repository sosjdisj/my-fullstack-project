import express from 'express'
import { asyncHandler } from '@/middleware/asyncHandler'
import * as timelineController from '@/controller/timeline.controller'

const router = express.Router()

router.get('', asyncHandler(timelineController.getTimelineList))

export default router