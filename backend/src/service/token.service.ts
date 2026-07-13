import { getRedisClient, CacheKeys, CacheTTL } from '@/config/redis'
import type { userInfo } from '@/utils/auth'

/**
 * Token 缓存数据结构
 */
interface TokenCacheData {
    accessToken: string
    userId: number
    username: string
    cover: string | null
    signature: string | null
    createdAt: number // 存入Redis的时间戳
}

/**
 * 将用户token存入Redis
 * @param userId 用户ID
 * @param accessToken 访问令牌
 * @param userInfo 用户信息
 */
export async function saveTokenToRedis(
    userId: number,
    accessToken: string,
    userInfo: {
        username: string
        cover: string | null
        signature: string | null
    }
): Promise<void> {
    try {
        const redis = getRedisClient()
        const cacheKey = CacheKeys.userToken(userId)

        const tokenData: TokenCacheData = {
            accessToken,
            userId,
            username: userInfo.username,
            cover: userInfo.cover,
            signature: userInfo.signature,
            createdAt: Date.now()
        }

        // 存入Redis,设置过期时间为2小时
        await redis.setex(
            cacheKey,
            CacheTTL.USER_TOKEN,
            JSON.stringify(tokenData)
        )

        console.log(`Token已存入Redis, userId: ${userId}`)
    } catch (error) {
        console.error('Token存入Redis失败:', error)
        // 不抛出错误,避免影响登录流程
    }
}

/**
 * 从Redis获取用户token
 * @param userId 用户ID
 * @returns Token数据或null
 */
export async function getTokenFromRedis(userId: number): Promise<TokenCacheData | null> {
    try {
        const redis = getRedisClient()
        const cacheKey = CacheKeys.userToken(userId)

        const cachedData = await redis.get(cacheKey)

        if (!cachedData) {
            return null
        }

        const tokenData: TokenCacheData = JSON.parse(cachedData)

        // 检查是否过期（双重保险）
        const elapsedSeconds = (Date.now() - tokenData.createdAt) / 1000
        if (elapsedSeconds > CacheTTL.USER_TOKEN) {
            // 已过期,删除缓存
            await redis.del(cacheKey)
            return null
        }

        console.log(`从Redis获取Token成功, userId: ${userId}`)
        return tokenData
    } catch (error) {
        console.error('从Redis获取Token失败:', error)
        return null
    }
}

/**
 * 删除Redis中的用户token
 * @param userId 用户ID
 */
export async function deleteTokenFromRedis(userId: number): Promise<void> {
    try {
        const redis = getRedisClient()
        const cacheKey = CacheKeys.userToken(userId)
        await redis.del(cacheKey)
        console.log(`Token已从Redis删除, userId: ${userId}`)
    } catch (error) {
        console.error('Token删除失败:', error)
    }
}