<template>
  <section class="sub-section">
    <div class="section-nav">
      <h3>❤️ 我喜欢的歌</h3>
      <div class="song-count-badge">{{ likedSongs.length }} Tracks</div>
    </div>
    <div class="glass-songs-list">
      <transition-group name="song-list-anim" tag="div">

        <div class="glass-song-row" v-for="(song, index) in likedSongs" :key="song.id" @click="handlePlayClick(song)">
          <div class="rank-num">{{ (index + 1).toString().padStart(2, '0') }}</div>

          <div class="song-thumb">
            <img v-lazy="song.cover" alt="" />
          </div>

          <div class="song-meta">
            <h4 class="title">{{ song.name }}</h4>
            <p class="artist">{{ song.singer }}</p>
          </div>

          <div class="song-time">{{ song.duration }}</div>

          <div class="song-ops">
            <button class="icon-btn" @click.stop="handleLikeClick(song.id)">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor"
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          </div>

        </div>

      </transition-group>

      <InfiniteScrollContainer :load-more="getUserLisks" :is-finished="isFinished" :is-loading="isLoading" />

    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'
  import type { Song } from '@/types'
  import { useUserStore } from '@/stores/user'
  import { get } from '@/api/request'
  import { usePageControl } from '@/composables/usePageControl'
  import InfiniteScrollContainer from '../InfiniteScrollContainer.vue'

  const store = useUserStore()
  const likedSongs = ref<Song[]>([])
  const isLoading = ref<boolean>(false)
  const isFinished = ref<boolean>(false)

  const { page, nextPage } = usePageControl()

  const getUserLisks = async () => {

    if (isLoading.value || isFinished.value) return;

    isLoading.value = true

    try {
      const result = await get('/songs', { page: page.value })

      if (result.success) {

        const { list } = result.data.data

        if (list.length === 0) {
          isFinished.value = true
          return;
        }

        likedSongs.value = [...likedSongs.value, ...list]

        nextPage()
      }
    } finally {
      // 无论成功、失败、还是提前 return，都要解除 loading 状态，
      // 否则触底加载动画会一直显示
      isLoading.value = false
    }
  }

  const handlePlayClick = (val: Song) => {
    // 复用 store.playFromList，同步设置 songs / selectedmusic / index
    // 原实现每点击一次就会把所有 id 重复 push 进 UserLikesSong，已移除该副作用
    store.playFromList(val, likedSongs.value)
  }

  const handleLikeClick = (id: string) => {
    likedSongs.value = likedSongs.value.filter(item => item.id !== id)
    //把当前歌曲的喜欢取消
    store.toggleSongLikeStatus(id)
  }

  //监听其他地方取消喜欢的歌曲id
  watch(() => store.lastDeletedSongId, (newValue) => {
    likedSongs.value = likedSongs.value.filter(item => item.id !== newValue)
  })

  //监听其他地方新增喜欢的歌曲id
  watch(() => store.lastAddedSongId, (newValue) => {
    const lastAddedSong = store.songs?.find(item => item.id === newValue)
    if (lastAddedSong) {
      likedSongs.value.push(lastAddedSong)
    }
  })

  onMounted(async () => {
    await getUserLisks()
  })
</script>

<style lang="less" scoped>
  @glass-border: rgba(255, 255, 255, 0.2);
  @accent-color: #667eea;

  .sub-section {
    margin-bottom: 50px;

    .section-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding: 0 10px;

      h3 {
        font-size: 20px;
        font-weight: 800;
        color: #333;
      }

      .song-count-badge {
        font-size: 13px;
        color: #888;
        background: rgba(255, 255, 255, 0.4);
        padding: 5px 15px;
        border-radius: 20px;
      }
    }
  }

  // 喜欢的歌曲列表
  .glass-songs-list {
    .glass-song-row {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid transparent;
      border-radius: 20px;
      margin-bottom: 10px;
      transition: all 0.3s;
      cursor: pointer;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
        border-color: @glass-border;
        transform: translateX(10px);
      }

      .rank-num {
        font-size: 14px;
        font-weight: 900;
        color: rgba(0, 0, 0, 0.1);
        width: 30px;
      }

      .song-thumb {
        width: 45px;
        height: 45px;
        border-radius: 12px;
        overflow: hidden;
        margin-right: 20px;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .song-meta {
        flex: 1;

        .title {
          font-size: 15px;
          font-weight: 700;
          color: #333;
          margin-bottom: 2px;
        }

        .artist {
          font-size: 12px;
          color: #888;
        }
      }

      .song-time {
        font-size: 13px;
        color: #aaa;
        margin-right: 30px;
      }

      .song-ops {
        display: flex;
        gap: 15px;

        .icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #f06;
          transition: transform 0.3s ease;

          &:hover {
            color: #f06;
          }

          &:hover {
            transform: scale(1.2);
          }

        }
      }
    }
  }

  // 动画
  .song-list-anim-enter-active,
  .song-list-anim-leave-active {
    transition: all 0.4s;
  }

  .song-list-anim-enter-from {
    opacity: 0;
    transform: translateX(-30px);
  }

  .song-list-anim-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }
</style>