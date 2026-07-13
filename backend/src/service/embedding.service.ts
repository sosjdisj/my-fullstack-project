import { OllamaEmbeddings } from '@langchain/ollama'
import { getRedisClient, CacheKeys, CacheTTL } from '@/config/redis'

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'embeddinggemma:300m'

let embeddingsInstance: OllamaEmbeddings | null = null

/**
 * 获取 Ollama Embedding 模型实例（单例）
 */
export function getEmbeddingsModel(): OllamaEmbeddings {
    if (!embeddingsInstance) {
        embeddingsInstance = new OllamaEmbeddings({
            model: EMBEDDING_MODEL,
            baseUrl: OLLAMA_BASE_URL
        })
    }
    return embeddingsInstance
}

/**
 * 将单段文本转为 embedding 向量（带Redis缓存）
 */
export async function embedText(text: string): Promise<number[]> {
    try {
        const redis = getRedisClient()
        const cacheKey = CacheKeys.embedding(text)

        // 1. 尝试从缓存获取
        const cached = await redis.get(cacheKey)
        if (cached) {
            return JSON.parse(cached)
        }

        // 2. 缓存未命中，调用 Ollama 计算
        const embeddings = getEmbeddingsModel()
        const vector = await embeddings.embedQuery(text)

        // 3. 存入缓存（异步，不阻塞主流程）
        redis.setex(cacheKey, CacheTTL.EMBEDDING, JSON.stringify(vector)).catch(err => {
            console.error('[Redis] 缓存 embedding 失败:', err)
        })

        return vector
    } catch (error) {
        // Redis 出错时降级为直接计算
        console.error('[Redis] embedText 缓存操作失败，降级为直接计算:', error)
        const embeddings = getEmbeddingsModel()
        return await embeddings.embedQuery(text)
    }
}

/**
 * 批量将文本转为 embedding 向量（带Redis缓存）
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
    try {
        const redis = getRedisClient()
        const results: number[][] = new Array(texts.length)
        const uncachedIndices: number[] = []
        const uncachedTexts: string[] = []

        // 1. 批量检查缓存
        for (let i = 0; i < texts.length; i++) {
            const cacheKey = CacheKeys.embedding(texts[i])
            const cached = await redis.get(cacheKey)

            if (cached) {
                results[i] = JSON.parse(cached)
            } else {
                uncachedIndices.push(i)
                uncachedTexts.push(texts[i])
            }
        }

        // 2. 批量计算未命中的文本
        if (uncachedTexts.length > 0) {
            const embeddings = getEmbeddingsModel()
            const newVectors = await embeddings.embedDocuments(uncachedTexts)

            // 3. 存入缓存并填充结果
            for (let i = 0; i < uncachedIndices.length; i++) {
                const originalIndex = uncachedIndices[i]
                const vector = newVectors[i]

                results[originalIndex] = vector

                // 异步存入缓存
                const cacheKey = CacheKeys.embedding(uncachedTexts[i])
                redis.setex(cacheKey, CacheTTL.EMBEDDING, JSON.stringify(vector)).catch(err => {
                    console.error('[Redis] 缓存 embedding 失败:', err)
                })
            }
        }

        return results
    } catch (error) {
        // Redis 出错时降级为直接计算
        console.error('[Redis] embedTexts 缓存操作失败，降级为直接计算:', error)
        const embeddings = getEmbeddingsModel()
        return await embeddings.embedDocuments(texts)
    }
}

/**
 * 探测当前 embedding 模型的向量维度
 */
export async function getEmbeddingVectorSize(): Promise<number> {
    const vector = await embedText('test')
    return vector.length
}
