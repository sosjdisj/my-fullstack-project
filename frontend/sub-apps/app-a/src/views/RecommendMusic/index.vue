<template>
    <div class="glass-music-container">
        <!-- 轮播图 -->
        <Carousel />

        <div class="recommend-section">
            <div class="section-header">
                <h2>每日推荐</h2>
                <!-- <a href=" " class="more-link">更多服务 ›</a> -->
            </div>
            <div class="playlist-grid">
                <div class="playlist-card" v-for="value in musiclist" :key="value.id" @click="goPlaylist(value.id)">
                    <div class="playlist-cover">
                        <img v-lazy="value.coverImage" alt="歌单封面" />
                        <span class="play-count">▶ {{ formatPlayCount(value.playCount) }}</span>
                        <div class="play-btn">
                            <span class="play-icon">▶</span>
                        </div>
                    </div>
                    <div class="playlist-info">
                        <h3>{{ value.name }}</h3>
                        <p>{{ value.description }}</p>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, onUnmounted } from 'vue';
    import Carousel from '@/components/Carousel.vue';
    import { useRecommendMusic } from './useRecommendMusic';
    import { formatPlayCount } from '@/utils/format'

    const { musiclist,
        goPlaylist, fetchRecommendMusicPlaylist,
        clear } = useRecommendMusic()

    onMounted(async () => {
        await fetchRecommendMusicPlaylist()
    })
    onUnmounted(() => {
        clear()
    })
</script>

<style lang="less" scoped>
    // 变量定义
    @glass-bg: rgba(255, 255, 255, 0.4);
    @glass-border: rgba(255, 255, 255, 0.5);
    @accent-color: #667eea;
    @text-main: #2d3436;

    .glass-music-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
    }

    // 推荐歌单区域
    .recommend-section {
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 25px;

            h2 {
                font-size: 28px;
                font-weight: 800;
                color: @text-main;
            }

            .more-link {
                font-size: 14px;
                color: #636e72;
                text-decoration: none;
                transition: color 0.3s;

                &:hover {
                    color: @accent-color;
                }
            }
        }

        .playlist-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 30px;

            .playlist-card {
                background: @glass-bg;
                backdrop-filter: blur(12px);
                border: 1px solid @glass-border;
                border-radius: 24px;
                padding: 10px;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                cursor: pointer;

                &:hover {
                    transform: translateY(-10px);
                    background: rgba(255, 255, 255, 0.6);
                    box-shadow: 0 15px 35px rgba(31, 38, 135, 0.15);

                    .play-btn {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }

                    img {
                        transform: scale(1.1);
                    }
                }

                .playlist-cover {
                    position: relative;
                    border-radius: 18px;
                    overflow: hidden;
                    aspect-ratio: 1;

                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: transform 0.6s ease;
                    }

                    .play-count {
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        padding: 4px 10px;
                        background: rgba(0, 0, 0, 0.4);
                        backdrop-filter: blur(5px);
                        color: white;
                        font-size: 11px;
                        border-radius: 20px;
                    }

                    .play-btn {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) scale(0.5);
                        width: 50px;
                        height: 50px;
                        background: @accent-color;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        opacity: 0;
                        transition: all 0.3s ease;
                        box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);

                        .play-icon {
                            color: white;
                            font-size: 20px;
                        }
                    }
                }

                .playlist-info {
                    padding: 12px 5px;

                    h3 {
                        font-size: 16px;
                        font-weight: 700;
                        color: @text-main;
                        margin-bottom: 6px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    p {
                        font-size: 13px;
                        color: #636e72;
                        line-height: 1.4;
                        display: -webkit-box;
                        line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                }
            }

            .load-more-container {
                grid-column: 1 / -1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 0;
            }

            .bottom-p {
                text-align: center;
                color: #636e72;
                font-size: 14px;
            }
        }
    }
</style>