package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.BusinessException;
import com.example.demo.common.JwtUtil;
import com.example.demo.service.SongsService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/songs")
public class SongsController {

    @Autowired
    private SongsService songsService;

    @GetMapping
    public ApiResponse<Map<String, Object>> getLikeSongs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        JwtUtil.UserInfo auth = getAuth(request);
        Map<String, Object> result = songsService.getLikeSongs(auth.getUserId(), page, size);
        return ApiResponse.success("获取喜欢歌曲成功", result);
    }

    @PostMapping("/likes")
    public ApiResponse<Map<String, Object>> likeSong(@RequestBody Map<String, String> body, HttpServletRequest request) {
        JwtUtil.UserInfo auth = getAuth(request);
        String id = body.get("id");
        if (id == null || id.isBlank()) {
            throw new BusinessException(400, "歌曲ID不能为空");
        }
        Map<String, Object> result = songsService.likeSong(auth.getUserId(), id);
        return ApiResponse.success("点赞成功", result);
    }

    @DeleteMapping("/{id}/likes")
    public ApiResponse<Map<String, Object>> unlikeSong(@PathVariable String id, HttpServletRequest request) {
        JwtUtil.UserInfo auth = getAuth(request);
        Map<String, Object> result = songsService.unlikeSong(auth.getUserId(), id);
        return ApiResponse.success("取消点赞成功", result);
    }

    @GetMapping("/charts")
    public ApiResponse<Map<String, Object>> getCharts(
            @RequestParam String tagNames,
            @RequestParam(defaultValue = "10") int limit) {
        Map<String, Object> result = songsService.getChartsData(tagNames, limit);
        return ApiResponse.success("获取榜单成功", result);
    }

    @GetMapping("/charts/{tagName}")
    public ApiResponse<Map<String, Object>> getSingleChart(
            @PathVariable String tagName,
            @RequestParam(defaultValue = "false") boolean isNew,
            @RequestParam(defaultValue = "10") int limit) {
        Map<String, Object> result = songsService.getSingleChartData(tagName, isNew, limit);
        return ApiResponse.success("获取榜单成功", result);
    }

    private JwtUtil.UserInfo getAuth(HttpServletRequest request) {
        JwtUtil.UserInfo auth = (JwtUtil.UserInfo) request.getAttribute("auth");
        if (auth == null) {
            throw new BusinessException(401, "未登录");
        }
        return auth;
    }
}
