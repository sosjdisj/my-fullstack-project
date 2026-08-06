package com.example.demo.model.mongo;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "articles_comments")
public class Comments {

    @Id
    private String id;

    private Integer userId;
    // articleId 字段类型为 ObjectId，与查询类型保持一致，避免 MongoDB 类型不匹配
    private ObjectId articleId;
    private String content;
    private LocalDateTime createTime;
    private String reviewStatus;  // APPROVED, REJECTED
    private Boolean deleted;
}
