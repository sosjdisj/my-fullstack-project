import mongoose, { Schema, Document } from 'mongoose';

export interface IQuotes extends Document {
    content: string
    deleted: boolean
}

const QuotesSchema: Schema = new Schema({
    content: {
        type: String,
        required: [true, '句子不能为空'],
        trim: true
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const Quotes = mongoose.model<IQuotes>('Quotes', QuotesSchema);
export default Quotes;