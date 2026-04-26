import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISongs extends Document {
    name: string,
    singer: string,
    cover: string
    duration: string
    playback: number,
    playlist_id: Types.ObjectId
    likes: number
    song_tags: Types.ObjectId
    deleted: boolean
}

const SongsSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    singer: {
        type: String,
        required: true,
        trim: true
    },
    cover: {
        type: String,
        required: true,
        trim: true
    },
    duration: {
        type: String,
        required: true,
        trim: true
    },
    playback: {
        type: Number,
        required: true,
        default: 0
    },
    playlist_id: {
        type: Types.ObjectId,
        required: true,
        trim: true
    },
    likes: {
        type: Number,
        default: 0
    },
    song_tags: {
        type: Schema.Types.ObjectId,
        ref: 'song_tags',
        required: [true, '歌曲标签不能为空']
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

// 创建并导出 Model
const Songs = mongoose.model<ISongs>('Songs', SongsSchema);
export default Songs;