export type FormField = 'username' | 'password' | 'confirmpassword' | 'email' | 'phone';

export interface LoginResult {
    username: string | undefined
    password?: string | undefined
    confirmpassword?: string | undefined
    phone?: string | undefined
    email?: string | undefined
}

export interface LoginFormData {
    username: string // 用户名/邮箱
    password: string // 密码
}

export interface Mark {
    username: string,
    phone: string,
    signature: string,
    cover: string | null
}

export interface Article {
    _id: string;
    cover: string;
    title: string;
    pageViews: number;
    comments: number;
    likes: number;
    // path: string;
    wordCount: number;
    category: string;
    author: string;
    avatar: string;
    collects: number;
    tag: string;
    published: string;
    updated: string
    content: string
    isLiked: boolean,
    isCollected: boolean
}

export interface ArticleNeighbor {
    _id: string,
    title: string,
    cover: string,
    published: string
}

export interface ArticleComment {
    _id: number;
    username: string;
    avatar: string;
    content: string;
    createTime: string
}

export interface TimelineList {
    _id: string,
    title: string,
    cover: string,
    published: string,
}

export interface DanmakusList {
    _id: string,
    content: string,
    userId: number
    avatar: string
}

export interface TabCategoryItem {
    _id: number
    name: string
    articleCount: number
    desc: string;
    icon: string
}

export interface collectedArticles {
    _id: string,
    cover: string
    title: string
    category: string
    tag: string
    published: string
    content: string
}

export interface ArticleCard {
    _id: string
    cover: string
    title: string
    category: string
    tag: string
    content: string
    pageViews: number;
    likes: number;
    published: string
}

export interface AiChat {
    _id?: string,
    createdAt?: string,
    role: 'assistant' | 'user',
    content: string
}

export interface Conversations {
    _id: string,
    title: string,
    createdAt: string
}