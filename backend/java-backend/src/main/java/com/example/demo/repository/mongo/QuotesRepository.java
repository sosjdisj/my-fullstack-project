package com.example.demo.repository.mongo;

import com.example.demo.model.mongo.Quotes;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface QuotesRepository extends MongoRepository<Quotes, String> {

    @Aggregation(pipeline = {
        "{ $match: { deleted: { $ne: true } } }",
        "{ $sample: { size: ?0 } }"
    })
    List<Quotes> findRandomQuotes(int size);
}
