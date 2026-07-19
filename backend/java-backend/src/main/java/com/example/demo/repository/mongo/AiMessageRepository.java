package com.example.demo.repository.mongo;

import com.example.demo.model.mongo.AiMessage;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AiMessageRepository extends MongoRepository<AiMessage, String> {

    List<AiMessage> findByConversationIdOrderByCreatedAtDesc(ObjectId conversationId, Pageable pageable);

    List<AiMessage> findByConversationIdAndCreatedAtBeforeOrderByCreatedAtDesc(ObjectId conversationId, java.time.LocalDateTime cursor, Pageable pageable);

    List<AiMessage> findByConversationIdOrderByCreatedAtAsc(ObjectId conversationId, Pageable pageable);
}
