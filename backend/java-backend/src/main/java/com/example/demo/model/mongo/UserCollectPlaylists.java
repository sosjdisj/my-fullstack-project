package com.example.demo.model.mongo;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;

@Data
@Document(collection = "user_playlist_collections")
@CompoundIndex(name = "userId_playlistId_unique", def = "{'userId': 1, 'playlistId': 1}", unique = true)
public class UserCollectPlaylists {

    @Id
    private String id;

    private Integer userId;
    // playlistId 字段类型为 ObjectId，与查询类型保持一致，避免 MongoDB 类型不匹配
    private ObjectId playlistId;
    private Boolean isCanceled;
}
