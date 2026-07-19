package com.example.demo.model.mongo;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "Song_tags")
public class SongTags {

    @Id
    private String id;

    private String name;
    private String icon;
    private String desc;
    private Integer songCount;
    private LocalDateTime createTime;
    private String status;  // ACTIVE, INACTIVE
    private Boolean deleted;
}
