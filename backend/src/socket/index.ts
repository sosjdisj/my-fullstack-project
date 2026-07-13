// src/socket/index.ts
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

export const initSocket = (server: HttpServer) => {
    const allowedOrigins = process.env.CORS_ORIGINS?.split(',').map(s => s.trim()) || ['http://localhost:5173', 'http://localhost:5175'];

    const io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        // --- A. 全站人数逻辑 ---
        // 每当有新连接，向所有人广播最新总人数
        io.emit('total online', io.engine.clientsCount);

        // --- B. 实时阅读人数逻辑 ---
        socket.on('join article', (articleId: string) => {
            socket.join(articleId);

            // 获取该房间人数
            const count = io.sockets.adapter.rooms.get(articleId)?.size || 0;
            io.to(articleId).emit('reader count', count);
        });

        // --- C. 离开房间逻辑 ---
        socket.on('leave article', (articleId: string) => {
            socket.leave(articleId); // 物理退出房间

            // 获取剩下的房间人数并广播
            const count = io.sockets.adapter.rooms.get(articleId)?.size || 0;
            io.to(articleId).emit('reader count', count);
        });

        //连接即将关闭，但还没关
        socket.on('disconnecting', () => {
            // 告诉该用户所在的房间，人少了一个
            socket.rooms.forEach(room => {
                if (room !== socket.id) {
                    const count = io.sockets.adapter.rooms.get(room)?.size || 0 ;
                    io.to(room).emit('reader count', count - 1);
                }
            });
        });

        //连接已经彻底关闭
        socket.on('disconnect', () => {
            // 再次广播全站人数
            io.emit('total online', io.engine.clientsCount);
        });
    });

    return io;
};
