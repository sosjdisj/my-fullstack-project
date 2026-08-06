package com.example.demo.repository.mongo;

import com.example.demo.model.mongo.UserArticleInteraction;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserArticleInteractionRepository extends MongoRepository<UserArticleInteraction, String> {

    Optional<UserArticleInteraction> findByArticleIdAndUserId(ObjectId articleId, Integer userId);

    long countByArticleIdAndIsLiked(ObjectId articleId, Boolean isLiked);

    long countByArticleIdAndIsCollected(ObjectId articleId, Boolean isCollected);

    Page<UserArticleInteraction> findByUserIdAndIsCollected(Integer userId, Boolean isCollected, Pageable pageable);
}
