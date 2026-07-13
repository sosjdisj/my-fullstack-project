import mongoose, { Schema, Document, Types } from 'mongoose';

// 定义 TS 接口，约束文章文档类型
export interface IArticle extends Document {
    category: Types.ObjectId;
    tag: Types.ObjectId;
    cover: string;
    title: string;
    author: number;
    wordCount: number;
    pageViews: number;
    likes: number;
    collects: number;
    published: Date;
    updated: Date;
    status: string;
    content: string
    deleted: boolean
}

// 定义 Schema
const ArticleSchema: Schema = new Schema({
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Categories',
        required: [true, '文章分类不能为空']
    },
    tag: {
        type: Schema.Types.ObjectId,
        ref: 'Tags',
        required: [true, '文章标签不能为空']
    },
    cover: {
        type: String,
        required: [true, '文章封面图路径不能为空'],
        trim: true
    },
    title: {
        type: String,
        required: [true, '文章标题不能为空'],
        trim: true
    },
    author: {
        type: Number,
        required: [true, '文章作者不能为空']
    },
    wordCount: {
        type: Number,
        required: [true, '文章字数不能为空'],
        min: [1, '字数不能小于1']
    },
    pageViews: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    collects: {
        type: Number,
        default: 0
    },
    published: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String,
        required: [true, '文章正文不能为空'],
        trim: true
    },
    status: {
        type: String,
        enum: ['PUBLIC', 'DRAFT', 'RECYCLE'],
        default: 'DRAFT'
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: {
        createdAt: 'published',  // 将 createdAt 映射到 published
        updatedAt: 'updated'
    }
});

ArticleSchema.index({ status: 1, deleted: 1 });
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ tag: 1 });

// 创建并导出 Model
const Article = mongoose.model<IArticle>('Article', ArticleSchema);
export default Article;