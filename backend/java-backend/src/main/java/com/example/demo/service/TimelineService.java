package com.example.demo.service;

import com.example.demo.model.mongo.Article;
import com.example.demo.repository.mongo.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TimelineService {

    @Autowired
    private ArticleRepository articleRepository;

    public Map<String, Object> getTimelineList(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Article> articlePage = articleRepository.findByDeletedNotAndStatus(true, "PUBLIC", pageRequest);

        List<Map<String, Object>> articleList = new ArrayList<>();
        for (Article article : articlePage.getContent()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", article.getId());
            item.put("title", article.getTitle());
            item.put("published", article.getPublished());
            item.put("cover", article.getCover());
            articleList.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", articleList);
        result.put("total", articlePage.getTotalElements());
        result.put("page", page);
        result.put("size", size);
        return result;
    }
}
