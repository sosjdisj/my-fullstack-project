import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IArticleChunk extends Document {
    article_id: Types.ObjectId;
    title: string;
    chunk_index: number;
    content: string;
    category?: Types.ObjectId;
    tag?: Types.ObjectId;
    published?: Date;
    vector?: number[];
}

const ArticleChunkSchema: Schema = new Schema({
    article_id: {
        type: Schema.Types.ObjectId,
        ref: 'Article',
        required: [true, '文章ID不能为空']
    },
    title: {
        type: String,
        required: [true, '文章标题不能为空'],
        trim: true
    },
    chunk_index: {
        type: Number,
        required: [true, '片段索引不能为空']
    },
    content: {
        type: String,
        required: [true, '片段内容不能为空'],
        trim: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Categories'
    },
    tag: {
        type: Schema.Types.ObjectId,
        ref: 'Tags'
    },
    published: {
        type: Date
    },
    vector: {
        type: [Number]
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

ArticleChunkSchema.index({ article_id: 1, chunk_index: 1 }, { unique: true });

const ArticleChunk = mongoose.model<IArticleChunk>('ArticleChunk', ArticleChunkSchema);
export default ArticleChunk;
