package com.example.demo.repository.mongo;

import com.example.demo.model.mongo.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ArticleRepository extends MongoRepository<Article, String> {

    Page<Article> findByDeletedNotAndStatus(Boolean deleted, String status, Pageable pageable);

    Optional<Article> findByIdAndDeletedNot(String id, Boolean deleted);

    long countByDeletedNotAndStatus(Boolean deleted, String status);

    List<Article> findByDeletedNotAndStatusOrderByPageViewsDesc(Boolean deleted, String status, Pageable pageable);

    @Aggregation(pipeline = {
        "{ $match: { deleted: { $ne: true }, status: 'PUBLIC' } }",
        "{ $sample: { size: ?0 } }"
    })
    List<Article> findRandomArticles(int size);
}
