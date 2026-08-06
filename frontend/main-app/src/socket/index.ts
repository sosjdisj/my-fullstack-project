import { io, Socket } from "socket.io-client";

// 根据环境自动切换 URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3002";

export const socket: Socket = io(SOCKET_URL, {
    autoConnect: true, // 保持自动连接
    reconnectionAttempts: 5, // 重连尝试次数
    // 携带 token 用于服务端校验；未登录时传空串，服务端允许匿名连接
    query: {
        token: localStorage.getItem('token') || ''
    }
});