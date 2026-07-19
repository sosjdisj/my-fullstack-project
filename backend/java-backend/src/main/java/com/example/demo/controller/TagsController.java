package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.service.TagsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tags")
public class TagsController {

    @Autowired
    private TagsService tagsService;

    @GetMapping
    public ApiResponse<Map<String, Object>> getTagsList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> result = tagsService.getTagsList(page, size);
        return ApiResponse.success("获取标签列表成功", result);
    }

    @GetMapping("/{content}")
    public ApiResponse<Map<String, Object>> getArticlesByTag(
            @PathVariable String content,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> result = tagsService.getArticlesByTag(content, page, size);
        return ApiResponse.success("获取标签文章成功", result);
    }
}
