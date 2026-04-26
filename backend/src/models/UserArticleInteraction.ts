import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserArticleInteraction extends Document {
    userId: number;
    articleId: Types.ObjectId;
    isLiked: boolean;
    isCollected: boolean;
}

const UserArticleInteractionSchema: Schema = new Schema({
    userId: {
        type: Number,
        required: [true, '用户ID不能为空'],
        trim: true
    },
    articleId: {
        type: Types.ObjectId,
        required: [true, '文章ID不能为空'],
        trim: true
    },
    isLiked: {
        type: Boolean,
        default: true
    },
    isCollected: {
        type: Boolean,
        default: true
    }
});

const UserArticleInteraction = mongoose.model<IUserArticleInteraction>('user_article_interactions', UserArticleInteractionSchema);
export default UserArticleInteraction;

