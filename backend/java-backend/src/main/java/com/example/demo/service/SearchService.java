package com.example.demo.service;

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
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SearchService {

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private CategoriesRepository categoriesRepository;

    @Autowired
    private TagsRepository tagsRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public Map<String, Object> searchArticles(String keyword, int page, int size) {
        Criteria criteria = new Criteria().andOperator(
                Criteria.where("deleted").ne(true),
                Criteria.where("status").is("PUBLIC"),
                Criteria.where("title").regex(keyword, "i")
        );
        Query query = new Query(criteria)
                .with(PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "published")));

        List<Article> articles = mongoTemplate.find(query, Article.class);
        long total = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Article.class);

        // 批量获取分类和标签
        Set<String> categoryIds = articles.stream()
                .map(Article::getCategory)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Set<String> tagIds = articles.stream()
                .map(Article::getTag)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, String> categoryNameMap = resolveCategoryNames(categoryIds);
        Map<String, String> tagNameMap = resolveTagNames(tagIds);

        List<Map<String, Object>> articleList = new ArrayList<>();
        for (Article article : articles) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", article.getId());
            item.put("title", article.getTitle());
            item.put("cover", article.getCover());
            item.put("published", article.getPublished());
            item.put("pageViews",article.getPageViews());
            item.put("likes",article.getLikes());
            // 截断内容为50字符
            if (article.getContent() != null && article.getContent().length() > 50) {
                item.put("content", article.getContent().substring(0, 50));
            } else {
                item.put("content", article.getContent());
            }
            item.put("category", categoryNameMap.getOrDefault(article.getCategory(), ""));
            item.put("tag", tagNameMap.getOrDefault(article.getTag(), ""));
            articleList.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", articleList);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    public List<String> getArticleTitles(String keyword) {
        Criteria criteria = new Criteria().andOperator(
                Criteria.where("deleted").ne(true),
                Criteria.where("status").is("PUBLIC"),
                Criteria.where("title").regex(keyword, "i")
        );
        Query query = new Query(criteria)
                .with(Sort.by(Sort.Direction.DESC, "published"))
                .limit(5);
        query.fields().include("title");

        List<Article> articles = mongoTemplate.find(query, Article.class);
        return articles.stream().map(Article::getTitle).collect(Collectors.toList());
    }

    public List<String> getHotSearchTitles() {
        PageRequest pageRequest = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "pageViews"));
        Page<Article> articlePage = articleRepository.findByDeletedNotAndStatus(true, "PUBLIC", pageRequest);

        return articlePage.getContent().stream().map(Article::getTitle).collect(Collectors.toList());
    }

    private Map<String, String> resolveCategoryNames(Set<String> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<Categories> categories = categoriesRepository.findByIdInAndDeletedNotAndStatus(
                new ArrayList<>(categoryIds), true, "ACTIVE");
        return categories.stream().collect(Collectors.toMap(Categories::getId, Categories::getName, (a, b) -> a));
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
