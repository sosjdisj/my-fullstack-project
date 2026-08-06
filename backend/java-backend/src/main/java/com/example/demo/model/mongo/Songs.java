package com.example.demo.model.mongo;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@Document(collection = "songs")
public class Songs {

    @Id
    private String id;

    private String name;
    private String singer;
    private String cover;
    private String path;
    private String lrcPath;  // 歌词文件地址（可选，为空表示无歌词）
    private String duration;
    private Integer playback;
    @Field("playlist_id")
    private String playlistId;
    private Integer likes;
    @Field("song_tags")
    private String songTags;
    private Boolean deleted;
    private LocalDateTime createdAt;
}
