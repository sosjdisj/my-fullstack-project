package com.example.demo.repository.mongo;

import com.example.demo.model.mongo.Treehole;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TreeholeRepository extends MongoRepository<Treehole, String> {

    List<Treehole> findByDeletedNotAndReviewStatusOrderByCreateTimeDesc(Boolean deleted, String reviewStatus, Pageable pageable);

    boolean existsByUserIdAndCreateTimeAfterAndDeletedNotAndReviewStatus(Integer userId, java.time.LocalDateTime after, Boolean deleted, String reviewStatus);
}
