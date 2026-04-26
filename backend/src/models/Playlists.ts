import mongoose, { Schema, Document } from 'mongoose';

export interface Iplaylists extends Document {
    name: string,
    creator: string,
    description: string,
    coverImage: string,
    playCount: number,
    path: string,
    updateTime: Date,
    collects: number
    deleted: boolean
}

const PlaylistsSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, '播放列表名字不能为空'],
        trim: true
    },
    creator: {
        type: String,
        required: [true, '创建者不能为空'],
        trim: true
    },
    description: {
        type: String,
        required: [true, '播放列表描述不能为空'],
        trim: true
    },
    coverImage: {
        type: String,
        required: [true, '封面图片不能为空'],
        trim: true
    },
    playCount: {
        type: Number,
        default: 0
    },
    path: {
        type: String,
        required: [true, '路由路径不能为空'],
        trim: true
    },
    updateTime: {
        type: Date,
        default: Date.now
    },
    collects: {
        type: Number,
        default: 0
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const Playlists = mongoose.model<Iplaylists>('Playlists', PlaylistsSchema);
export default Playlists;
