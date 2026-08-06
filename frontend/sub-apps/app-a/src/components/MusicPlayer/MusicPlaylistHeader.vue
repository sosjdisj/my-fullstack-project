<template>
    <div class="playlist-header">
        <div class="cover-side">
            <div class="glass-cover">
                <img :src="MusicList.coverImage" alt="歌单封面" />
                <div class="play-glow-btn">
                    <div class="triangle"></div>
                </div>
            </div>
        </div>

        <div class="info-side">
            <span class="type-badge">PLAYLIST</span>
            <h1 class="main-title">{{ MusicList.name }}</h1>
            <p class="description">{{ MusicList.description || '精选了一些我最喜欢的音乐，享受此刻。' }}</p>

            <div class="meta-row">
                <div class="creator-box">
                    <img :src="MusicList.creatorAvatar" alt="Avatar" class="mini-avatar" />
                    <span class="name">{{ MusicList.creator }}</span>
                </div>
                <div class="dot-stats">
                    <div class="stat-item">
                        <span class="stat-label">createdAt</span>
                        <span class="stat-value">{{ formatDate(MusicList.createdAt) }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Songs</span>
                        <span class="stat-value">{{ MusicList.songCount }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Plays</span>
                        <span class="stat-value">{{ formatPlayCount(MusicList.playCount) }}</span>
                    </div>
                </div>
            </div>

            <div class="action-bar">
                <button class="glass-btn-primary" @click="handlePlayAll">
                    <svg viewBox="0 0 24 24" width="22">
                        <path d="M8 5v14l11-7z" fill="currentColor" />
                    </svg>
                    播放全部
                </button>
                <button :class="['glass-btn-secondary', { 'active': isCollected }]"
                    @click="handFavoriteClick(props.id)">
                    <svg viewBox="0 0 24 24" width="20">
                        <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="currentColor" />
                    </svg>
                    {{ isCollected ? '已收藏' : '收藏歌单' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { useUserStore } from '@/stores/user'
    import type { PlaylistDetail, Song } from '@/types'
    import { formatDate, formatPlayCount } from '@/utils/format'

    const store = useUserStore()
    const props = defineProps<{
        id: string
        currentPlaylistData: Song[]
        MusicList: PlaylistDetail
        isCollected: boolean
    }>()

    const emit = defineEmits<{
        (e: 'favorite', id: string, isfavorite: boolean): void
    }>()

    const handFavoriteClick = (id: string) => {
        emit('favorite', id, !props.isCollected)
    }
    const handlePlayAll = () => {
        store.selectedmusic = props.currentPlaylistData[0]
        store.songs = props.currentPlaylistData
    }
</script>

<style lang="less" scoped>
    @glass-border: rgba(255, 255, 255, 0.2);
    @accent: #667eea;

    // 2. 歌单头部
    .playlist-header {
        display: flex;
        gap: 50px;
        margin-bottom: 60px;
        align-items: flex-end;

        .glass-cover {
            position: relative;
            width: 280px;
            height: 280px;
            border-radius: 30px;
            overflow: hidden;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
            border: 1px solid @glass-border;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: 0.5s;
            }

            .play-glow-btn {
                position: absolute;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                background: @accent;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 10px 20px rgba(102, 126, 234, 0.5);
                opacity: 0;
                transform: translateY(10px);
                transition: 0.3s;

                .triangle {
                    width: 0;
                    height: 0;
                    border-left: 15px solid white;
                    border-top: 10px solid transparent;
                    border-bottom: 10px solid transparent;
                    margin-left: 5px;
                }
            }

            &:hover {
                img {
                    transform: scale(1.1);
                }

                .play-glow-btn {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        }

        .info-side {
            flex: 1;

            .type-badge {
                font-weight: 800;
                letter-spacing: 2px;
                color: @accent;
                font-size: 12px;
            }

            .main-title {
                font-size: 34px;
                font-weight: 900;
                margin: 10px 0;
                color: #2d3436;
                text-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
            }

            .description {
                font-size: 16px;
                color: #636e72;
                margin-bottom: 25px;
                line-height: 1.6;
                max-width: 600px;
            }

            .meta-row {
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 30px;

                .creator-box {
                    display: flex;
                    align-items: center;
                    gap: 10px;

                    .mini-avatar {
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                    }

                    .name {
                        font-weight: 700;
                        color: #333;
                    }
                }

                .dot-stats {
                    display: grid;
                    grid-template-columns: repeat(3, auto);
                    gap: 20px;
                    color: #888;

                    .stat-item {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 4px;

                        .stat-label {
                            font-size: 12px;
                            font-weight: 600;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            color: #999;
                            text-align: center;
                        }

                        .stat-value {
                            font-size: 14px;
                            font-weight: 500;
                            color: #666;
                            text-align: center;
                        }
                    }
                }
            }

            .action-bar {
                display: flex;
                gap: 15px;

                .glass-btn-primary {
                    background: @accent;
                    color: white;
                    border: none;
                    padding: 12px 35px;
                    border-radius: 50px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: 0.3s;

                    &:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
                    }
                }

                .glass-btn-secondary {
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    border: 1px solid @glass-border;
                    color: #333;
                    padding: 12px 25px;
                    border-radius: 50px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: 0.3s;

                    &:hover {
                        background: rgba(255, 255, 255, 0.4);
                    }

                    &.active {
                        color: @accent;
                        border-color: @accent;
                    }
                }
            }
        }
    }

    // 适配
    @media (max-width: 768px) {
        .playlist-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
    }
</style>