package com.example.demo.common;

import org.springframework.data.redis.core.StringRedisTemplate;

import java.time.Duration;

/**
 * 写操作幂等工具：基于 Redis SETNX 做请求级防重，
 * 同一用户对同一资源的同一操作在 TTL 窗口内只放行一次。
 * Redis 故障时降级放行，不阻塞主流程。
 */
public final class IdempotencyUtil {

    private static final String KEY_PREFIX = "idem:";
    private static final Duration KEY_TTL = Duration.ofSeconds(10);

    private IdempotencyUtil() {
    }

    /**
     * 请求级防重：10 秒内同一用户对同一资源的同一操作重复请求直接拒绝。
     *
     * @param userId     用户 ID
     * @param action     操作类型（like / unlike / collect / uncollect 等）
     * @param resourceId 资源 ID（文章/歌曲/歌单等）
     */
    public static void checkAndSet(StringRedisTemplate redisTemplate, Integer userId, String action, String resourceId) {
        try {
            String key = KEY_PREFIX + userId + ":" + action + ":" + resourceId;
            Boolean acquired = redisTemplate.opsForValue().setIfAbsent(key, "1", KEY_TTL);
            if (!Boolean.TRUE.equals(acquired)) {
                throw new BusinessException(429, "操作过于频繁，请稍后再试");
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            // Redis 故障降级放行，不阻塞主流程
        }
    }
}
