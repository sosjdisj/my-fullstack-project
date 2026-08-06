package com.example.demo.websocket;

import com.corundumstudio.socketio.SocketIOServer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ChatSocketIOHandler {

    private final SocketIOServer server;

    /** 构造处理器并注册 Socket.IO 各类事件监听器 */
    public ChatSocketIOHandler(SocketIOServer server) {
        this.server = server;
        registerListeners();
    }

    /** 注册连接、断开及加入/离开文章房间等事件监听器 */
    private void registerListeners() {
        server.addConnectListener(client -> {
            broadcastTotalOnline();
            log.info("Socket.IO connected: {}", client.getSessionId());
        });

        server.addDisconnectListener(client -> {
            broadcastTotalOnline();
            log.info("Socket.IO disconnected: {}", client.getSessionId());
        });

        server.addEventListener("join article", String.class, (client, articleId, ack) -> {
            client.joinRoom(articleId);
            broadcastReaderCount(articleId);
            log.info("Client {} joined article {}", client.getSessionId(), articleId);
        });

        server.addEventListener("leave article", String.class, (client, articleId, ack) -> {
            client.leaveRoom(articleId);
            broadcastReaderCount(articleId);
            log.info("Client {} left article {}", client.getSessionId(), articleId);
        });
    }

    /** 向所有客户端广播当前在线总人数 */
    private void broadcastTotalOnline() {
        server.getBroadcastOperations().sendEvent("total online", server.getAllClients().size());
    }

    /** 向指定文章房间内的客户端广播当前阅读人数 */
    private void broadcastReaderCount(String articleId) {
        int count = (int) server.getAllClients().stream()
                .filter(c -> c.getAllRooms().contains(articleId))
                .count();
        server.getRoomOperations(articleId).sendEvent("reader count", count);
    }
}
