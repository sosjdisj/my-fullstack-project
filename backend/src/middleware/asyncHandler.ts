import { Request, Response, NextFunction } from 'express';

/**
 * 封装异步路由处理函数，自动捕获错误并传递给全局错误中间件
 * @param fn 异步路由处理函数
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // 执行异步函数，捕获错误并传给 next()（全局错误中间件会处理）
        fn(req, res, next).catch(next);
    };
};