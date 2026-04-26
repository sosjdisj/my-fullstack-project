import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
    userId: number;
    title: string;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationSchema: Schema = new Schema({
    userId: {
        type: Number,
        required: [true, '用户ID不能为空'],
        trim: true,
        index: true
    },
    title: {
        type: String,
        required: [true, '对话标题不能为空'],
        trim: true,
        default: '新对话'
    }
}, {
    timestamps: true,
    versionKey: false
},)

const Conversation = mongoose.model<IConversation>('conversation', ConversationSchema);
export default Conversation;