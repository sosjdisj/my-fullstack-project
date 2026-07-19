package com.example.demo.model.mongo;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "ai_messages")
public class AiMessage {

    @Id
    private String id;

    private String conversationId;
    private String role;  // user, assistant, system
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
