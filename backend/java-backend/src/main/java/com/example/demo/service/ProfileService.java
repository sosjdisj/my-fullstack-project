package com.example.demo.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.demo.common.BusinessException;
import com.example.demo.mapper.UserMapper;
import com.example.demo.model.mongo.Article;
import com.example.demo.model.mongo.Categories;
import com.example.demo.model.mongo.Tags;
import com.example.demo.model.mongo.UserArticleInteraction;
import com.example.demo.model.mysql.User;
import com.example.demo.repository.mongo.ArticleRepository;
import com.example.demo.repository.mongo.CategoriesRepository;
import com.example.demo.repository.mongo.TagsRepository;
import com.example.demo.repository.mongo.UserArticleInteractionRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private UserArticleInteractionRepository interactionRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private CategoriesRepository categoriesRepository;

    @Autowired
    private TagsRepository tagsRepository;

    @Value("${upload.dir}")
    private String uploadDir;

    @Value("${upload.base-url}")
    private String baseUrl;

    /** 查询用户个人资料 */
    public Map<String, Object> getProfile(Integer userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("username", user.getUsername());
        result.put("signature", user.getSignature());
        result.put("cover", user.getCover());
        result.put("phone", user.getPhone());
        result.put("publishTime", user.getPublishTime());
        result.put("updateTime", user.getUpdateTime());
        return result;
    }

    /** 更新用户资料，支持同时上传头像，返回最新资料 */
    public Map<String, Object> updateProfile(Integer userId, Map<String, String> updateData, MultipartFile avatar) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }

        if (updateData != null) {
            if (updateData.containsKey("username")) {
                user.setUsername(updateData.get("username"));
            }
            if (updateData.containsKey("signature")) {
                user.setSignature(updateData.get("signature"));
            }
            if (updateData.containsKey("phone")) {
                user.setPhone(updateData.get("phone"));
            }
        }

        if (avatar != null && !avatar.isEmpty()) {
            String originalFilename = avatar.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;

            File uploadPath = new File(uploadDir);
            if (!uploadPath.exists()) {
                uploadPath.mkdirs();
            }

            try {
                avatar.transferTo(new File(uploadPath, filename));
            } catch (IOException e) {
                throw new BusinessException(500, "文件上传失败");
            }

            String coverUrl = baseUrl + "/uploads/" + filename;
            user.setCover(coverUrl);
        }

        userMapper.updateById(user);

        return getProfile(userId);
    }

    /** 分页查询用户收藏的文章列表 */
    public Map<String, Object> getArticlesCollectedId(Integer userId, int skip, int size) {
        PageRequest pageRequest = PageRequest.of(skip / size, size);
        Page<UserArticleInteraction> interactionPage = interactionRepository
                .findByUserIdAndIsCollected(userId, true, pageRequest);

        List<UserArticleInteraction> interactions = interactionPage.getContent();
        List<String> articleIds = interactions.stream()
                .map(UserArticleInteraction::getArticleId)
                .map(ObjectId::toString)
                .collect(Collectors.toList());

        List<Map<String, Object>> articleList = new ArrayList<>();
        if (!articleIds.isEmpty()) {
            List<Article> articles = articleRepository.findAllById(articleIds);

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

            for (Article article : articles) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", article.getId());
                item.put("title", article.getTitle());
                item.put("cover", article.getCover());
                item.put("category", categoryNameMap.getOrDefault(article.getCategory(), ""));
                item.put("tag", tagNameMap.getOrDefault(article.getTag(), ""));
                // 去除HTML标签后截取前30字符
                String contentPreview = article.getContent() != null ? article.getContent().replaceAll("<[^>]+>", "") : "";
                if (contentPreview.length() > 30) {
                    contentPreview = contentPreview.substring(0, 30);
                }
                item.put("content", contentPreview);
                item.put("published", article.getPublished());
                articleList.add(item);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", articleList);
        result.put("total", interactionPage.getTotalElements());
        return result;
    }

    /** 在用户收藏的文章中按标题关键词搜索 */
    public Map<String, Object> getKeywordArticles(Integer userId, int skip, int size, String keyword) {
        PageRequest pageRequest = PageRequest.of(skip / size, size);
        Page<UserArticleInteraction> interactionPage = interactionRepository
                .findByUserIdAndIsCollected(userId, true, pageRequest);

        List<UserArticleInteraction> interactions = interactionPage.getContent();
        List<String> articleIds = interactions.stream()
                .map(UserArticleInteraction::getArticleId)
                .map(ObjectId::toString)
                .collect(Collectors.toList());

        List<Map<String, Object>> articleList = new ArrayList<>();
        if (!articleIds.isEmpty()) {
            List<Article> articles = articleRepository.findAllById(articleIds);

            // 按标题关键词过滤
            List<Article> filtered = articles.stream()
                    .filter(a -> a.getTitle() != null && a.getTitle().contains(keyword))
                    .collect(Collectors.toList());

            // 批量获取分类
            Set<String> categoryIds = filtered.stream()
                    .map(Article::getCategory)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            Map<String, String> categoryNameMap = resolveCategoryNames(categoryIds);

            for (Article article : filtered) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", article.getId());
                item.put("title", article.getTitle());
                item.put("cover", article.getCover());
                item.put("category", categoryNameMap.getOrDefault(article.getCategory(), ""));
                item.put("published", article.getPublished());
                articleList.add(item);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", articleList);
        result.put("total", articleList.size());
        return result;
    }

    /** 批量根据分类ID查询分类名映射 */
    private Map<String, String> resolveCategoryNames(Set<String> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<Categories> categories = categoriesRepository.findByIdInAndDeletedNotAndStatus(
                new ArrayList<>(categoryIds), true, "ACTIVE");
        return categories.stream().collect(Collectors.toMap(Categories::getId, Categories::getName, (a, b) -> a));
    }

    /** 批量根据标签ID查询标签名映射 */
    private Map<String, String> resolveTagNames(Set<String> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<Tags> tags = tagsRepository.findByIdInAndDeletedNotAndStatus(
                new ArrayList<>(tagIds), true, "ACTIVE");
        return tags.stream().collect(Collectors.toMap(Tags::getId, Tags::getName, (a, b) -> a));
    }
}
