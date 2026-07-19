package com.example.demo.repository.mongo;

import com.example.demo.model.mongo.Tags;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TagsRepository extends MongoRepository<Tags, String> {

    Page<Tags> findByDeletedNotAndStatus(Boolean deleted, String status, Pageable pageable);

    Optional<Tags> findByNameAndDeletedNotAndStatus(String name, Boolean deleted, String status);

    List<Tags> findByIdInAndDeletedNotAndStatus(List<String> ids, Boolean deleted, String status);
}
