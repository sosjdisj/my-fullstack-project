<template>
  <div class="glass-playlist-page">

    <div class="playlist-container">

      <MusicPlaylistHeader :id="queryId" :currentPlaylistData="currentPlaylistData" :MusicList="MusicList"
        :isCollected="isCollected" @favorite="handleFavorite" />

      <div class="playlist-body">
        <div class="list-controls">
          <div class="tab-btns">
            <button class="tab-btn active">全部歌曲</button>
          </div>
          <div class="search-mini">
            <input type="text" placeholder="搜索歌单内歌曲..." />
          </div>
        </div>

        <SongListTable :id="queryId" :songs="PlaylistManager" :is-finished="isFinished"
          :is-loading="isLoading" :on-load-more="loadPophitsAndUserLikes" />

      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue'
  import MusicPlaylistHeader from '@/components/MusicPlayer/MusicPlaylistHeader.vue';
  import SongListTable from '@/components/MusicPlayer/SongListTable.vue';
  import { usePlaylistPage } from './usePlaylistPage';

  const {
    queryId,
    currentPlaylistData,
    MusicList,
    isCollected,
    PlaylistManager,
    isFinished,
    isLoading,
    handleFavorite,
    fetchPlaylistDetail,
    loadPophitsAndUserLikes
  } = usePlaylistPage()

  onMounted(async () => {
    await fetchPlaylistDetail()
    await loadPophitsAndUserLikes()
  })
</script>

<style lang="less" scoped>
  @accent: #667eea;
  @glass-white: rgba(255, 255, 255, 0.1);
  @glass-border: rgba(255, 255, 255, 0.2);

  .glass-playlist-page {
    position: relative;
    min-height: 100vh;
    color: #fff;
    padding-bottom: 100px;

    .playlist-container {
      position: relative;
      z-index: 1;
      padding: 40px;
    }

    // 3. 歌曲列表主体
    .playlist-body {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(30px);
      border: 1px solid @glass-border;
      border-radius: 40px;
      padding: 30px;

      .list-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;

        .tab-btns {
          display: flex;
          gap: 30px;

          .tab-btn {
            background: none;
            border: none;
            font-size: 18px;
            font-weight: 700;
            color: #999;
            cursor: pointer;

            &.active {
              color: #333;
              border-bottom: 3px solid @accent;
              padding-bottom: 5px;
            }
          }
        }

        .search-mini input {
          background: rgba(0, 0, 0, 0.05);
          border: none;
          padding: 8px 20px;
          border-radius: 20px;
          width: 200px;
        }
      }

      // .song-table {
      //   .table-thead {
      //     display: grid;
      //     grid-template-columns: 50px 1fr 150px 80px 60px;
      //     padding: 10px 20px;
      //     color: #888;
      //     font-size: 13px;
      //     font-weight: 700;
      //     border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      //   }

      //   .song-row {
      //     display: grid;
      //     grid-template-columns: 50px 1fr 150px 80px 60px;
      //     padding: 15px 20px;
      //     align-items: center;
      //     border-radius: 15px;
      //     transition: 0.2s;
      //     cursor: pointer;

      //     &:hover {
      //       background: rgba(255, 255, 255, 0.4);
      //       transform: scale(1.01);

      //       .td-idx {
      //         color: @accent;
      //         font-weight: 900;
      //       }
      //     }

      //     .td-idx {
      //       color: #aaa;
      //       font-family: monospace;
      //       font-size: 16px;
      //     }

      //     .song-name-row {
      //       display: flex;
      //       align-items: center;
      //       gap: 10px;

      //       .song-name {
      //         font-weight: 700;
      //         color: #333;
      //       }

      //       .vip-tag {
      //         font-size: 10px;
      //         padding: 1px 4px;
      //         border: 1px solid @accent;
      //         color: @accent;
      //         border-radius: 4px;
      //       }
      //     }

      //     .song-artist {
      //       font-size: 12px;
      //       color: #888;
      //     }

      //     .td-playback {
      //       .heat-bar {
      //         width: 80px;
      //         height: 4px;
      //         background: rgba(0, 0, 0, 0.05);
      //         border-radius: 10px;
      //         overflow: hidden;
      //       }

      //       .heat-fill {
      //         height: 100%;
      //         background: linear-gradient(90deg, #ff9a9e, #fecfef);
      //       }
      //     }

      //     .td-time {
      //       color: #888;
      //       font-size: 14px;
      //     }

      //     .row-like {
      //       background: none;
      //       border: none;
      //       color: #ccc;
      //       cursor: pointer;

      //       &:hover {
      //         color: #f06;
      //       }

      //       &.liked {
      //         color: #f06;
      //       }
      //     }
      //   }
      // }
    }
  }

  // 适配
  @media (max-width: 768px) {
    .playlist-body {
      grid-template-columns: 40px 1fr 80px 50px;
    }
  }
</style>
