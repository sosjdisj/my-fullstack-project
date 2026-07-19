package com.example.demo.model.mongo;

import lombok.Data;
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
    private String playlistId;
    private Boolean isCanceled;
}
