package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.ValidationUtil;
import com.example.demo.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @GetMapping
    public ApiResponse<Map<String, Object>> searchArticles(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        ValidationUtil.checkContent(keyword, 50, "关键词");
        Map<String, Object> result = searchService.searchArticles(keyword, page, size);
        return ApiResponse.success("搜索文章成功", result);
    }

    /** 按关键词搜索文章标题 */
    @GetMapping("/titles")
    public ApiResponse<List<String>> searchTitles(@RequestParam String keyword) {
        ValidationUtil.checkContent(keyword, 50, "关键词");
        List<String> titles = searchService.getArticleTitles(keyword);
        return ApiResponse.success("搜索标题成功", titles);
    }

    /** 获取热搜标题列表 */
    @GetMapping("/hot-titles")
    public ApiResponse<List<String>> getHotTitles() {
        List<String> titles = searchService.getHotSearchTitles();
        return ApiResponse.success("获取热搜标题成功", titles);
    }
}
