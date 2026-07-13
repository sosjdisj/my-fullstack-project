import mongoose, { Schema, Document } from 'mongoose';

export interface IUserLikeSongs extends Document {
    userId: number;
    songId: string;
    isLiked: boolean;
}

const UserLikeSongsSchema: Schema = new Schema({
    userId: {
        type: Number,
        required: [true, '用户ID不能为空'],
        trim: true
    },
    songId: {
        type: String,
        required: [true, '歌曲ID不能为空'],
        trim: true
    },
    isLiked: {
        type: Boolean,
        default: false
    }
});

UserLikeSongsSchema.index({ userId: 1, songId: 1 }, { unique: true });

const UserLikeSongs = mongoose.model<IUserLikeSongs>('user_like_songs', UserLikeSongsSchema);
export default UserLikeSongs;