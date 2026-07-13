import Article from '@/models/Article'
import ArticleChunk from '@/models/ArticleChunk'
import type { IArticle } from '@/models/Article'
import { qdrantClient, QDRANT_COLLECTION, ensureQdrantCollection } from '@/config/qdrant'
import { embedTexts, getEmbeddingVectorSize } from '@/service/embedding.service'
import mongoose from 'mongoose'

let initPromise: Promise<void> | null = null

export interface Chunk {
    chunk_index: number;
    content: string;
}

const MAX_CHARS = 800
const OVERLAP_CHARS = 200

/**
 * 按段落 + 滑动窗口切分文本。
 * 超过 MAX_CHARS 时切开，相邻片段保留 OVERLAP_CHARS 重叠内容，保证语义连贯。
 */
export function splitByFixedWindow(content: string): Chunk[] {
    const paragraphs = content.split(/\n\s*\n/).filter(Boolean)
    const chunks: Chunk[] = []
    let buffer = ''
    let index = 0

    for (const para of paragraphs) {
        if (buffer.length + para.length > MAX_CHARS && buffer.length > 0) {
            chunks.push({ chunk_index: index++, content: buffer.trim() })
            buffer = buffer.slice(-OVERLAP_CHARS)
        }
        buffer += (buffer ? '\n\n' : '') + para
    }

    if (buffer.trim()) {
        chunks.push({ chunk_index: index++, content: buffer.trim() })
    }

    return chunks
}

/**
 * 按 Markdown 标题（# / ## / ###）切分文本。
 * 每个标题下的内容作为一个片段；若某段太长，会再用 splitByFixedWindow 二次切分。
 */
export function splitByMarkdownHeadings(content: string): Chunk[] {
    const lines = content.split('\n')
    const rawChunks: Chunk[] = []
    let currentBody: string[] = []
    let currentHeading = ''
    let index = 0

    const flush = () => {
        if (currentBody.length === 0) return
        const body = currentBody.join('\n').trim()
        const headingPrefix = currentHeading ? `${currentHeading}\n` : ''
        rawChunks.push({
            chunk_index: index++,
            content: (headingPrefix + body).trim()
        })
        currentBody = []
    }

    for (const line of lines) {
        if (/^#{1,3}\s+/.test(line)) {
            flush()
            currentHeading = line
        } else {
            currentBody.push(line)
        }
    }
    flush()

    const finalChunks: Chunk[] = []
    let finalIndex = 0

    for (const chunk of rawChunks) {
        if (chunk.content.length > MAX_CHARS) {
            const subChunks = splitByFixedWindow(chunk.content)
            for (const sub of subChunks) {
                finalChunks.push({
                    chunk_index: finalIndex++,
                    content: sub.content
                })
            }
        } else {
            finalChunks.push({
                chunk_index: finalIndex++,
                content: chunk.content
            })
        }
    }

    return finalChunks
}

/**
 * 智能切分入口：有 Markdown 标题则按标题切，否则按段落 + 滑动窗口切。
 */
export function splitArticle(content: string): Chunk[] {
    const hasHeadings = /^#{1,3}\s+/m.test(content)
    return hasHeadings ? splitByMarkdownHeadings(content) : splitByFixedWindow(content)
}

/**
 * 为指定文章重建 chunks：先删除该文章旧 chunks，再切分并插入新 chunks。
 * 若文章非 PUBLIC 或已删除，则清空该文章的所有 chunks。
 * 使用事务保证 deleteMany + insertMany 的原子性。
 */
export async function rebuildChunksForArticle(articleId: string) {
    const article = await Article.findById(articleId).lean() as IArticle | null
    if (!article || article.status !== 'PUBLIC' || article.deleted) {
        await ArticleChunk.deleteMany({ article_id: articleId })
        return []
    }

    const chunks = splitArticle(article.content)

    const docs = chunks.map(chunk => ({
        article_id: article._id,
        title: article.title,
        chunk_index: chunk.chunk_index,
        content: chunk.content,
        category: article.category,
        tag: article.tag,
        published: article.published
    }))

    if (docs.length === 0) {
        await ArticleChunk.deleteMany({ article_id: article._id })
        await deleteQdrantPointsByArticle(article._id.toString())
        return []
    }

    const session = await mongoose.startSession()
    try {
        session.startTransaction()
        await ArticleChunk.deleteMany({ article_id: article._id }).session(session)
        const insertedChunks = await ArticleChunk.insertMany(docs, { session })
        await session.commitTransaction()

        // Qdrant 操作在事务外执行（非 MongoDB，无法参与事务）
        await deleteQdrantPointsByArticle(article._id.toString())
        await upsertChunksToQdrant(insertedChunks, article)

        return insertedChunks.map(c => ({
            article_id: c.article_id,
            title: c.title,
            chunk_index: c.chunk_index,
            content: c.content,
            category: c.category,
            tag: c.tag,
            published: c.published
        }))
    } catch (err) {
        await session.abortTransaction()
        throw err
    } finally {
        session.endSession()
    }
}

/**
 * 删除指定文章在 Qdrant 中的所有向量点
 */
async function deleteQdrantPointsByArticle(articleId: string) {
    try {
        await qdrantClient.delete(QDRANT_COLLECTION, {
            filter: {
                must: [
                    { key: 'article_id', match: { value: articleId } }
                ]
            }
        })
    } catch (err) {
        // 集合可能不存在，忽略错误
    }
}

/**
 * 将 MongoDB 中已保存的 chunks 向量化，并写入 Qdrant。
 */
async function upsertChunksToQdrant(chunks: InstanceType<typeof ArticleChunk>[], article: IArticle) {
    if (chunks.length === 0) return

    const vectors = await embedTexts(chunks.map(c => c.content))

    const points = chunks.map((chunk, idx) => ({
        id: chunk._id.toString(),
        vector: vectors[idx],
        payload: {
            article_id: article._id.toString(),
            title: article.title,
            chunk_index: chunk.chunk_index,
            content: chunk.content
        }
    }))

    await qdrantClient.upsert(QDRANT_COLLECTION, { points })
}

/**
 * 遍历所有 PUBLIC 文章，批量重建 chunks。首次初始化知识库时调用。
 * 返回每篇文章生成的 chunk 数量统计。
 */
export async function rebuildAllChunks() {
    const articles = await Article.find({
        deleted: { $ne: true },
        status: 'PUBLIC'
    }).select('_id').lean()

    const results = []
    for (const article of articles) {
        const docs = await rebuildChunksForArticle(article._id.toString())
        results.push({ article_id: article._id, chunk_count: docs.length })
    }

    return results
}

/**
 * 应用启动时初始化 RAG 知识库。
 * - 确保 Qdrant 集合存在
 * - 如果 Qdrant 里没有向量点，才执行全量重建
 */
export async function initRagKnowledgeBase() {
    // 使用 Promise 缓存避免并发重复初始化
    if (initPromise) return initPromise

    initPromise = (async () => {
        const vectorSize = await getEmbeddingVectorSize()
        await ensureQdrantCollection(vectorSize)

        try {
            const collectionInfo = await qdrantClient.getCollection(QDRANT_COLLECTION)
            const existingCount = collectionInfo.points_count || 0
            const configVectorSize = collectionInfo.config?.params?.vectors?.size || 0

            // 维度不一致，必须重建
            if (existingCount > 0 && configVectorSize === vectorSize) {
                console.log(`[RAG] 已有 ${existingCount} 个向量点，维度匹配(${vectorSize})，跳过重建`)
                return
            }

            if (existingCount > 0 && configVectorSize !== vectorSize) {
                console.log(`[RAG] 维度不匹配(旧=${configVectorSize}, 新=${vectorSize})，删除旧集合重建`)
                await qdrantClient.deleteCollection(QDRANT_COLLECTION)
                await ensureQdrantCollection(vectorSize)
            }

            console.log('[RAG] 开始全量重建...')
            const result = await rebuildAllChunks()
            const totalChunks = result.reduce((sum, r) => sum + r.chunk_count, 0)
            console.log(`[RAG] 全量重建完成，共 ${result.length} 篇文章，${totalChunks} 个 chunks`)
        } catch (err) {
            console.error('[RAG] 初始化失败:', err)
            initPromise = null // 失败时重置，允许重试
        }
    })()

    return initPromise
}
