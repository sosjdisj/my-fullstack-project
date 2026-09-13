export type FormField = 'username' | 'password' | 'confirmpassword' | 'email' | 'account';

export interface LoginResult {
    username?: string | undefined
    password?: string | undefined
    confirmpassword?: string | undefined
    email?: string | undefined
    account?: string | undefined
}

export interface Mark {
    username: string,
    email: string,
    signature: string,
    cover: string | null
}

export interface Article {
    id: string;
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
    id: string,
    title: string,
}

export interface RandomArticle {
    id: string,
    title: string,
    cover: string,
    published: string,
}

export interface ArticleComment {
    _id: number;
    username: string;
    avatar: string;
    content: string;
    createTime: string
}

export interface TimelineList {
    id: string,
    title: string,
    cover: string,
    published: string,
}

export interface DanmakusList {
    id: string,
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
    id: string,
    cover: string
    title: string
    category: string
    tag: string
    published: string
    content: string
}

export interface ArticleCard {
    id: string
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
    id: string,
    title: string,
    createdAt: string
}