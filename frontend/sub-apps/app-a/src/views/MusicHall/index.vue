<template>
  <div class="music-hall-container">
    <div class="main-content">

      <section class="section">

        <div class="section-header">
          <h2 class="section-title">歌单精选</h2>
        </div>

        <div class="playlist-grid">
          <div v-for="playlist in playlists" :key="playlist.id" class="playlist-card" @click="goPlaylist(playlist.id)">

            <div class="playlist-cover">
              <img :src="playlist.coverImage" :alt="playlist.name" loading="lazy">
              <div class="play-count-badge">
                <span>▶ {{ formatPlayCount(playlist.playCount) }}</span>
              </div>
              <div class="hover-play-btn">
                <div class="play-icon-inner">▶</div>
              </div>
            </div>

            <div class="playlist-info">
              <h3 class="playlist-name">{{ playlist.name }}</h3>
              <p class="playlist-desc">{{ playlist.description }}</p>
            </div>

          </div>
        </div>

      </section>

      <section class="section">

        <div class="section-header">
          <h2 class="section-title">排行榜</h2>
        </div>

        <div class="charts-container">
          <div v-for="chart in charts" :key="chart.tagName" class="chart-card">

            <div class="chart-header">
              <div class="chart-title-box">
                <h3 class="chart-title">{{ chart.tagName }}</h3>
                <span class="update-time">{{ chart.desc }}</span>
              </div>
              <div class="play-all-btn" @click="handlePlayAll(chart.songs)">播放全部</div>
            </div>

            <div class="chart-songs">
              <div v-for="(song, index) in chart.songs.slice(0, 5)" :key="song.id" class="chart-song-item"
                @click="handlePlaySong(song, chart.songs)">
                <div class="song-rank" :class="{ 'top-three': index < 3 }">{{ index + 1 }}</div>
                <div class="song-detail">
                  <div class="song-title">{{ song.name }}</div>
                  <div class="song-singer">{{ song.singer }}</div>
                </div>
                <div class="song-hot-val">{{ formatPlayCount(song.playback) }}</div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import type { Song } from '@/types'
  import { useUserStore } from '@/stores/user'
  import { formatPlayCount } from '@/utils/format'
  import { useMusicHall } from './useMusicHall';

  const { playlists, charts, goPlaylist, getPlaylists } = useMusicHall()
  const store = useUserStore()

  // 播放整个榜单：从第一首开始
  const handlePlayAll = (songs: Song[]) => {
    if (!songs.length) return
    store.playFromList(songs[0], songs)
  }

  // 点击单首：把整个榜单设为播放列表，从当前点击的歌开始
  const handlePlaySong = (song: Song, songs: Song[]) => {
    store.playFromList(song, songs)
  }

  onMounted(async () => {
    await getPlaylists()
  })
</script>

<style scoped lang="less">
  // 变量：这些可以根据你的全局变量微调
  @accent-color: #667eea;
  @glass-border: rgba(255, 255, 255, 0.3);

  .music-hall-container {
    width: 100%;
    // 关键：不要在这里写背景色，透出父容器的弥散背景
    background: transparent;
    padding: 10px 0;

    .section {
      margin-bottom: 50px;

      .section-header {
        margin-bottom: 30px;
        padding-left: 10px;

        .section-title {
          font-size: 28px;
          font-weight: 800;
          color: #2d3436;
          letter-spacing: 1px;
          position: relative;
          display: inline-block;

          &::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 0;
            width: 35px;
            height: 5px;
            background: linear-gradient(90deg, @accent-color, transparent);
            border-radius: 10px;
          }
        }
      }
    }

    // 推荐歌单网格
    .playlist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 30px;

      .playlist-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid @glass-border;
        border-radius: 24px;
        padding: 12px;
        transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        cursor: pointer;

        &:hover {
          transform: translateY(-10px);
          background: rgba(255, 255, 255, 0.25);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);

          .hover-play-btn {
            opacity: 1;
            transform: scale(1);
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
          margin-bottom: 12px;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.6s ease;
          }

          .play-count-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.25);
            backdrop-filter: blur(8px);
            padding: 4px 10px;
            border-radius: 20px;
            color: white;
            font-size: 11px;
            z-index: 2;
          }

          .hover-play-btn {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transform: scale(0.8);
            transition: all 0.3s ease;

            .play-icon-inner {
              width: 50px;
              height: 50px;
              background: @accent-color;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 20px;
              box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
            }
          }
        }

        .playlist-info {
          padding: 0 5px;

          .playlist-name {
            font-size: 15px;
            font-weight: 700;
            color: #2d3436;
            margin-bottom: 5px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .playlist-desc {
            font-size: 12px;
            color: #636e72;
            line-height: 1.4;
            display: -webkit-box;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
      }
    }

    // 排行榜卡片
    .charts-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 25px;

      .chart-card {
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
        border: 1px solid @glass-border;
        border-radius: 30px;
        padding: 25px;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.05);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 25px;

          .chart-title {
            font-size: 20px;
            font-weight: 800;
            color: #2d3436;
            margin-bottom: 4px;
          }

          .update-time {
            font-size: 12px;
            color: #8e8e93;
          }

          .play-all-btn {
            font-size: 12px;
            padding: 6px 14px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 20px;
            color: @accent-color;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              transform: translateY(-2px);
              background: @accent-color;
              color: white;
            }
          }
        }

        .chart-songs {
          .chart-song-item {
            display: flex;
            align-items: center;
            padding: 10px 10px;
            margin: 0 -10px 5px;
            border-radius: 16px;
            transition: all 0.2s;

            &:hover {
              background: rgba(255, 255, 255, 0.3);

              .song-hot-val {
                opacity: 1;
              }
            }

            .song-rank {
              width: 35px;
              font-size: 18px;
              font-weight: 900;
              color: rgba(0, 0, 0, 0.1);
              font-style: italic;

              &.top-three {
                color: @accent-color;
                font-size: 20px;
              }
            }

            .song-detail {
              flex: 1;

              .song-title {
                font-size: 14px;
                font-weight: 600;
                color: #333;
              }

              .song-singer {
                font-size: 12px;
                color: #636e72;
              }
            }

            .song-hot-val {
              font-size: 11px;
              color: #ff6b6b;
              font-weight: 700;
              opacity: 0.5;
            }
          }
        }
      }
    }
  }
</style>
