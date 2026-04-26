import { Express } from 'express';
import path from 'path';
import { loadRoutes } from '../utils/routeLoader';

/**
 * 初始化所有路由
 * @param app Express 应用实例
 */

export function initRoutes(app: Express) {
    // 获取路由目录的绝对路径
    const routesDir = path.resolve(__dirname, './');
    // 自动加载路由
    loadRoutes(app, routesDir);
}