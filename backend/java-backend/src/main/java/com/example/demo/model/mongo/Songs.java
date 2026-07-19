package com.example.demo.model.mongo;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "Songs")
public class Songs {

    @Id
    private String id;

    private String name;
    private String singer;
    private String cover;
    private String duration;
    private Integer playback;
    private String playlistId;
    private Integer likes;
    private String songTags;
    private Boolean deleted;
    private LocalDateTime createdAt;
}
