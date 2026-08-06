<template>
  <section class="sub-section">

    <div class="section-nav">
      <h3>📚 我收藏的歌单</h3>
    </div>

    <div class="playlist-flex">
      <div class="glass-playlist-card" v-for="item in playlists" :key="item.id" @click="goPlaylist(item.id)">

        <div class="cover-box">
          <img :src="item.coverImage" :alt="item.name" />
          <div class="play-glass-btn">▶{{ formatPlayCount(item.playCount) }}</div>
        </div>

        <div class="info-box">
          <h4>{{ item.name }}</h4>
        </div>

      </div>
    </div>

    <InfiniteScrollContainer :load-more="getUserPlaylists" :is-finished="isFinished" :is-loading="isLoading" />

  </section>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import type { Playlist } from '@/types'
  import { get } from '@/api/request'
  import { usePageControl } from '@/composables/usePageControl'
  import { formatPlayCount } from '@/utils/format'
  import { useNavigation } from '@/utils/navigation'
  import InfiniteScrollContainer from '@/components/InfiniteScrollContainer.vue'

  const { goPlaylist } = useNavigation()
  const playlists = ref<Playlist[]>([])
  const isLoading = ref<boolean>(false)
  const isFinished = ref<boolean>(false)

  const { page, nextPage } = usePageControl()

  const getUserPlaylists = async () => {

    if (isLoading.value || isFinished.value) return;

    isLoading.value = true

    try {
      const result = await get('/playlists/collects', { page: page.value })
      if (result.success) {

        const { list } = result.data.data

        if (list.length === 0) {
          isFinished.value = true
          return;
        }
        console.log(list)
        playlists.value = [...playlists.value, ...list]

        nextPage()
      }
    } finally {
      // 无论成功、失败、还是提前 return，都要解除 loading 状态，
      // 否则触底加载动画会一直显示
      isLoading.value = false
    }
  }

  onMounted(async () => {
    await getUserPlaylists()
  })
</script>

<style lang="less" scoped>
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

    }
  }

  // 收藏歌单网格
  .playlist-flex {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 25px;

    .glass-playlist-card {
      cursor: pointer;
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-8px);

        .play-glass-btn {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }

      .cover-box {
        position: relative;
        border-radius: 24px;
        overflow: hidden;
        aspect-ratio: 1;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        margin-bottom: 12px;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .play-glass-btn {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.8);
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          opacity: 0;
          transition: all 0.3s;
        }
      }

      h4 {
        font-size: 15px;
        font-weight: 700;
        color: #333;
        margin-bottom: 4px;
      }

      p {
        font-size: 12px;
        color: #888;
      }
    }
  }
</style>