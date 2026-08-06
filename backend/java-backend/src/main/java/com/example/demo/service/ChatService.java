package com.example.demo.service;

import com.example.demo.common.BusinessException;
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

    /** 获取用户的所有会话列表，按更新时间倒序 */
    public List<Conversation> getUserConversations(Integer userId) {
        return conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    /** 为用户新建一个对话 */
    public Conversation createConversation(Integer userId) {
        Conversation conversation = new Conversation();
        conversation.setUserId(userId);
        conversation.setTitle("新的对话");
        conversation.setCreatedAt(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());
        return conversationRepository.save(conversation);
    }

    /** 保存一条聊天消息并更新会话的最后更新时间 */
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

    /** 更新会话的最后更新时间 */
    public void touchConversation(String conversationId) {
        conversationRepository.findById(conversationId).ifPresent(conversation -> {
            conversation.setUpdatedAt(LocalDateTime.now());
            conversationRepository.save(conversation);
        });
    }

    /** 获取会话最近若干条历史消息，按时间正序返回 */
    public List<AiMessage> getHistoryMessages(String conversationId, int limit) {
        PageRequest pageRequest = PageRequest.of(0, limit);
        List<AiMessage> messages = aiMessageRepository
                .findByConversationIdOrderByCreatedAtDesc(new ObjectId(conversationId), pageRequest);
        Collections.reverse(messages);
        return messages;
    }

    /**
     * 拉取会话历史消息，同时校验会话归属，防止越权读取他人对话
     */
    public List<AiMessage> getChatHistory(String conversationId, int size, LocalDateTime cursor, Integer userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new BusinessException(404, "会话不存在"));
        if (!conversation.getUserId().equals(userId)) {
            throw new BusinessException(403, "无权访问该会话");
        }

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

    /**
     * 校验会话归属，供 Controller 在 SSE 发送消息前调用
     */
    public void assertConversationOwnedByUser(String conversationId, Integer userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new BusinessException(404, "会话不存在"));
        if (!conversation.getUserId().equals(userId)) {
            throw new BusinessException(403, "无权访问该会话");
        }
    }
}
