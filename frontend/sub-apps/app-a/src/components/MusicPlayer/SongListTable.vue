<template>
    <div class="song-table">
        <div class="table-thead">
            <div class="th-idx">#</div>
            <div class="th-title">歌曲</div>
            <div class="th-playback">热度</div>
            <div class="th-time">时长</div>
            <div class="th-opt"></div>
        </div>

        <div class="song-row" v-for="(value, index) in songs" :key="value.id"
            @click="handSelecteDmusic(value)">
            <div class="td-idx">{{ (index + 1).toString().padStart(2, '0') }}</div>
            <div class="td-title">
                <div class="song-name-row">
                    <span class="song-name">{{ value.name }}</span>
                    <span class="vip-tag" v-if="index % 3 === 0">HQ</span>
                </div>
                <div class="song-artist">{{ value.singer }}</div>
            </div>
            <div class="td-playback">
                <div class="heat-bar">
                    <div class="heat-fill" :style="{ width: (value.playback / 10 * 100) + '%' }"></div>
                </div>
            </div>
            <div class="td-time">{{ value.duration }}</div>
            <div class="td-opt">
                <button class="row-like" :class="{ liked: store.UserLikesSong.includes(value.id) }"
                    @click.stop="store.toggleSongLikeStatus(value.id)">
                    <svg viewBox="0 0 24 24" width="18">
                        <path
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                            fill="currentColor" />
                    </svg>
                </button>
            </div>
        </div>
        
        <InfiniteScrollContainer
            :load-more="onLoadMore"
            :is-finished="isFinished"
            :is-loading="isLoading"
        />
    </div>
</template>

<script lang="ts" setup>
    import type { Song } from '@/types'
    import { useUserStore } from '@/stores/user'
    import InfiniteScrollContainer from '@/components/InfiniteScrollContainer.vue'

    const props = defineProps<{
        id: string
        songs: Song[]
        isFinished: boolean
        isLoading?: boolean
        onLoadMore: () => Promise<void>
    }>()
    const store = useUserStore()

    const handSelecteDmusic = (val: Song) => {
        // 复用 store.playFromList，同步设置 songs / selectedmusic / index
        store.playFromList(val, props.songs)
    }
</script>

<style lang="less" scoped>
    @accent: #667eea;

    .song-table {
        .table-thead {
            display: grid;
            grid-template-columns: 50px 1fr 150px 80px 60px;
            padding: 10px 20px;
            color: #888;
            font-size: 13px;
            font-weight: 700;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .song-row {
            display: grid;
            grid-template-columns: 50px 1fr 150px 80px 60px;
            padding: 15px 20px;
            align-items: center;
            border-radius: 15px;
            transition: 0.2s;
            cursor: pointer;

            &:hover {
                background: rgba(255, 255, 255, 0.4);
                transform: scale(1.01);

                .td-idx {
                    color: @accent;
                    font-weight: 900;
                }
            }

            .td-idx {
                color: #aaa;
                font-family: monospace;
                font-size: 16px;
            }

            .song-name-row {
                display: flex;
                align-items: center;
                gap: 10px;

                .song-name {
                    font-weight: 700;
                    color: #333;
                }

                .vip-tag {
                    font-size: 10px;
                    padding: 1px 4px;
                    border: 1px solid @accent;
                    color: @accent;
                    border-radius: 4px;
                }
            }

            .song-artist {
                font-size: 12px;
                color: #888;
            }

            .td-playback {
                .heat-bar {
                    width: 80px;
                    height: 4px;
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 10px;
                    overflow: hidden;
                }

                .heat-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #ff9a9e, #fecfef);
                }
            }

            .td-time {
                color: #888;
                font-size: 14px;
            }

            .row-like {
                background: none;
                border: none;
                color: #ccc;
                cursor: pointer;

                &:hover {
                    color: #f06;
                }

                &.liked {
                    color: #f06;
                }
            }
        }
    }

    // 适配
    @media (max-width: 768px) {
        .song-table {

            .th-playback,
            .td-playback {
                display: none;
            }

            grid-template-columns: 40px 1fr 80px 50px;
        }
    }
</style>