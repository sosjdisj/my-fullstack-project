package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.BusinessException;
import com.example.demo.common.JwtUtil;
import com.example.demo.common.JwtUtil.UserInfo;
import com.example.demo.model.mysql.User;
import com.example.demo.service.AuthService;
import com.example.demo.service.SendCodeService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
    private static final String REFRESH_TOKEN_BLACKLIST_KEY_PREFIX = "user:refreshToken:blacklist:";
    private static final long REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 天，与刷新令牌有效期一致

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private SendCodeService sendCodeService;

    @Value("${cookie.secure:false}")
    private boolean cookieSecure;

    /** 用户登录，校验账号密码并返回访问令牌 */
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

        return ApiResponse.success("登录成功", data);
    }

    /** 用户注册，校验短信验证码后创建账号并返回访问令牌 */
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

    /** 重置密码，校验短信验证码后更新密码 */
    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        String password = body.get("password");
        String code = body.get("code");

        if (phone == null || phone.isBlank()) {
            throw new BusinessException(400, "手机号不能为空");
        }
        if (password == null || password.isBlank()) {
            throw new BusinessException(400, "密码不能为空");
        }
        if (code == null || code.isBlank()) {
            throw new BusinessException(400, "验证码不能为空");
        }

        // 重置密码要求手机号已注册
        if (!authService.checkPhoneExists(phone)) {
            throw new BusinessException(400, "该手机号未注册");
        }

        // 验证验证码
        SendCodeService.CodeItem codeItem = sendCodeService.getCode(phone);
        if (codeItem == null) {
            throw new BusinessException(400, "验证码不存在或已过期");
        }
        if (!codeItem.getCode().equals(code)) {
            throw new BusinessException(400, "验证码错误");
        }

        // 更新密码
        authService.resetPassword(phone, password);

        // 清理验证码缓存
        sendCodeService.removeCode(phone);

        return ApiResponse.success("密码重置成功", null);
    }

    /** 刷新访问令牌，通过 refreshToken 换取新的 accessToken */
    @PostMapping("/refresh-token")
    public ApiResponse<Map<String, Object>> refreshToken(@CookieValue(value = REFRESH_TOKEN_COOKIE_NAME, required = false) String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BusinessException(401, "会话已过期，请重新登录");
        }

        // 校验黑名单：登出后 refreshToken 立即失效
        if (Boolean.TRUE.equals(redisTemplate.hasKey(REFRESH_TOKEN_BLACKLIST_KEY_PREFIX + refreshToken))) {
            throw new BusinessException(403, "登录状态已失效，请重新登录");
        }

        UserInfo decoded = jwtUtil.verifyToken(refreshToken);
        if (decoded == null) {
            throw new BusinessException(403, "登录已过期，请重新登录");
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

    /**
     * 使用 ResponseCookie 统一构建 Set-Cookie，包含 HttpOnly/Secure/SameSite 防护
     */
    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, refreshToken)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(REFRESH_TOKEN_TTL_SECONDS)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    /** 清除 refreshToken cookie，使其立即失效 */
    private void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    /** 退出登录，清除令牌缓存并将 refreshToken 加入黑名单 */
    @PostMapping("/logout")
    public ApiResponse<Void> logout(
            @CookieValue(value = REFRESH_TOKEN_COOKIE_NAME, required = false) String refreshToken,
            HttpServletResponse response) {
        // 清除refreshToken cookie
        clearRefreshTokenCookie(response);

        // 如果有refreshToken，验证并清除Redis缓存，并将 refreshToken 加入黑名单
        if (refreshToken != null && !refreshToken.isBlank()) {
            UserInfo decoded = jwtUtil.verifyToken(refreshToken);
            if (decoded != null) {
                String cacheKey = "user:token:" + decoded.getUserId();
                redisTemplate.delete(cacheKey);
            }
            // 将 refreshToken 加入黑名单，TTL 与其有效期一致，登出后立即失效
            redisTemplate.opsForValue().set(
                    REFRESH_TOKEN_BLACKLIST_KEY_PREFIX + refreshToken,
                    "1",
                    REFRESH_TOKEN_TTL_SECONDS,
                    TimeUnit.SECONDS
            );
        }

        return ApiResponse.success("退出成功", null);
    }
}
