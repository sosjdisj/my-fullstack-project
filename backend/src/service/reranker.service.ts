import { pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers'
import { getRedisClient, CacheKeys, CacheTTL } from '@/config/redis'

const RERANKER_MODEL = process.env.RERANKER_MODEL || 'Xenova/ms-marco-MiniLM-L-6-v2'

let rerankerPipeline: FeatureExtractionPipeline | null = null

/**
 * 获取 Reranker 模型实例（单例）
 * 使用 ms-marco-MiniLM-L-6-v2 进行重排序
 */
export async function getRerankerModel(): Promise<FeatureExtractionPipeline> {
    if (!rerankerPipeline) {
        rerankerPipeline = await pipeline('feature-extraction', RERANKER_MODEL) as FeatureExtractionPipeline
    }
    return rerankerPipeline
}

/**
 * 获取文档的 embedding（带Redis缓存）
 */
async function getDocEmbedding(model: FeatureExtractionPipeline, text: string): Promise<number[]> {
    try {
        const redis = getRedisClient()
        const cacheKey = CacheKeys.rerankerEmbedding(text)

        // 1. 尝试从缓存获取
        const cached = await redis.get(cacheKey)
        if (cached) {
            return JSON.parse(cached)
        }

        // 2. 缓存未命中，计算 embedding
        const embedding = await model(text, { pooling: 'mean', normalize: true })
        const vec = Array.from(embedding.data) as number[]

        // 3. 存入缓存（异步，不阻塞主流程）
        redis.setex(cacheKey, CacheTTL.RERANKER_EMBEDDING, JSON.stringify(vec)).catch(err => {
            console.error('[Redis] 缓存 reranker embedding 失败:', err)
        })

        return vec
    } catch (error) {
        // Redis 出错时降级为直接计算
        console.error('[Redis] getDocEmbedding 缓存操作失败，降级为直接计算:', error)
        const embedding = await model(text, { pooling: 'mean', normalize: true })
        return Array.from(embedding.data) as number[]
    }
}

/**
 * 对候选文档进行重排序（带Redis缓存）
 * @param query 用户问题
 * @param candidates 候选文档列表
 * @param topK 返回前 K 个结果
 * @returns 按相关性分数排序后的结果
 */
export async function rerankCandidates(
    query: string,
    candidates: Array<{ chunk: any; score: number }>,
    topK: number = 5
): Promise<Array<{ chunk: any; score: number }>> {
    if (candidates.length === 0) return []

    // 如果候选数少于 topK，直接返回
    if (candidates.length <= topK) {
        return candidates.sort((a, b) => b.score - a.score)
    }

    const model = await getRerankerModel()

    // 优化：预计算 query embedding，避免重复计算
    const queryEmbedding = await model(query, { pooling: 'mean', normalize: true })
    const queryVec = Array.from(queryEmbedding.data)

    // 对每个候选计算相关性分数（带缓存）
    const rerankedResults = await Promise.all(
        candidates.map(async (candidate) => {
            const text = candidate.chunk.content
            try {
                // 使用缓存获取文档 embedding
                const docVec = await getDocEmbedding(model, text)

                // 计算余弦相似度
                const similarity = cosineSimilarity(queryVec, docVec)

                return {
                    chunk: candidate.chunk,
                    // 融合 reranker 分数和原始检索分数（加权）
                    score: similarity * 0.7 + candidate.score * 0.3
                }
            } catch (error) {
                // 如果出错，保留原始分数
                console.error('Rerank error for chunk:', error)
                return candidate
            }
        })
    )

    // 按新分数排序并返回前 topK 个
    return rerankedResults
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
}

/**
 * 计算两个向量的余弦相似度
 */
function cosineSimilarity(vec1: number[] | Float32Array, vec2: number[] | Float32Array): number {
    if (vec1.length !== vec2.length) return 0

    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i]
        norm1 += vec1[i] * vec1[i]
        norm2 += vec2[i] * vec2[i]
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2)
    return denominator === 0 ? 0 : dotProduct / denominator
}