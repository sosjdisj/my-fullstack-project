package com.example.demo.model.mongo;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "treehole_messages")
public class Treehole {

    @Id
    private String id;

    private String content;
    private Integer userId;
    private LocalDateTime createTime;
    private String reviewStatus;  // PENDING, APPROVED, REJECTED
    private Boolean deleted;
}
