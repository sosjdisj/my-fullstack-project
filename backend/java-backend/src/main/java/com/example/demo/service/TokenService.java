package com.example.demo.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class TokenService {

    private static final String TOKEN_KEY_PREFIX = "user:token:";
    private static final long TOKEN_TTL_HOURS = 2;

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public TokenService(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public void saveTokenToRedis(Integer userId, String accessToken, Object userInfo) {
        try {
            TokenCacheData cacheData = new TokenCacheData();
            cacheData.setAccessToken(accessToken);
            cacheData.setUserId(userId);
            cacheData.setCreatedAt(System.currentTimeMillis());

            // 从 userInfo 对象提取字段
            if (userInfo instanceof com.example.demo.common.JwtUtil.UserInfo info) {
                cacheData.setUsername(info.getUsername());
                cacheData.setCover(info.getCover());
                cacheData.setSignature(info.getSignature());
            }

            String json = objectMapper.writeValueAsString(cacheData);
            String key = TOKEN_KEY_PREFIX + userId;
            redisTemplate.opsForValue().set(key, json, TOKEN_TTL_HOURS, TimeUnit.HOURS);
            log.debug("Token saved to Redis for userId: {}", userId);
        } catch (JsonProcessingException e) {
            log.error("Failed to save token to Redis for userId: {}", userId, e);
        }
    }

    public TokenCacheData getTokenFromRedis(Integer userId) {
        try {
            String key = TOKEN_KEY_PREFIX + userId;
            String json = redisTemplate.opsForValue().get(key);
            if (json == null) {
                return null;
            }

            TokenCacheData cacheData = objectMapper.readValue(json, TokenCacheData.class);

            // 检查是否过期（2小时）
            long elapsed = System.currentTimeMillis() - cacheData.getCreatedAt();
            if (elapsed > TOKEN_TTL_HOURS * 60 * 60 * 1000) {
                deleteTokenFromRedis(userId);
                return null;
            }

            return cacheData;
        } catch (JsonProcessingException e) {
            log.error("Failed to get token from Redis for userId: {}", userId, e);
            return null;
        }
    }

    public void deleteTokenFromRedis(Integer userId) {
        String key = TOKEN_KEY_PREFIX + userId;
        redisTemplate.delete(key);
        log.debug("Token deleted from Redis for userId: {}", userId);
    }

    @Data
    public static class TokenCacheData {
        private String accessToken;
        private Integer userId;
        private String username;
        private String cover;
        private String signature;
        private long createdAt;
    }
}
