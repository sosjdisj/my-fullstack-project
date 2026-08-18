package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.BusinessException;
import com.example.demo.common.ValidationUtil;
import com.example.demo.common.JwtUtil;
import com.example.demo.service.TreeholeService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/treehole")
public class TreeholeController {

    @Autowired
    private TreeholeService treeholeService;

    /** 获取最新的树洞消息列表 */
    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getMessages(
            @RequestParam(defaultValue = "10") int limit) {
        List<Map<String, Object>> messages = treeholeService.getMessage(limit);
        return ApiResponse.success("获取树洞消息成功", messages);
    }

    /** 发送一条树洞消息 */
    @PostMapping
    public ApiResponse<Void> createMessage(@RequestBody Map<String, String> body, HttpServletRequest request) {
        JwtUtil.UserInfo auth = (JwtUtil.UserInfo) request.getAttribute("auth");
        if (auth == null) {
            throw new BusinessException(401, "未登录");
        }
        String content = body.get("content");
        ValidationUtil.checkContent(content, 100, "内容");
        treeholeService.createMessage(content, auth.getUserId());
        return ApiResponse.success("发送消息成功");
    }
}
