package com.example.demo.websocket;

import com.corundumstudio.socketio.SocketIOServer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ChatSocketIOHandler {

    private final SocketIOServer server;

    public ChatSocketIOHandler(SocketIOServer server) {
        this.server = server;
        registerListeners();
    }

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

    private void broadcastTotalOnline() {
        server.getBroadcastOperations().sendEvent("total online", server.getAllClients().size());
    }

    private void broadcastReaderCount(String articleId) {
        int count = (int) server.getAllClients().stream()
                .filter(c -> c.getAllRooms().contains(articleId))
                .count();
        server.getRoomOperations(articleId).sendEvent("reader count", count);
    }
}
