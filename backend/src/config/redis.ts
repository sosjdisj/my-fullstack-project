import Redis from 'ioredis'
import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379')
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined
const REDIS_DB = parseInt(process.env.REDIS_DB || '0')

let redisClient: Redis | null = null

/**
 * 获取 Redis 客户端实例（单例）
 */
export function getRedisClient(): Redis {
    if (!redisClient) {
        redisClient = new Redis({
            host: REDIS_HOST,
            port: REDIS_PORT,
            password: REDIS_PASSWORD,
            db: REDIS_DB,
            // 连接失败时重试策略
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000)
                return delay
            },
            // 最大重试次数
            maxRetriesPerRequest: 3
        })

        redisClient.on('connect', () => {
            console.log('Redis 连接成功')
        })

        redisClient.on('error', (err) => {
            console.error('Redis 连接错误:', err)
        })
    }

    return redisClient
}

/**
 * 关闭 Redis 连接
 */
export async function closeRedis(): Promise<void> {
    if (redisClient) {
        await redisClient.quit()
        redisClient = null
    }
}

/**
 * 缓存键生成工具
 */
export const CacheKeys = {
    // Embedding 缓存键：基于文本内容哈希
    embedding: (text: string) => `embedding:${hashText(text)}`,

    // RAG 检索结果缓存键：基于查询问题哈希
    ragResult: (query: string, topK: number) => `rag:result:${hashText(query)}:${topK}`,

    // Reranker 文档 embedding 缓存键：基于文档内容哈希
    rerankerEmbedding: (text: string) => `reranker:embedding:${hashText(text)}`,

    // 对话历史缓存键：基于对话ID
    chatHistory: (conversationId: string, limit: number) => `chat:history:${conversationId}:${limit}`,

    // 用户token缓存键：基于用户ID（用于子应用和主应用共享token）
    userToken: (userId: number) => `user:token:${userId}`
}

/**
 * 文本哈希函数（用于生成缓存键）
 * 使用 SHA-256 避免碰撞，截取前 16 字符作为紧凑键
 */
function hashText(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16)
}

/**
 * 缓存过期时间（秒）
 */
export const CacheTTL = {
    EMBEDDING: 7 * 24 * 60 * 60,        // 7天（embedding不会变）
    RAG_RESULT: 60 * 60,                 // 1小时（检索结果可能随数据更新变化）
    RERANKER_EMBEDDING: 7 * 24 * 60 * 60, // 7天（文档embedding不会变）
    CHAT_HISTORY: 5 * 60,                // 5分钟（对话历史会频繁更新）
    USER_TOKEN: 2 * 60 * 60              // 2小时（与accessToken有效期一致）
}