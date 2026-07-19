package com.example.demo.repository.mongo;

import com.example.demo.model.mongo.Playlists;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PlaylistsRepository extends MongoRepository<Playlists, String> {

    Page<Playlists> findByDeletedNotOrderByPlayCountDesc(Boolean deleted, Pageable pageable);

    Optional<Playlists> findByIdAndDeletedNot(String id, Boolean deleted);

    List<Playlists> findByIdInAndDeletedNot(List<String> ids, Boolean deleted);

    @Aggregation(pipeline = {
        "{ $match: { deleted: { $ne: true } } }",
        "{ $sample: { size: ?0 } }"
    })
    List<Playlists> findRandomPlaylists(int size);
}
