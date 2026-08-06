// export interface SongItem {
//     id: number
//     name: string
//     imgs: string
//     path: string
//     singer: string
//     duration: string
//     playback: number
// }

export interface Playlist {
    id: string
    name: string;
    creator: string;
    creatorAvatar: string;
    description: string;
    coverImage: string;
    playCount: number;
}

export interface PlaylistDetail extends Playlist {
    createdAt: string;
    songCount: number;
    isCollected?: boolean;
}

export interface Song {
    id: string
    playlistId: string
    name: string           // 歌曲名称
    singer: string         // 歌手
    cover: string           // 图片地址（可能为空）
    path?: string           // 音频文件路径
    duration: string       // 时长 "mm.ss" 格式
    playback: number
    isLiked?: boolean
}

export interface DataResponse {
    library: Playlist[]           // 音乐库/我的歌单
    favoritePlaylists: Playlist[] // 收藏的歌单
    favoriteSongs: Song[]
}

export interface ChartData {
    tagName: string;
    icon: string;
    desc: string;
    songs: Song[];
}

export interface MusicRecommendation {
    id: number;
    image: string;
    title: string;
    description: string;
    alt: string;
}