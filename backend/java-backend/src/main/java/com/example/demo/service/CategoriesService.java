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
public class CategoriesService {

    @Autowired
    private CategoriesRepository categoriesRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private TagsRepository tagsRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public Map<String, Object> getCategoriesList(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createTime"));
        Page<Categories> categoriesPage = categoriesRepository.findByDeletedNotAndStatus(true, "ACTIVE", pageRequest);

        // 通过聚合统计每个分类下的文章数
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("deleted").ne(true).and("status").is("PUBLIC")),
                Aggregation.group("category").count().as("articleCount"),
                Aggregation.project("articleCount").and("_id").as("categoryId")
        );
        AggregationResults<Map> results = mongoTemplate.aggregate(aggregation, "articles", Map.class);
        Map<String, Long> articleCountMap = new HashMap<>();
        for (Map doc : results.getMappedResults()) {
            String categoryId = doc.get("categoryId") != null ? doc.get("categoryId").toString() : null;
            Long count = doc.get("articleCount") != null ? ((Number) doc.get("articleCount")).longValue() : 0L;
            if (categoryId != null) {
                articleCountMap.put(categoryId, count);
            }
        }

        List<Map<String, Object>> categoryList = new ArrayList<>();
        for (Categories category : categoriesPage.getContent()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", category.getId());
            item.put("name", category.getName());
            item.put("icon", category.getIcon());
            item.put("desc", category.getDesc());
            item.put("title", category.getName());
            item.put("subtitle", category.getDesc());
            item.put("titleSuffix", category.getName());
            item.put("articleCount", articleCountMap.getOrDefault(category.getId(), 0L));
            categoryList.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", categoryList);
        result.put("total", categoriesPage.getTotalElements());
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    public Map<String, Object> getArticlesByCategory(String name, int page, int size) {
        Categories category = categoriesRepository.findByNameAndDeletedNotAndStatus(name, true, "ACTIVE")
                .orElseThrow(() -> new BusinessException(404, "分类不存在"));

        // category 字段在 MongoDB 中是 ObjectId 类型，必须用 ObjectId 查询
        Query query = new Query(Criteria.where("category").is(new ObjectId(category.getId()))
                .and("deleted").ne(true)
                .and("status").is("PUBLIC"))
                .with(PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "published")));

        List<Article> articles = mongoTemplate.find(query, Article.class);
        long total = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Article.class);

        // 批量获取标签名称
        Set<String> tagIds = articles.stream()
                .map(Article::getTag)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<String, String> tagNameMap = resolveTagNames(tagIds);

        List<Map<String, Object>> articleList = new ArrayList<>();
        for (Article article : articles) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", article.getId());
            item.put("title", article.getTitle());
            item.put("cover", article.getCover());
            item.put("content", article.getContent());
            item.put("published", article.getPublished());
            item.put("tag", tagNameMap.get(article.getTag()));
            articleList.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", articleList);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    private Map<String, String> resolveTagNames(Set<String> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<Tags> tags = tagsRepository.findByIdInAndDeletedNotAndStatus(
                new ArrayList<>(tagIds), true, "ACTIVE");
        return tags.stream().collect(Collectors.toMap(Tags::getId, Tags::getName, (a, b) -> a));
    }
}
