package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.BusinessException;
import com.example.demo.common.JwtUtil;
import com.example.demo.service.PlaylistsService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/playlists")
public class PlaylistsController {

    @Autowired
    private PlaylistsService playlistsService;

    @GetMapping
    public ApiResponse<Map<String, Object>> getPlaylistList(
            @RequestParam(defaultValue = "normal") String mode,
            @RequestParam(defaultValue = "10") int limit) {
        Map<String, Object> result;
        if ("daily".equals(mode)) {
            result = playlistsService.getDailyPlaylist();
        } else {
            result = playlistsService.getPlaylist(limit);
        }
        return ApiResponse.success("获取歌单列表成功", result);
    }

    @GetMapping("/{id}/info")
    public ApiResponse<Map<String, Object>> getPlaylistInfo(
            @PathVariable String id, HttpServletRequest request) {
        JwtUtil.UserInfo auth = (JwtUtil.UserInfo) request.getAttribute("auth");
        Integer userId = auth != null ? auth.getUserId() : null;
        Map<String, Object> result = playlistsService.getPlaylistCover(id, userId);
        return ApiResponse.success("获取歌单信息成功", result);
    }

    @GetMapping("/{id}/songs")
    public ApiResponse<Map<String, Object>> getPlaylistSongs(
            @PathVariable String id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        JwtUtil.UserInfo auth = (JwtUtil.UserInfo) request.getAttribute("auth");
        Integer userId = auth != null ? auth.getUserId() : null;
        Map<String, Object> result = playlistsService.getPlaylistSongs(id, page, size, userId);
        return ApiResponse.success("获取歌单歌曲成功", result);
    }

    @GetMapping("/collects")
    public ApiResponse<Map<String, Object>> getCollects(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        JwtUtil.UserInfo auth = getAuth(request);
        Map<String, Object> result = playlistsService.getCollectsPlaylist(auth.getUserId(), page, size);
        return ApiResponse.success("获取收藏歌单成功", result);
    }

    @PostMapping("/collects")
    public ApiResponse<Map<String, Object>> collectPlaylist(@RequestBody Map<String, String> body, HttpServletRequest request) {
        JwtUtil.UserInfo auth = getAuth(request);
        String id = body.get("id");
        if (id == null || id.isBlank()) {
            throw new BusinessException(400, "歌单ID不能为空");
        }
        Map<String, Object> result = playlistsService.collectPlaylist(auth.getUserId(), id);
        return ApiResponse.success("收藏歌单成功", result);
    }

    @DeleteMapping("/{id}/collects")
    public ApiResponse<Map<String, Object>> uncollectPlaylist(@PathVariable String id, HttpServletRequest request) {
        JwtUtil.UserInfo auth = getAuth(request);
        Map<String, Object> result = playlistsService.uncollectPlaylist(auth.getUserId(), id);
        return ApiResponse.success("取消收藏歌单成功", result);
    }

    private JwtUtil.UserInfo getAuth(HttpServletRequest request) {
        JwtUtil.UserInfo auth = (JwtUtil.UserInfo) request.getAttribute("auth");
        if (auth == null) {
            throw new BusinessException(401, "未登录");
        }
        return auth;
    }
}
