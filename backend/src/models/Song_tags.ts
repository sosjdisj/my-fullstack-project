import mongoose, { Schema, Document } from 'mongoose';

export interface ISongTags extends Document {
    name: string;
    icon: string;
    desc: string;
    songCount: number;
    createTime: Date;
    status: 'ACTIVE' | 'INACTIVE';
    deleted: boolean;
}

const SongTagsSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, '歌曲标签名称不能为空'],
        unique: true,
        trim: true
    },
    icon: {
        type: String,
        required: [true, '歌曲标签图标不能为空'],
        trim: true
    },
    desc: {
        type: String,
        required: [true, '歌曲标签描述不能为空'],
        trim: true
    },
    songCount: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        default: 'ACTIVE',
        enum: ['ACTIVE', 'INACTIVE']
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
});

const SongTags = mongoose.model<ISongTags>('Song_tags', SongTagsSchema);
export default SongTags;