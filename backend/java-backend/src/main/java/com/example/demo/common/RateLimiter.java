package com.example.demo.common;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * 基于 Redis 的滑动窗口限流器，支持按维度（IP、手机号等）限制访问频率。
 * 用 INCR + EXPIRE 实现：首次访问时设置过期时间，窗口内累加计数。
 */
@Component
@RequiredArgsConstructor
public class RateLimiter {

    private static final String KEY_PREFIX = "rate_limit:";

    private final StringRedisTemplate redisTemplate;

    /** 判断指定维度在时间窗口内是否超出访问限制，返回 true 表示放行、false 表示被限流 */
    public boolean tryAcquire(String dimension, String identity, int limit, Duration window) {
        String key = KEY_PREFIX + dimension + ":" + identity;
        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1L) {
            // 首次访问，设置过期时间
            redisTemplate.expire(key, window);
        }
        return count != null && count <= limit;
    }
}
