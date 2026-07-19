package com.example.demo.model.mongo;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;

@Data
@Document(collection = "user_article_interactions")
@CompoundIndex(name = "userId_articleId_unique", def = "{'userId': 1, 'articleId': 1}", unique = true)
public class UserArticleInteraction {

    @Id
    private String id;

    private Integer userId;
    private String articleId;
    private Boolean isLiked;
    private Boolean isCollected;
}
