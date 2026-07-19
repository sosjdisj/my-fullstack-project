package com.example.demo.model.mongo;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "articles_comments")
public class Comments {

    @Id
    private String id;

    private Integer userId;
    private String articleId;
    private String content;
    private LocalDateTime createTime;
    private String reviewStatus;  // APPROVED, REJECTED
    private Boolean deleted;
}
