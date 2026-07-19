package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.BusinessException;
import com.example.demo.common.JwtUtil;
import com.example.demo.common.JwtUtil.UserInfo;
import com.example.demo.model.mysql.User;
import com.example.demo.service.AuthService;
import com.example.demo.service.SendCodeService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private SendCodeService sendCodeService;

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@RequestBody Map<String, String> body, HttpServletResponse response) {
        String username = body.get("username");
        String password = body.get("password");
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new BusinessException(400, "用户名和密码不能为空");
        }

        User user = authService.verifyLogin(username, password);

        // 检查Redis缓存中是否已有有效token
        String cacheKey = "user:token:" + user.getUserId();
        String cachedToken = redisTemplate.opsForValue().get(cacheKey);

        String accessToken;
        String refreshToken;

        if (cachedToken != null) {
            UserInfo cachedInfo = jwtUtil.verifyToken(cachedToken);
            if (cachedInfo != null) {
                accessToken = cachedToken;
                // 仍需生成新的refreshToken
                JwtUtil.TokenPair pair = jwtUtil.generateTokenPair(user.getUserId(), user.getUsername(),
                        user.getCover(), user.getSignature());
                refreshToken = pair.refreshToken();
            } else {
                JwtUtil.TokenPair pair = jwtUtil.generateTokenPair(user.getUserId(), user.getUsername(),
                        user.getCover(), user.getSignature());
                accessToken = pair.accessToken();
                refreshToken = pair.refreshToken();
            }
        } else {
            JwtUtil.TokenPair pair = jwtUtil.generateTokenPair(user.getUserId(), user.getUsername(),
                    user.getCover(), user.getSignature());
            accessToken = pair.accessToken();
            refreshToken = pair.refreshToken();
        }

        // 保存accessToken到Redis（2小时TTL，与accessToken有效期一致）
        redisTemplate.opsForValue().set(cacheKey, accessToken, 2, TimeUnit.HOURS);

        // 设置refreshToken为HttpOnly cookie
        setRefreshTokenCookie(response, refreshToken);

        Map<String, Object> data = new HashMap<>();
        data.put("token", accessToken);
        data.put("username", user.getUsername());
        data.put("avatar", user.getCover());
        data.put("signature", user.getSignature());

        return ApiResponse.success(cachedToken != null ? "登录成功（使用缓存token）" : "登录成功", data);
    }

    @PostMapping("/register")
    public ApiResponse<Map<String, Object>> register(@RequestBody Map<String, String> body, HttpServletResponse response) {
        String username = body.get("username");
        String password = body.get("password");
        String phone = body.get("phone");
        String code = body.get("code");

        if (username == null || username.isBlank()) {
            throw new BusinessException(400, "用户名不能为空");
        }
        if (password == null || password.isBlank()) {
            throw new BusinessException(400, "密码不能为空");
        }
        if (phone == null || phone.isBlank()) {
            throw new BusinessException(400, "手机号不能为空");
        }
        if (code == null || code.isBlank()) {
            throw new BusinessException(400, "验证码不能为空");
        }

        // 检查手机号是否已注册
        if (authService.checkPhoneExists(phone)) {
            throw new BusinessException(400, "该手机号已注册");
        }

        // 验证验证码
        SendCodeService.CodeItem codeItem = sendCodeService.getCode(phone);
        if (codeItem == null) {
            throw new BusinessException(400, "验证码不存在或已过期");
        }
        if (!codeItem.getCode().equals(code)) {
            throw new BusinessException(400, "验证码错误");
        }

        // 注册用户
        User user = authService.registerUser(username, password, phone);

        // 清理验证码缓存
        sendCodeService.removeCode(phone);

        // 生成token
        JwtUtil.TokenPair pair = jwtUtil.generateTokenPair(user.getUserId(), user.getUsername(),
                user.getCover(), user.getSignature());

        // 保存token到Redis
        String cacheKey = "user:token:" + user.getUserId();
        redisTemplate.opsForValue().set(cacheKey, pair.accessToken(), 2, TimeUnit.HOURS);

        // 设置refreshToken为HttpOnly cookie
        setRefreshTokenCookie(response, pair.refreshToken());

        Map<String, Object> data = new HashMap<>();
        data.put("token", pair.accessToken());
        data.put("username", username);
        data.put("avatar", user.getCover());

        return ApiResponse.success("注册成功", data);
    }

    @PostMapping("/refresh-token")
    public ApiResponse<Map<String, Object>> refreshToken(@CookieValue(value = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BusinessException(401, "会话已过期，请重新登录");
        }

        UserInfo decoded = jwtUtil.verifyToken(refreshToken);
        if (decoded == null) {
            throw new BusinessException(403, "刷新令牌无效或已过期");
        }

        String newAccessToken = jwtUtil.generateAccessToken(
                decoded.getUserId(), decoded.getUsername(),
                decoded.getCover(), decoded.getSignature()
        );

        // 更新Redis缓存
        String cacheKey = "user:token:" + decoded.getUserId();
        redisTemplate.opsForValue().set(cacheKey, newAccessToken, 2, TimeUnit.HOURS);

        Map<String, Object> data = new HashMap<>();
        data.put("token", newAccessToken);
        data.put("username", decoded.getUsername());
        data.put("avatar", decoded.getCover());
        data.put("signature", decoded.getSignature());

        return ApiResponse.success("续签成功", data);
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7天
        response.addCookie(cookie);
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refreshToken", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0); // 立即过期
        response.addCookie(cookie);
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(
            @CookieValue(value = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {
        // 清除refreshToken cookie
        clearRefreshTokenCookie(response);

        // 如果有refreshToken，验证并清除Redis缓存
        if (refreshToken != null && !refreshToken.isBlank()) {
            UserInfo decoded = jwtUtil.verifyToken(refreshToken);
            if (decoded != null) {
                String cacheKey = "user:token:" + decoded.getUserId();
                redisTemplate.delete(cacheKey);
            }
        }

        return ApiResponse.success("退出成功", null);
    }
}
