import { Express } from 'express';
import fs from 'fs';
import path from 'path';

/**
 * 自动加载路由
 * @param app Express 应用实例
 * @param routesDir 路由文件目录
 */
export function loadRoutes(app: Express, routesDir: string) {
    // 读取路由目录下的所有文件
    const files = fs.readdirSync(routesDir);

    files.forEach((file) => {
        // 过滤掉非 ts/js 文件、index 文件（避免循环导入）
        if (!file.endsWith('.ts') && !file.endsWith('.js')) return;
        if (file === 'index.ts' || file === 'index.js') return;

        // 获取文件路径
        const filePath = path.join(routesDir, file);
        // 获取文件的模块名（如 user.ts → user，作为接口前缀 /api/user）
        const moduleName = path.basename(file, path.extname(file));
        // 导入路由模块
        const router = require(filePath).default;

        // 统一挂载路由：前缀为 /api/模块名（如 /api/user、/api/goods）
        const prefix = `/api/${moduleName}`;
        app.use(prefix, router);

    });
}