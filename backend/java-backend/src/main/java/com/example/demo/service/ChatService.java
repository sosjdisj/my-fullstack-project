package com.example.demo.service;

import com.example.demo.model.mongo.AiMessage;
import com.example.demo.model.mongo.Conversation;
import com.example.demo.repository.mongo.AiMessageRepository;
import com.example.demo.repository.mongo.ConversationRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private AiMessageRepository aiMessageRepository;

    public List<Conversation> getUserConversations(Integer userId) {
        return conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    public Conversation createConversation(Integer userId) {
        Conversation conversation = new Conversation();
        conversation.setUserId(userId);
        conversation.setTitle("新的对话");
        conversation.setCreatedAt(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());
        return conversationRepository.save(conversation);
    }

    public AiMessage saveChatMessage(String conversationId, String role, String content) {
        AiMessage message = new AiMessage();
        message.setConversationId(conversationId);
        message.setRole(role);
        message.setContent(content);
        message.setCreatedAt(LocalDateTime.now());
        message.setUpdatedAt(LocalDateTime.now());
        AiMessage saved = aiMessageRepository.save(message);
        touchConversation(conversationId);
        return saved;
    }

    public void touchConversation(String conversationId) {
        conversationRepository.findById(conversationId).ifPresent(conversation -> {
            conversation.setUpdatedAt(LocalDateTime.now());
            conversationRepository.save(conversation);
        });
    }

    public List<AiMessage> getHistoryMessages(String conversationId, int limit) {
        PageRequest pageRequest = PageRequest.of(0, limit);
        List<AiMessage> messages = aiMessageRepository
                .findByConversationIdOrderByCreatedAtDesc(new ObjectId(conversationId), pageRequest);
        Collections.reverse(messages);
        return messages;
    }

    public List<AiMessage> getChatHistory(String conversationId, int size, LocalDateTime cursor) {
        PageRequest pageRequest = PageRequest.of(0, size);
        List<AiMessage> messages;
        if (cursor != null) {
            messages = aiMessageRepository
                    .findByConversationIdAndCreatedAtBeforeOrderByCreatedAtDesc(new ObjectId(conversationId), cursor, pageRequest);
        } else {
            messages = aiMessageRepository
                    .findByConversationIdOrderByCreatedAtDesc(new ObjectId(conversationId), pageRequest);
        }
        Collections.reverse(messages);
        return messages;
    }
}
