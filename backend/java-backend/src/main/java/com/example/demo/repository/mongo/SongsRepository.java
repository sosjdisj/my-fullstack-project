package com.example.demo.repository.mongo;

import com.example.demo.model.mongo.Songs;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SongsRepository extends MongoRepository<Songs, String> {

    List<Songs> findByIdInAndDeletedNot(List<String> ids, Boolean deleted);

    Page<Songs> findByPlaylistId(ObjectId playlistId, Pageable pageable);

    List<Songs> findBySongTagsAndDeletedNotOrderByPlaybackDesc(ObjectId songTags, Boolean deleted, Pageable pageable);

    List<Songs> findBySongTagsAndDeletedNotAndCreatedAtAfterOrderByPlaybackDesc(ObjectId songTags, Boolean deleted, java.time.LocalDateTime after, Pageable pageable);

    long countByPlaylistId(ObjectId playlistId);
}
