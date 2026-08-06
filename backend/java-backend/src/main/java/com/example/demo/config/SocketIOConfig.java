package com.example.demo.config;

import com.corundumstudio.socketio.AuthorizationListener;
import com.corundumstudio.socketio.AuthorizationResult;
import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.HandshakeData;
import com.corundumstudio.socketio.SocketIOServer;
import com.example.demo.common.JwtUtil;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SocketIOConfig implements CommandLineRunner {

    @Value("${socketio.port}")
    private int port;

    @Value("${socketio.host:127.0.0.1}")
    private String host;

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    private final JwtUtil jwtUtil;

    private SocketIOServer server;

    /** 创建 Socket.IO 服务端实例，配置端口、主机及 Origin+JWT 认证策略 */
    @Bean
    public SocketIOServer socketIOServer() {
        Configuration config = new Configuration();
        config.setPort(port);
        config.setHostname(host);
        // 认证 + CORS 校验：
        // 1. Origin 必须在白名单中（拒绝 null/非浏览器请求，防止服务端到服务端的非法连接）
        // 2. 若客户端携带了 token（query 参数），必须有效；未携带则允许匿名连接（用于阅读计数等公开功能）
        config.setAuthorizationListener(new AuthorizationListener() {
            private final List<String> originWhitelist = Arrays.asList(allowedOrigins.split(","));

            /** 校验握手请求的 Origin 白名单及可选 JWT，决定是否允许建立连接 */
            @Override
            public AuthorizationResult getAuthorizationResult(HandshakeData data) {
                String origin = data.getHttpHeaders().get("Origin");
                if (origin == null || !originWhitelist.contains(origin)) {
                    return new AuthorizationResult(false);
                }
                List<String> tokenParams = data.getUrlParams().get("token");
                if (tokenParams != null && !tokenParams.isEmpty()) {
                    String token = tokenParams.get(0);
                    JwtUtil.UserInfo userInfo = jwtUtil.verifyToken(token);
                    if (userInfo == null) {
                        return new AuthorizationResult(false);
                    }
                }
                return new AuthorizationResult(true);
            }
        });
        server = new SocketIOServer(config);
        return server;
    }

    /** 应用启动时启动 Socket.IO 服务 */
    @Override
    public void run(String... args) {
        server.start();
    }

    /** 应用关闭时停止 Socket.IO 服务，释放端口 */
    @PreDestroy
    public void stop() {
        if (server != null) {
            server.stop();
        }
    }
}
