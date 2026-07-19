package com.example.demo.config;

import com.corundumstudio.socketio.AuthorizationListener;
import com.corundumstudio.socketio.AuthorizationResult;
import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.HandshakeData;
import com.corundumstudio.socketio.SocketIOServer;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class SocketIOConfig implements CommandLineRunner {

    @Value("${socketio.port}")
    private int port;

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    private SocketIOServer server;

    @Bean
    public SocketIOServer socketIOServer() {
        Configuration config = new Configuration();
        config.setPort(port);
        config.setHostname("0.0.0.0");
        // CORS 校验：只允许白名单来源
        config.setAuthorizationListener(data -> {
            String origin = data.getHttpHeaders().get("Origin");
            boolean allowed = origin == null || Arrays.asList(allowedOrigins.split(",")).contains(origin);
            return new AuthorizationResult(allowed);
        });
        server = new SocketIOServer(config);
        return server;
    }

    @Override
    public void run(String... args) {
        server.start();
    }

    @PreDestroy
    public void stop() {
        if (server != null) {
            server.stop();
        }
    }
}
