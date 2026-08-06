package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.BusinessException;
import com.example.demo.common.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/verify")
public class VerifyController {

    /** 校验访问令牌是否有效，并返回当前用户信息 */
    @GetMapping
    public ApiResponse<Map<String, Object>> verify(HttpServletRequest request) {
        JwtUtil.UserInfo auth = (JwtUtil.UserInfo) request.getAttribute("auth");
        if (auth == null) {
            throw new BusinessException(401, "未登录或token无效");
        }

        Map<String, Object> data = Map.of(
                "username", auth.getUsername() != null ? auth.getUsername() : "",
                "avatar", auth.getCover() != null ? auth.getCover() : "",
                "signature", auth.getSignature() != null ? auth.getSignature() : ""
        );
        return ApiResponse.success("Token有效", data);
    }
}
