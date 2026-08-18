package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.BusinessException;
import com.example.demo.common.ValidationUtil;
import com.example.demo.common.JwtUtil;
import com.example.demo.model.mongo.Article;
import com.example.demo.service.ArticleService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/article")
public class ArticleController {

    @Autowired
    private ArticleService articleService;

    /** 分页获取文章列表 */
    @GetMapping
    public ApiResponse<Map<String, Object>> getArticleList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> result = articleService.getArticleList(page, size);
        return ApiResponse.success("获取文章列表成功", result);
    }

    @GetMapping("/random/list")
    public ApiResponse<List<Map<String, Object>>> getRandomArticles() {
        List<Article> articles = articleService.getRandomArticles();
        List<Map<String, Object>> list = articles.stream().map(article -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", article.getId());
            map.put("title", article.getTitle());
            map.put("cover", article.getCover());
            map.put("category", article.getCategory());
            map.put("tag", article.getTag());
            map.put("published",article.getPublished());
            return map;
        }).collect(Collectors.toList());
        return ApiResponse.success("获取随机文章成功", list);
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> getArticleById(
            @PathVariable String id, HttpServletRequest request) {
        // 尝试从request attribute获取auth信息（可选认证）
        JwtUtil.UserInfo auth = (JwtUtil.UserInfo) request.getAttribute("auth");
        Integer userId = auth != null ? auth.getUserId() : null;
        Map<String, Object> result = articleService.getArticleById(id, userId);
        return ApiResponse.success("获取文章详情成功", result);
    }

    /** 点赞文章 */
    @PostMapping("/likes")
    public ApiResponse<Map<String, Object>> likeArticle(@RequestBody Map<String, String> body, HttpServletRequest request) {
        JwtUtil.UserInfo auth = getAuth(request);
        String id = body.get("id");
        if (id == null || id.isBlank()) {
            throw new BusinessException(400, "文章ID不能为空");
        }
        long likes = articleService.likeArticle(id, auth.getUserId());
        return ApiResponse.success("点赞成功", Map.of("updatedLikes", likes, "status", "like"));
    }

    /** 取消点赞文章 */
    @DeleteMapping("/likes/{id}")
    public ApiResponse<Map<String, Object>> unlikeArticle(@PathVariable String id, HttpServletRequest request) {
        JwtUtil.UserInfo auth = getAuth(request);
        long likes = articleService.unlikeArticle(id, auth.getUserId());
        return ApiResponse.success("取消点赞成功", Map.of("updatedLikes", likes, "status", "unlike"));
    }

    /** 收藏文章 */
    @PostMapping("/collects")
    public ApiResponse<Map<String, Object>> collectArticle(@RequestBody Map<String, String> body, HttpServletRequest request) {
        JwtUtil.UserInfo auth = getAuth(request);
        String id = body.get("id");
        if (id == null || id.isBlank()) {
            throw new BusinessException(400, "文章ID不能为空");
        }
        long collects = articleService.collectArticle(id, auth.getUserId());
        return ApiResponse.success("收藏成功", Map.of("updatedCollects", collects, "status", "collect"));
    }

    /** 取消收藏文章 */
    @DeleteMapping("/collects/{id}")
    public ApiResponse<Map<String, Object>> uncollectArticle(@PathVariable String id, HttpServletRequest request) {
        JwtUtil.UserInfo auth = getAuth(request);
        long collects = articleService.uncollectArticle(id, auth.getUserId());
        return ApiResponse.success("取消收藏成功", Map.of("updatedCollects", collects, "status", "uncollect"));
    }

    /** 分页获取文章评论列表 */
    @GetMapping("/{id}/comments")
    public ApiResponse<Map<String, Object>> getArticleComments(
            @PathVariable String id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> result = articleService.getArticleComments(id, page, size);
        return ApiResponse.success("获取评论成功", result);
    }

    /** 发表文章评论 */
    @PostMapping("/{id}/comments")
    public ApiResponse<Map<String, Object>> createArticleComment(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        JwtUtil.UserInfo auth = getAuth(request);
        String content = body.get("content");
        ValidationUtil.checkContent(content, 500, "评论内容");
        long count = articleService.createArticleComment(id, content, auth.getUserId());
        return ApiResponse.success("评论成功", Map.of("count", count));
    }

    /** 从请求中获取登录用户信息，未登录则抛出异常 */
    private JwtUtil.UserInfo getAuth(HttpServletRequest request) {
        JwtUtil.UserInfo auth = (JwtUtil.UserInfo) request.getAttribute("auth");
        if (auth == null) {
            throw new BusinessException(401, "未登录");
        }
        return auth;
    }
}
