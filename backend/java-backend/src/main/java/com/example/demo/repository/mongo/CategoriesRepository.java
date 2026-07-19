package com.example.demo.repository.mongo;

import com.example.demo.model.mongo.Categories;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CategoriesRepository extends MongoRepository<Categories, String> {

    Page<Categories> findByDeletedNotAndStatus(Boolean deleted, String status, Pageable pageable);

    Optional<Categories> findByNameAndDeletedNotAndStatus(String name, Boolean deleted, String status);

    List<Categories> findByIdInAndDeletedNotAndStatus(List<String> ids, Boolean deleted, String status);
}
