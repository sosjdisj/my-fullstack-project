import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import { initRoutes } from '@/routes/index'
import { connectDB } from '@/config/db'
import { errorHandler } from '@/middleware/errorHandler'
import { jwtParser } from '@/middleware/jwtParser';
import { createServer } from 'http'; // 1. 引入 http
import { initSocket } from '@/socket/index'
import cookieParser from 'cookie-parser'; // 1. 引入 cookie-parser

// 加载环境变量
dotenv.config();

// 2. 创建 Express 应用实例
const app = express();
const httpServer = createServer(app);

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5175'],
    credentials: true,
    // exposedHeaders: ['Content-Type']
}))
app.use(cookieParser())
app.use(express.json());

// 使用自定义JWT解析中间件
app.use(jwtParser);

// 3. 定义端口号（建议用 3000 以上，避免和前端端口冲突）
const port = 3001;

initSocket(httpServer)
// 连接数据库
connectDB()
// 初始化所有路由
initRoutes(app)

app.use(errorHandler);

httpServer.listen(port, () => {
    console.log(`Express 服务已启动：http://localhost:${port}`);
    console.log(`Socket.io 已挂载完毕`);
})
