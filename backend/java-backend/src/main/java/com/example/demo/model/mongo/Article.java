package com.example.demo.model.mongo;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.LocalDateTime;

@Data
@Document(collection = "articles")
public class Article {

    @Id
    private String id;

    private String category;
    private String tag;
    private String cover;
    private String title;
    private Integer author;
    private Integer wordCount;
    private Integer pageViews;
    private Integer likes;
    private Integer collects;
    private LocalDateTime published;
    private LocalDateTime updated;
    private String content;
    private String status;  // PUBLIC, DRAFT, RECYCLE
    private Boolean deleted;
    private LocalDateTime createdAt;
}
