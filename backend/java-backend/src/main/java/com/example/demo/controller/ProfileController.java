package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.BusinessException;
import com.example.demo.common.JwtUtil;
import com.example.demo.service.ArticleService;
import com.example.demo.service.ProfileService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private ArticleService articleService;

    @GetMapping
    public ApiResponse<Map<String, Object>> getProfile(HttpServletRequest request) {
        JwtUtil.UserInfo auth = getAuth(request);
        Map<String, Object> profile = profileService.getProfile(auth.getUserId());
        return ApiResponse.success("获取个人信息成功", profile);
    }

    @PatchMapping
    public ApiResponse<Map<String, Object>> updateProfile(
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "signature", required = false) String signature,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar,
            HttpServletRequest request) {
        JwtUtil.UserInfo auth = getAuth(request);

        Map<String, String> updateData = new HashMap<>();
        if (username != null) updateData.put("username", username);
        if (signature != null) updateData.put("signature", signature);
        if (phone != null) updateData.put("phone", phone);

        Map<String, Object> profile = profileService.updateProfile(auth.getUserId(), updateData, avatar);
        return ApiResponse.success("更新个人信息成功", profile);
    }

    @GetMapping("/articles/collected")
    public ApiResponse<Map<String, Object>> getCollectedArticles(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        JwtUtil.UserInfo auth = getAuth(request);
        int skip = (page - 1) * size;
        Map<String, Object> result = profileService.getArticlesCollectedId(auth.getUserId(), skip, size);
        return ApiResponse.success("获取收藏文章成功", result);
    }

    @GetMapping("/keyword")
    public ApiResponse<Map<String, Object>> getKeywordArticles(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        JwtUtil.UserInfo auth = getAuth(request);
        if (keyword == null || keyword.isBlank()) {
            throw new BusinessException(400, "关键词不能为空");
        }
        int skip = (page - 1) * size;
        Map<String, Object> result = profileService.getKeywordArticles(auth.getUserId(), skip, size, keyword);
        return ApiResponse.success("搜索收藏文章成功", result);
    }

    @DeleteMapping("/{id}/collects")
    public ApiResponse<Map<String, Object>> uncollectArticle(@PathVariable String id, HttpServletRequest request) {
        JwtUtil.UserInfo auth = getAuth(request);
        long updatedCollects = articleService.uncollectArticle(id, auth.getUserId());
        return ApiResponse.success("已从收藏夹移除", Map.of("updatedCollects", updatedCollects, "status", "uncollect"));
    }

    private JwtUtil.UserInfo getAuth(HttpServletRequest request) {
        JwtUtil.UserInfo auth = (JwtUtil.UserInfo) request.getAttribute("auth");
        if (auth == null) {
            throw new BusinessException(401, "未登录");
        }
        return auth;
    }
}
