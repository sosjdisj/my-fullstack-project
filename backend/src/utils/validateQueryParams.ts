import { Request, Response } from 'express'
import Joi from 'joi';

/**
 * 通用参数校验函数
 * @param data - 要校验的数据
 * @param res - 响应对象（校验失败时直接返回错误响应）
 * @param schema - Joi 校验模式
 * @returns 校验结果，包含 valid 状态和解析后的 data
 */
export function validateParams<T extends 'query' | 'params' | 'body'>(
    data: Request[T],
    res: Response,
    schema: Joi.ObjectSchema<any> | Joi.ArraySchema<string[]>
) {
    const { error, value } = schema.validate(data)

    if (error) {
        res.status(400).json({
            code: 400,
            message: `参数错误：${error.details[0].message}`,
            data: null
        });

        return {
            valid: false,
        };
    }

    return {
        valid: true,
        data: value
    };
}

/**
 * 获取当前登录用户ID
 * @param req - 请求对象（需包含 auth.userId）
 * @param res - 响应对象
 * @returns 用户ID，未登录则返回401响应
 */
export function getAuthenticatedUser(
    req: any,
    res: Response,
    options?: { message?: string }
) {
    const userInfo = req.auth;

    if (!userInfo) {
        res.status(401).json({
            code: 401,
            message: options?.message || "请先登录",
            data: null
        });
        return null
    }

    return userInfo
}