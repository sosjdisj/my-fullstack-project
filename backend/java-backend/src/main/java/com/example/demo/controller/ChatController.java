package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.BusinessException;
import com.example.demo.common.JwtUtil;
import com.example.demo.model.mongo.AiMessage;
import com.example.demo.model.mongo.Conversation;
import com.example.demo.service.ChatService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Stream;

@Slf4j
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Value("${ai-service.url}")
    private String aiServiceUrl;

    private final RestClient restClient;

    public ChatController() {
        this.restClient = RestClient.create();
    }

    @GetMapping("/conversations")
    public ApiResponse<List<Conversation>> getConversations(HttpServletRequest request) {
        JwtUtil.UserInfo auth = (JwtUtil.UserInfo) request.getAttribute("auth");

        if (auth == null) {
            return ApiResponse.success("获取对话列表成功", Collections.emptyList());
        }
        List<Conversation> conversations = chatService.getUserConversations(auth.getUserId());
        return ApiResponse.success("获取对话列表成功", conversations);
    }

    @PostMapping("/new")
    public ApiResponse<Conversation> createConversation(HttpServletRequest request) {
        JwtUtil.UserInfo auth = getAuth(request);
        Conversation conversation = chatService.createConversation(auth.getUserId());
        return ApiResponse.success("创建对话成功", conversation);
    }

    @GetMapping("/{id}/history")
    public ApiResponse<Map<String, Object>> getChatHistory(
            @PathVariable String id,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) LocalDateTime cursor) {
        List<AiMessage> messages = chatService.getChatHistory(id, size, cursor);

        // 构建下一页游标
        LocalDateTime nextCursor = null;
        if (!messages.isEmpty()) {
            nextCursor = messages.get(0).getCreatedAt();
        }

        Map<String, Object> result = new HashMap<>();
        result.put("messages", messages);
        result.put("nextCursor", nextCursor);
        return ApiResponse.success("获取聊天记录成功", result);
    }

    /**
     * 发送消息并获取AI回复（SSE 流式）
     * 调用 Python AI 服务的 SSE 端点获取流式回复
     */
    @PostMapping(value = "/{id}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter sendMessage(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {

        String message = body.get("content");
        if (message == null || message.isBlank()) {
            throw new BusinessException(400, "消息内容不能为空");
        }

        JwtUtil.UserInfo auth = getAuth(request);

        SseEmitter emitter = new SseEmitter(120_000L);

        // 获取 token
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        String finalToken = token != null ? token : "";

        CompletableFuture.runAsync(() -> {
            try {
                StringBuilder fullResponse = new StringBuilder();
                HttpClient client = HttpClient.newHttpClient();
                String requestBody = new ObjectMapper().writeValueAsString(Map.of(
                    "conversation_id", id,
                    "message", message,
                    "user_id", auth.getUserId(),
                    "token", finalToken
                ));

                HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(aiServiceUrl + "/api/ai/chat/stream"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

                HttpResponse<Stream<String>> response = client.send(httpRequest,
                    HttpResponse.BodyHandlers.ofLines());

                response.body().forEach(line -> {
                    if (line.startsWith("data:")) {
                        String data = line.substring(5).trim();
                        if ("[DONE]".equals(data)) return;
                        try {
                            ObjectMapper mapper = new ObjectMapper();
                            Map<String, Object> dataMap = mapper.readValue(data, Map.class);

                            // 处理 token 事件 → 转换为前端约定的 {type:"answer", content} 格式
                            if (dataMap.containsKey("token")) {
                                String content = (String) dataMap.get("token");
                                emitter.send(SseEmitter.event().data(mapper.writeValueAsString(
                                        Map.of("type", "answer", "content", content))));
                                fullResponse.append(content);
                            }
                            // 处理 done 事件 → 通知前端正常结束
                            else if (dataMap.containsKey("conversation_id")) {
                                emitter.send(SseEmitter.event().data(mapper.writeValueAsString(
                                        Map.of("type", "done"))));
                            }
                            // 处理 error 事件 → 转换为前端约定的 {type:"error", content} 格式
                            else if (dataMap.containsKey("error")) {
                                String errorMsg = String.valueOf(dataMap.get("error"));
                                emitter.send(SseEmitter.event().data(mapper.writeValueAsString(
                                        Map.of("type", "error", "content", errorMsg))));
                            }
                        } catch (Exception e) {
                            log.error("SSE send error", e);
                        }
                    }
                });

                emitter.complete();
            } catch (Exception e) {
                log.error("SSE stream error", e);
                String errorMsg = e instanceof java.net.ConnectException
                        ? "AI 服务连接失败，请检查 AI 服务是否已启动"
                        : "AI 服务异常：" + (e.getMessage() != null ? e.getMessage() : "未知错误");
                try {
                    emitter.send(SseEmitter.event().data(
                        new ObjectMapper().writeValueAsString(Map.of(
                            "type", "error",
                            "content", errorMsg
                        ))
                    ));
                } catch (Exception sendErr) {
                    log.error("发送 SSE 错误事件失败", sendErr);
                }
                // 已通过 error 事件通知前端，这里正常结束，避免前端 onerror 重复弹出"对话中断"
                emitter.complete();
            }
        });

        return emitter;
    }

    private JwtUtil.UserInfo getAuth(HttpServletRequest request) {
        JwtUtil.UserInfo auth = (JwtUtil.UserInfo) request.getAttribute("auth");
        if (auth == null) {
            throw new BusinessException(401, "未登录");
        }
        return auth;
    }
}
