import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import type { userInfo } from '@/utils/auth'

// 加载环境变量
dotenv.config();

// 从环境变量获取秘钥
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET 环境变量未设置');
}
//短token
const ACCESS_TOKEN_EXPIRES_IN = '2h'
//长token
const REFRESH_TOKEN_EXPIRES_IN = '7d';

/**
 * 生成 JWT Token
 * @param {Object} payload 要存的用户信息
 * @returns token
 */
export function generateToken(payload: userInfo) {
    const accessToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN
    });
    const refreshToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN
    })

    return {
        accessToken,
        refreshToken
    }
}

/**
 * 仅生成短时效的访问令牌 (Access Token)
 * * 用于“无感续签”场景：当客户端的长 Token (Refresh Token) 校验通过后，
 * 调用此函数生成一个新的短 Token 返回给前端，以维持用户的登录状态。
 * * @param payload - 包含用户核心信息的对象（如 userId, username 等）
 * @returns 返回一个经过签名的新 Access Token 字符串
 */
export function generateAccessToken(payload: userInfo) {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN // 比如 15m 或 2h
    });
}

/**
 * 校验并解析长 Token
 * @param token 前端传入的Token字符串
 * @returns 解析后的用户信息（带类型）/ null（无效/过期）
 */
export function verifyToken(token: string): userInfo | null {
    try {
        return jwt.verify(token, JWT_SECRET) as userInfo;
    } catch (err) {
        console.error('Token 校验失败:', err);
        return null;
    }
}

// 导出秘钥供 express-jwt 中间件使用
export { JWT_SECRET };