package com.example.demo.repository.mongo;

import com.example.demo.model.mongo.UserCollectPlaylists;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserCollectPlaylistsRepository extends MongoRepository<UserCollectPlaylists, String> {

    Optional<UserCollectPlaylists> findByPlaylistIdAndUserId(ObjectId playlistId, Integer userId);

    Page<UserCollectPlaylists> findByUserIdAndIsCanceled(Integer userId, Boolean isCanceled, Pageable pageable);
}
