import mongoose, { Schema, Document } from 'mongoose';

export interface ICategories extends Document {
    name: string;
    icon: string;
    desc: string,
    createTime: Date,
    status: 'ACTIVE' | 'INACTIVE',
    deleted: boolean
}

const CategoriesSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, '文章分类名字不能为空'],
        trim: true
    },
    icon: {
        type: String,
        required: [true, '文章分类图标不能为空'],
        trim: true
    },
    desc: {
        type: String,
        required: [true, '文章分类小标题不能为空'],
        trim: true
    },
    createTime: {
        type: Date,
        default: Date.now()
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
},{
    timestamps: {
        createdAt: 'createTime',
        updatedAt: 'updateTime'
    }
})

const Categories = mongoose.model<ICategories>('Categories', CategoriesSchema);
export default Categories;