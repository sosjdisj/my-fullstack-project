package com.example.demo.service;

import com.example.demo.common.BusinessException;
import com.example.demo.model.mongo.Article;
import com.example.demo.model.mongo.Categories;
import com.example.demo.model.mongo.Tags;
import com.example.demo.repository.mongo.ArticleRepository;
import com.example.demo.repository.mongo.CategoriesRepository;
import com.example.demo.repository.mongo.TagsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.bson.types.ObjectId;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TagsService {

    @Autowired
    private TagsRepository tagsRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private CategoriesRepository categoriesRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public Map<String, Object> getTagsList(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createTime"));
        Page<Tags> tagsPage = tagsRepository.findByDeletedNotAndStatus(true, "ACTIVE", pageRequest);

        // 通过聚合统计每个标签下的文章数
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("deleted").ne(true).and("status").is("PUBLIC")),
                Aggregation.group("tag").count().as("articleCount"),
                Aggregation.project("articleCount").and("_id").as("tagId")
        );
        AggregationResults<Map> results = mongoTemplate.aggregate(aggregation, "articles", Map.class);
        Map<String, Long> articleCountMap = new HashMap<>();
        for (Map doc : results.getMappedResults()) {
            String tagId = doc.get("tagId") != null ? doc.get("tagId").toString() : null;
            Long count = doc.get("articleCount") != null ? ((Number) doc.get("articleCount")).longValue() : 0L;
            if (tagId != null) {
                articleCountMap.put(tagId, count);
            }
        }

        List<Map<String, Object>> tagList = new ArrayList<>();
        for (Tags tag : tagsPage.getContent()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", tag.getId());
            item.put("name", tag.getName());
            item.put("icon", tag.getIcon());
            item.put("desc", tag.getDesc());
            item.put("title", tag.getName());
            item.put("subtitle", tag.getDesc());
            item.put("titleSuffix", tag.getName());
            item.put("articleCount", articleCountMap.getOrDefault(tag.getId(), 0L));
            tagList.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", tagList);
        result.put("total", tagsPage.getTotalElements());
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    public Map<String, Object> getArticlesByTag(String name, int page, int size) {
        Tags tag = tagsRepository.findByNameAndDeletedNotAndStatus(name, true, "ACTIVE")
                .orElseThrow(() -> new BusinessException(404, "标签不存在"));

        // tag 字段在 MongoDB 中是 ObjectId 类型，必须用 ObjectId 查询
        Query query = new Query(Criteria.where("tag").is(new ObjectId(tag.getId()))
                .and("deleted").ne(true)
                .and("status").is("PUBLIC"))
                .with(PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "published")));

        List<Article> articles = mongoTemplate.find(query, Article.class);
        long total = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Article.class);

        // 批量获取分类名称
        Set<String> categoryIds = articles.stream()
                .map(Article::getCategory)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<String, String> categoryNameMap = resolveCategoryNames(categoryIds);

        List<Map<String, Object>> articleList = new ArrayList<>();
        for (Article article : articles) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", article.getId());
            item.put("title", article.getTitle());
            item.put("cover", article.getCover());
            item.put("content", article.getContent());
            item.put("published", article.getPublished());
            item.put("category", categoryNameMap.getOrDefault(article.getCategory(), ""));
            articleList.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", articleList);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    private Map<String, String> resolveCategoryNames(Set<String> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<Categories> categories = categoriesRepository.findByIdInAndDeletedNotAndStatus(
                new ArrayList<>(categoryIds), true, "ACTIVE");
        return categories.stream().collect(Collectors.toMap(Categories::getId, Categories::getName, (a, b) -> a));
    }
}
