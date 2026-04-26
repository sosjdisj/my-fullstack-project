import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/utils/jwt';

// 扩展 Request 接口，添加 auth 属性
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: number;
        username: string;
        [key: string]: any;
      };
    }
  }
}

/**
 * JWT解析中间件（不拒绝无token请求）
 */
export const jwtParser = (req: Request, res: Response, next: NextFunction) => {
  // 从请求头获取 token
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
    const userInfo = verifyToken(token);

    if (userInfo) {
      req.auth = userInfo;
    }
  } 

  // 无论是否有 token，都继续执行后续中间件
  next();
};
