import ArticleChunk from '@/models/ArticleChunk'
import { qdrantClient, QDRANT_COLLECTION } from '@/config/qdrant'
import { embedText } from '@/service/embedding.service'
import { rerankCandidates } from '@/service/reranker.service'
import { getRedisClient, CacheKeys, CacheTTL } from '@/config/redis'
import type { IArticleChunk } from '@/models/ArticleChunk'

const DEFAULT_TOP_K = 5
const DEFAULT_CANDIDATE_COUNT = 20

export interface RetrievalResult {
    chunk: IArticleChunk;
    score: number;
}

/**
 * 根据用户问题检索最相关的文章片段（带Redis缓存）。
 * 流程：检查缓存 → 问题向量化 → Qdrant 相似度搜索 → 回 MongoDB 查完整 chunk → Reranker 重排序。
 */
export async function retrieveRelevantChunks(
    question: string,
    topK: number = DEFAULT_TOP_K,
    candidateCount: number = DEFAULT_CANDIDATE_COUNT
): Promise<RetrievalResult[]> {
    try {
        const redis = getRedisClient()
        const cacheKey = CacheKeys.ragResult(question, topK)

        // 1. 尝试从缓存获取
        const cached = await redis.get(cacheKey)
        if (cached) {
            const cachedResults = JSON.parse(cached)
            // 从数据库重新获取完整的chunk数据（缓存中只存储了chunkId）
            const chunkIds = cachedResults.map((r: any) => r.chunkId)
            const chunks = await ArticleChunk.find({ _id: { $in: chunkIds } }).lean()
            const chunkMap = new Map(chunks.map(c => [c._id.toString(), c]))

            return cachedResults.map((r: any) => ({
                chunk: chunkMap.get(r.chunkId)!,
                score: r.score
            }))
        }

        // 2. 缓存未命中，执行完整检索流程
        const queryVector = await embedText(question)

        // 第一阶段：从 Qdrant 多召回候选
        const searchResult = await qdrantClient.search(QDRANT_COLLECTION, {
            vector: queryVector,
            limit: candidateCount,
            with_payload: true
        })

        const chunkIds = searchResult
            .map(r => r.id as string)
            .filter(Boolean)

        if (chunkIds.length === 0) return []

        const chunks = await ArticleChunk.find({ _id: { $in: chunkIds } }).lean()
        const chunkMap = new Map(chunks.map(c => [c._id.toString(), c]))

        const candidates = searchResult
            .filter(r => chunkMap.has(r.id as string))
            .map(r => ({
                chunk: chunkMap.get(r.id as string)!,
                score: r.score
            }))

        // 第二阶段：使用 Reranker 精排
        const rerankedResults = await rerankCandidates(question, candidates, topK)

        const results = rerankedResults.map(r => ({
            chunk: r.chunk as IArticleChunk,
            score: r.score
        }))

        // 3. 存入缓存（只存储chunkId和score，避免数据过大）
        const cacheData = results.map(r => ({
            chunkId: r.chunk._id.toString(),
            score: r.score
        }))
        redis.setex(cacheKey, CacheTTL.RAG_RESULT, JSON.stringify(cacheData)).catch(err => {
            console.error('[Redis] 缓存 RAG 检索结果失败:', err)
        })

        return results
    } catch (error) {
        // Redis 出错时降级为无缓存检索
        console.error('[Redis] retrieveRelevantChunks 缓存操作失败，降级为无缓存:', error)
        return await retrieveRelevantChunksNoCache(question, topK, candidateCount)
    }
}

/**
 * 无缓存的检索流程（降级方案）
 */
async function retrieveRelevantChunksNoCache(
    question: string,
    topK: number = DEFAULT_TOP_K,
    candidateCount: number = DEFAULT_CANDIDATE_COUNT
): Promise<RetrievalResult[]> {
    const queryVector = await embedText(question)

    // 第一阶段：从 Qdrant 多召回候选
    const searchResult = await qdrantClient.search(QDRANT_COLLECTION, {
        vector: queryVector,
        limit: candidateCount,
        with_payload: true
    })

    const chunkIds = searchResult
        .map(r => r.id as string)
        .filter(Boolean)

    if (chunkIds.length === 0) return []

    const chunks = await ArticleChunk.find({ _id: { $in: chunkIds } }).lean()
    const chunkMap = new Map(chunks.map(c => [c._id.toString(), c]))

    const candidates = searchResult
        .filter(r => chunkMap.has(r.id as string))
        .map(r => ({
            chunk: chunkMap.get(r.id as string)!,
            score: r.score
        }))

    // 第二阶段：使用 Reranker 精排
    const rerankedResults = await rerankCandidates(question, candidates, topK)

    return rerankedResults.map(r => ({
        chunk: r.chunk as IArticleChunk,
        score: r.score
    }))
}

/**
 * 把检索到的 chunks 组装成 RAG 上下文文本
 */
export function buildRagContext(results: RetrievalResult[]): string {
    if (results.length === 0) return ''

    return results
        .map((r, idx) => {
            return `[${idx + 1}] ${r.chunk.title}\n${r.chunk.content}`
        })
        .join('\n\n---\n\n')
}

/**
 * 把 RAG 上下文和当前问题合并成一个带引用资料的 prompt
 * 明确区分：博客内容问题用 RAG，其他问题用工具
 */
export function buildRagPrompt(question: string, context: string): string {
    if (!context.trim()) {
        return question
    }

    return `以下是博客文章的参考资料，仅用于回答博客内容相关问题（如技术概念、知识点解释等）：

参考资料：
${context}

用户问题：${question}

注意：
1. 如果问题涉及博客内容、技术知识点、文章内容解释，请优先参考资料回答
2. 如果问题是查询文章列表、搜索文章、获取分类、歌单等，请使用工具而非参考资料
3. 如果资料中没有相关信息，请明确说明或使用工具查询`
}

/**
 * 构建多轮对话的检索查询
 * 策略：提取最近N轮对话中的用户问题，拼接成综合检索查询
 */
export function buildMultiTurnQuery(
    history: Array<{ role: string; content: string }>,
    currentQuestion: string,
    maxTurns: number = 3
): string {
    if (!history || history.length === 0) {
        return currentQuestion
    }

    // 提取历史中的用户问题（按时间倒序）
    const userQuestions = history
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .reverse() // 变为：新 -> 旧
        .slice(0, maxTurns) // 取最近N轮
        .reverse() // 恢复：旧 -> 新

    // 如果没有历史用户问题，直接返回当前问题
    if (userQuestions.length === 0) {
        return currentQuestion
    }

    // 拼接成综合检索查询
    // 使用分隔符连接，保持语义连贯
    const combinedQuery = [...userQuestions, currentQuestion].join(' | ')

    return combinedQuery
}
