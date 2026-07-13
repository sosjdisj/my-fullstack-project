import { Request, Response } from 'express'
import * as authService from '@/service/auth.service'
import { generateAccessToken, generateToken, verifyToken } from '@/utils/jwt'
import { codeCache } from '@/controller/sendCode.controller'
import { registerSchema } from '@/utils/validationSchemas'
import { validateParams } from '@/utils/validateQueryParams'
import { getTokenFromRedis, saveTokenToRedis } from '@/service/token.service'

//密码：qw131420#

// 登录
export async function login(req: Request, res: Response) {
    const { username, password } = req.body

    // 检验是否有这个人
    const user = await authService.verifyLogin(username, password)

    if (user === null) {
        return res.status(404).json({
            code: 403,
            message: '用户不存在'
        })
    }

    if (user === false) {
        return res.status(404).json({
            code: 403,
            message: '密码错误'
        })
    }

    // 🌟 新增：先检查Redis中是否存在该用户的有效token
    const cachedToken = await getTokenFromRedis(user.user_id)

    if (cachedToken) {
        // Redis中存在有效token,直接返回（无需重新生成）
        console.log(`使用Redis缓存的token, userId: ${user.user_id}`)

        // 仍需设置 refreshToken 到 HttpOnly Cookie（因为可能cookie也过期了）
        const { refreshToken } = generateToken(
            {
                userId: user.user_id,
                username: user.username,
                cover: user.avatar,
                signature: user.signature
            }
        )

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        })

        return res.status(200).json({
            code: 200,
            message: '登录成功（使用缓存token）',
            data: {
                token: cachedToken.accessToken,
                username: user.username,
                avatar: user.avatar,
                signature: user.signature
            }
        })
    }

    // Redis中无有效token,生成新token
    const { accessToken, refreshToken } = generateToken(
        {
            userId: user.user_id,
            username: user.username,
            cover: user.avatar,
            signature: user.signature
        }
    )

    // 🌟 新增：将accessToken存入Redis（供子应用和主应用共享）
    await saveTokenToRedis(user.user_id, accessToken, {
        username: user.username,
        cover: user.avatar,
        signature: user.signature
    })

    // 关键：设置 refreshToken 到 HttpOnly Cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // 核心！禁止前端 JS 访问
        secure: process.env.NODE_ENV === 'production', // 生产环境仅 HTTPS 传输
        sameSite: 'strict', // 防止 CSRF 攻击
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天有效期（和 refreshToken 一致）
        path: '/' // 全站可用
    })

    return res.status(200).json({
        code: 200,
        message: '登录成功',
        data: {
            token: accessToken,
            username: user.username,
            avatar: user.avatar,
            signature: user.signature
        }
    })
}

// 注册
export async function register(req: Request, res: Response) {
    const validateResult = validateParams(req.body, res, registerSchema)

    if (!validateResult.valid) return

    const { username, password, phone, code } = validateResult.data

    // 检查手机号是否已注册
    const phoneExists = await authService.checkPhoneExists(phone)
    if (phoneExists) {
        return res.status(400).json({
            code: 400,
            message: '该手机号已注册'
        })
    }

    // 验证验证码
    const cacheItem = codeCache[phone]
    if (!cacheItem) {
        return res.status(400).json({
            code: 400,
            message: '验证码不存在'
        })
    }

    if (cacheItem.code !== code) {
        return res.status(400).json({
            code: 400,
            message: '验证码错误'
        })
    }

    if (cacheItem.code.length < 6) {
        return res.status(400).json({
            code: 400,
            message: '验证码格式错误，必须为6位数字'
        })
    }

    if (Date.now() > cacheItem.expireTime) {
        delete codeCache[phone]
        return res.status(400).json({
            code: 400,
            msg: '验证码已过期'
        })
    }

    // 注册用户
    const newUser = await authService.registerUser(username, password, phone)

    // 清理验证码缓存（避免重复使用）
    delete codeCache[phone]

    // 生成token
    const { accessToken, refreshToken } = generateToken(
        {
            userId: newUser.user_id,
            username: newUser.username,
            cover: newUser.cover,
            signature: newUser.signature
        }
    )

    // 关键：设置 refreshToken 到 HttpOnly Cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // 核心！禁止前端 JS 访问
        secure: process.env.NODE_ENV === 'production', // 生产环境仅 HTTPS 传输
        sameSite: 'strict', // 防止 CSRF 攻击
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天有效期（和 refreshToken 一致）
        path: '/' // 全站可用
    })

    return res.status(200).json({
        code: 200,
        message: '注册成功',
        data: {
            token: accessToken,
            username,
            avatar: newUser.cover
        }
    })
}

/**
 * 访问令牌续签 (无感刷新)
 * 逻辑：校验 Cookie 中的长 Token，通过后提取 Payload 重新签发短 Token。
 * @param req - Request 对象，需配合 cookie-parser 获取 req.cookies
 * @param res - Response 对象
 */
export async function refreshToken(req: Request, res: Response) {
    // 1. 从 HttpOnly Cookie 中获取长 Token
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ code: 401, message: '会话已过期，请重新登录' });
    }

    // 2. 校验长 Token 的合法性
    // verifyToken 内部会执行 jwt.verify，如果过期或被篡改会返回 null
    const decoded = verifyToken(refreshToken);

    if (!decoded) {
        return res.status(403).json({ code: 403, message: '刷新令牌无效或已过期' });
    }

    /**
     * 3. 关键点：从解析出来的 Payload 中提取用户信息
     * 此时 decoded 包含了登录时存入的 { userId, username }
     */
    const newAccessToken = generateAccessToken({
        userId: decoded.userId,
        username: decoded.username,
        cover: decoded.cover,
        signature: decoded.signature
    });

    // 4. 返回新的短 Token 给前端
    return res.status(200).json({
        code: 200,
        message: '续签成功',
        data: {
            token: newAccessToken,
            username: decoded.username,
            avatar: decoded.cover,
            signature: decoded.signature
        }
    });

}