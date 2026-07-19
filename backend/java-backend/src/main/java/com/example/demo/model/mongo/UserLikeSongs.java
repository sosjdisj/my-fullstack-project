package com.example.demo.model.mongo;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;

@Data
@Document(collection = "user_like_songs")
@CompoundIndex(name = "userId_songId_unique", def = "{'userId': 1, 'songId': 1}", unique = true)
public class UserLikeSongs {

    @Id
    private String id;

    private Integer userId;
    private String songId;
    private Boolean isLiked;
}
