package com.example.demo.repository.mongo;

import com.example.demo.model.mongo.UserLikeSongs;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserLikeSongsRepository extends MongoRepository<UserLikeSongs, String> {

    Optional<UserLikeSongs> findByUserIdAndSongId(Integer userId, String songId);

    List<UserLikeSongs> findByUserIdAndIsLikedNot(Integer userId, Boolean isLiked);

    List<UserLikeSongs> findByUserIdAndSongIdIn(Integer userId, List<String> songIds);
}
