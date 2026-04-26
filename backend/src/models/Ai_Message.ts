import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage extends Document {
    conversationId: Types.ObjectId;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema: Schema = new Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: [true, '会话ID不能为空'],
        index: true
    },
    role: {
        type: String,
        required: [true, '消息角色不能为空'],
        enum: ['user', 'assistant', 'system']
    },
    content: {
        type: String,
        required: [true, '消息内容不能为空'],
        trim: true
    },
}, {
    timestamps: true
})

// 复合索引：按会话和时间查询历史消息
MessageSchema.index({ conversationId: 1, createdAt: 1 });
MessageSchema.index({ conversationId: 1, role: 1 });

const Message = mongoose.model<IMessage>('ai_message', MessageSchema);
export default Message;