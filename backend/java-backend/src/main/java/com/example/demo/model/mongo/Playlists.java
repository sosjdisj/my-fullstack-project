package com.example.demo.model.mongo;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "playlists")
public class Playlists {

    @Id
    private String id;

    private String name;
    private String creator;
    private String creatorAvatar;
    private String description;
    private String coverImage;
    private Integer playCount;
    private String path;
    private LocalDateTime updateTime;
    private Integer collects;
    private Boolean deleted;
    private LocalDateTime createdAt;
}
