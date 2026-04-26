import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComments extends Document {
    userId: number,
    articleId: Types.ObjectId,
    content: string,
    createTime: Date,
    deleted: boolean,
    reviewStatus: 'APPROVED' | 'REJECTED'
}

const CommentsSchema: Schema = new Schema({
    userId: {
        type: Number,
        require: true
    },
    articleId: {
        type: Schema.Types.ObjectId,
        ref: 'Article',
        require: true
    },
    content: {
        type: String,
        require: true,
        trim: true
    },
    createTime: {
        type: Date,
        default: Date.now()
    },
    reviewStatus: {
        type: String,
        enum: ['REJECTED', 'APPROVED'],
        default: 'REJECTED'
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: {
        createdAt: 'createTime',
        updatedAt: 'updateTime'
    }
})

const Comments = mongoose.model<IComments>('articles_comments', CommentsSchema);
export default Comments;