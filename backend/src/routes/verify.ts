import express from 'express'
import { prisma } from '@/config/db'

const router = express.Router()

router.get('', async (req: any, res) => {

    const user = req.auth

    // 未认证的情况
    if (!user) {
        return res.status(401).json({
            code: 401,
            message: '验证失败'
        })
    }

    const userInfo = await prisma.user.findFirst({
        where: {
            user_id: user?.userId,
            deleted: 0
        }
    })

    return res.status(200).json({
        code: 200,
        message: 'tokne验证成功',
        data: {
            username: userInfo?.username,
            avatar: userInfo?.cover,
            signature: userInfo?.signature
        }
    })

})

export default router