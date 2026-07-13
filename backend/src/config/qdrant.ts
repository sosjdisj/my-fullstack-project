import { QdrantClient } from '@qdrant/js-client-rest'

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333'
const QDRANT_API_KEY = process.env.QDRANT_API_KEY
export const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION || 'article_chunks'

export const qdrantClient = new QdrantClient({
    url: QDRANT_URL,
    apiKey: QDRANT_API_KEY
})

/**
 * 确保 Qdrant 集合存在。若不存在则创建，向量维度会自动探测一次 embedding 输出。
 */
export async function ensureQdrantCollection(vectorSize?: number) {
    const collections = await qdrantClient.getCollections()
    const exists = collections.collections.some(c => c.name === QDRANT_COLLECTION)

    if (exists) return

    const size = vectorSize || parseInt(process.env.EMBEDDING_VECTOR_SIZE || '0', 10)
    if (!size) {
        throw new Error('无法创建 Qdrant 集合：未提供向量维度，请先设置 EMBEDDING_VECTOR_SIZE 或在调用时传入')
    }

    await qdrantClient.createCollection(QDRANT_COLLECTION, {
        vectors: {
            size,
            distance: 'Cosine'
        }
    })
}
