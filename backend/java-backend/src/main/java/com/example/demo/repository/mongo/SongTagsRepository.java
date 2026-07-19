package com.example.demo.repository.mongo;

import com.example.demo.model.mongo.SongTags;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface SongTagsRepository extends MongoRepository<SongTags, String> {

    Optional<SongTags> findByNameAndDeletedAndStatus(String name, Boolean deleted, String status);
}
