package com.example.demo.config;

import com.example.demo.middleware.JwtParser;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final JwtParser jwtParser;

    @Value("${upload.dir}")
    private String uploadDir;

    /** 注册 JWT 拦截器，拦截所有请求进行鉴权 */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtParser)
                .addPathPatterns("/**");
    }

    /** 将 /uploads/** 映射到本地上传目录，使头像等静态文件可通过 URL 访问 */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 把 /uploads/** 映射到本地 upload.dir 目录，让头像等静态文件能通过 URL 访问
        String location = uploadDir.endsWith("/") ? uploadDir : uploadDir + "/";
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + location);
    }
}
