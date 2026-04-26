export interface CodeItem {
    code: string;
    expireTime: number;
}

export const codeCache: Record<string, CodeItem> = {};

// 生成6位随机验证码
export function generateVerifyCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// 验证手机号格式
export function validatePhone(phone: string): boolean {
    return /^1[3-9]\d{9}$/.test(phone)
}

// 存储验证码到缓存
export function storeCode(phone: string, code: string, expireTime: number) {
    codeCache[phone] = { code, expireTime }
}

// 获取验证码过期时间（5分钟）
export function getExpireTime(): number {
    return Date.now() + 5 * 60 * 1000
}