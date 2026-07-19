package com.example.demo.repository.mongo;

import com.example.demo.model.mongo.Comments;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CommentsRepository extends MongoRepository<Comments, String> {

    Page<Comments> findByArticleIdAndDeletedNotAndReviewStatus(ObjectId articleId, Boolean deleted, String reviewStatus, Pageable pageable);

    long countByArticleIdAndDeletedNotAndReviewStatus(String articleId, Boolean deleted, String reviewStatus);

    long countByArticleId(String articleId);

    boolean existsByUserIdAndCreateTimeAfter(Integer userId, java.time.LocalDateTime after);
}
