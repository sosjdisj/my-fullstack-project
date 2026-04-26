import mongoose, { Schema, Document } from 'mongoose';

export interface ITreehole extends Document {
    content: string,
    userId: number,
    createTime: Date,
    reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED',
    deleted: boolean
}

const TreeholeSchema: Schema = new Schema({
    content: {
        type: String,
        required: [true, '弹幕内容不能为空'],
        trim: true
    },
    userId: {
        type: Number,
        required: true
    },
    createTime: {
        type: Date,
        required: [true, '发送时间不能为空'],
        trim: true
    },
    reviewStatus: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
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

const Treehole = mongoose.model<ITreehole>('treehole_messages', TreeholeSchema);
export default Treehole;