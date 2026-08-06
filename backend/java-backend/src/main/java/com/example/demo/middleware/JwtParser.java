package com.example.demo.middleware;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtParser implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    /** 请求前置处理：校验 Authorization 头中的 JWT，未携带则放行匿名访问，校验失败返回 401 */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String authHeader = request.getHeader("Authorization");

        // 未携带 Authorization 头：视为匿名访问，公开接口由 Controller 自行决定是否调用 getAuth()
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return true;
        }

        String token = authHeader.substring(7);
        JwtUtil.UserInfo userInfo = jwtUtil.verifyToken(token);

        // 携带了 token 但校验失败：直接拒绝，避免伪造 token 绕过认证
        if (userInfo == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(
                    new ObjectMapper().writeValueAsString(ApiResponse.error(401, "登录已过期，请重新登录"))
            );
            return false;
        }

        request.setAttribute("auth", userInfo);
        return true;
    }
}
