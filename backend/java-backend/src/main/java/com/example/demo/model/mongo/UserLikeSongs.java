package com.example.demo.model.mongo;

import lombok.Data;
import org.bson.types.ObjectId;
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
    // songId 字段类型为 ObjectId，与查询类型保持一致，避免 MongoDB 类型不匹配
    private ObjectId songId;
    private Boolean isLiked;
}
