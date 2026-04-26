import { Request, Response } from 'express'
import { generateVerifyCode, storeCode, getExpireTime, codeCache } from '@/service/sendCode.service'
import { validateParams } from '@/utils/validateQueryParams'
import { phonSchema } from '@/utils/validationSchemas'
import { sendVerifyCode } from '@/utils/smsUtil'

// 发送验证码
export async function sendCode(req: Request, res: Response) {

    const validateResult = validateParams(req.body, res, phonSchema)

    if (!validateResult.valid) return;

    const { phone } = validateResult.data

    // 生成 6 位随机验证码
    const verifyCode = generateVerifyCode()
    // 设置 5 分钟过期时间
    const expireTime = getExpireTime()

    // 存储验证码到缓存
    storeCode(phone, verifyCode, expireTime)

    // 发送短信到用户手机
    const sendResult = await sendVerifyCode(verifyCode, phone)

    if (!sendResult) {
        return res.status(500).json({
            code: 500,
            message: '短信发送失败，请稍后重试',
            data: null
        })
    }

    return res.status(200).json({
        code: 200,
        message: '验证码发送成功',
        data: null
    })
}

// 导出codeCache以便其他模块使用
export { codeCache }