import { Config } from "@alicloud/openapi-client"
import Dysmsapi from '@alicloud/dysmsapi20170525'
import { SendSmsRequest } from '@alicloud/dysmsapi20170525'

// 短信配置（企业中建议从环境变量/配置中心读取，而非硬编码）
const smsConfig = {
    accessKeyId: process.env.ALIYUN_SMS_ACCESS_KEY || '你的RAM用户AK',
    accessKeySecret: process.env.ALIYUN_SMS_SECRET || '你的RAM用户SK',
    signName: process.env.ALIYUN_SMS_SIGN || '你的签名',
    templateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE || '你的模板CODE',
    endpoint: 'dysmsapi.aliyuncs.com'
}

/**
 * 创建阿里云短信客户端（封装为私有方法）
 * @returns {Dysmsapi} 短信客户端实例
 */
function createClient(): Dysmsapi {
    const config = new Config({
        accessKeyId: smsConfig.accessKeyId,
        accessKeySecret: smsConfig.accessKeySecret,
        timeout: 5000 // 5秒超时，避免无限等待
    })
    config.endpoint = smsConfig.endpoint
    return new Dysmsapi(config)
}

export async function sendVerifyCode(code: string, phone: string) {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
        throw new Error('手机号格式错误')
    }
    if (!code || code.length !== 6) {
        throw new Error('验证码必须是6位数字')
    }

    const client = createClient()

    try {
        // 关键：创建 SendSmsRequest 对象并设置参数
        const sendSmsRequest = new SendSmsRequest({
            phoneNumbers: phone,
            signName: smsConfig.signName,
            templateCode: smsConfig.templateCode,
            templateParam: JSON.stringify({ code })
        })

        // 发送短信（传入 Request 对象）
        const response = await client.sendSms(sendSmsRequest)

        if (!response.body) {
            throw new Error('阿里云短信接口响应体为空')
        }

        // 校验阿里云返回结果
        if (response.body.code !== 'OK') {
            throw new Error(`短信发送失败：${response.body.message || '未知错误'}`)
        }
        return true
    } catch (e) {

        if (e instanceof Error) {
            console.error(`发送短信给${phone}失败：`, e.message)
        } else {
            console.error(`发送短信给${phone}失败：`, e)
        }
        return false
    }
}