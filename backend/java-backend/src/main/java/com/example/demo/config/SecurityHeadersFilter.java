package com.example.demo.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

/**
 * 统一注入安全响应头，防止点击劫持、MIME 嗅探、降级攻击等常见 Web 安全问题。
 * 通过 OncePerRequestFilter 保证每个请求（含异常响应）都会带上这些头。
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SecurityHeadersFilter extends OncePerRequestFilter {

    // 对所有响应注入的基础安全头
    private static final Map<String, String> BASE_HEADERS = Map.of(
            "X-Content-Type-Options", "nosniff",
            "X-Frame-Options", "DENY",
            "X-XSS-Protection", "1; mode=block",
            "Referrer-Policy", "no-referrer"
    );

    // 仅对 API 响应注入的禁缓存头，避免敏感接口数据被中间代理或浏览器缓存
    private static final Map<String, String> NO_CACHE_HEADERS = Map.of(
            "Cache-Control", "no-store, no-cache, must-revalidate, max-age=0",
            "Pragma", "no-cache",
            "Expires", "0"
    );

    /** 放行请求并为响应注入安全头，对 /api/ 路径额外追加禁缓存头 */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        // 先放行，确保业务逻辑执行；响应头在返回前注入
        filterChain.doFilter(request, response);

        BASE_HEADERS.forEach((key, value) -> response.setHeader(key, value));

        String uri = request.getRequestURI();
        if (uri != null && uri.startsWith("/api/")) {
            NO_CACHE_HEADERS.forEach((key, value) -> response.setHeader(key, value));
        }
    }
}
