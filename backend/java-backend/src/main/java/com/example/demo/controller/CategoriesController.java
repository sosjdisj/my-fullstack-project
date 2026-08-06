package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.service.CategoriesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class CategoriesController {

    @Autowired
    private CategoriesService categoriesService;

    @GetMapping
    public ApiResponse<Map<String, Object>> getCategoriesList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> result = categoriesService.getCategoriesList(page, size);
        return ApiResponse.success("获取分类列表成功", result);
    }

    /** 按分类分页获取文章列表 */
    @GetMapping("/{content}")
    public ApiResponse<Map<String, Object>> getArticlesByCategory(
            @PathVariable String content,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> result = categoriesService.getArticlesByCategory(content, page, size);
        return ApiResponse.success("获取分类文章成功", result);
    }
}
