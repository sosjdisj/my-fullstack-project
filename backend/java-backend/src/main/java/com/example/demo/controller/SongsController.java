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

    /** 分页获取当前用户喜欢的歌曲 */
    @GetMapping
    public ApiResponse<Map<String, Object>> getLikeSongs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        JwtUtil.UserInfo auth = getAuth(request);
        Map<String, Object> result = songsService.getLikeSongs(auth.getUserId(), page, size);
        return ApiResponse.success("获取喜欢歌曲成功", result);
    }

    /** 点赞歌曲 */
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

    /** 取消点赞歌曲 */
    @DeleteMapping("/{id}/likes")
    public ApiResponse<Map<String, Object>> unlikeSong(@PathVariable String id, HttpServletRequest request) {
        JwtUtil.UserInfo auth = getAuth(request);
        Map<String, Object> result = songsService.unlikeSong(auth.getUserId(), id);
        return ApiResponse.success("取消点赞成功", result);
    }

    /** 按标签名批量获取歌曲榜单数据 */
    @GetMapping("/charts")
    public ApiResponse<Map<String, Object>> getCharts(
            @RequestParam String tagNames,
            @RequestParam(defaultValue = "10") int limit) {
        Map<String, Object> result = songsService.getChartsData(tagNames, limit);
        return ApiResponse.success("获取榜单成功", result);
    }

    /** 获取指定标签的单个歌曲榜单 */
    @GetMapping("/charts/{tagName}")
    public ApiResponse<Map<String, Object>> getSingleChart(
            @PathVariable String tagName,
            @RequestParam(defaultValue = "false") boolean isNew,
            @RequestParam(defaultValue = "10") int limit) {
        Map<String, Object> result = songsService.getSingleChartData(tagName, isNew, limit);
        return ApiResponse.success("获取榜单成功", result);
    }

    /** 获取歌曲歌词 */
    @GetMapping("/{id}/lyrics")
    public ApiResponse<Map<String, Object>> getLyrics(@PathVariable String id) {
        Map<String, Object> result = songsService.getLyrics(id);
        return ApiResponse.success("获取歌词成功", result);
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
