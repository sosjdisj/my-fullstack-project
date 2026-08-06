package com.example.demo.model.mongo;

import lombok.Data;
import org.bson.types.ObjectId;
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
    // articleId 字段类型为 ObjectId，与 Article._id 类型保持一致，避免 MongoDB 类型不匹配
    private ObjectId articleId;
    private Boolean isLiked;
    private Boolean isCollected;
}
