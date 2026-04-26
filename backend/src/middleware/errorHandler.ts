import { Request, Response, NextFunction } from 'express';

/**
 * Express 全局错误处理中间件（必须放在所有路由之后）
 * @param err 错误对象
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一步中间件
 */
export const errorHandler = (
    err: Error & { statusCode?: number; code?: string },
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // 企业级：打印错误日志（生产环境建议用 winston/pino 等日志库）
    console.error(`[全局错误] ${req.method} ${req.originalUrl}`, err);

    // 统一返回格式
    const statusCode = err.statusCode || 500; // 自定义状态码优先，否则500
    res.status(statusCode).json({
        code: statusCode,
        message: err.message || '服务器内部错误',
        // 开发环境返回错误栈，生产环境隐藏
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};