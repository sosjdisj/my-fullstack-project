<template>
  <div class="my-music-container">
    <div class="user-profile-card">
      <div class="profile-main">
        <div class="avatar-glow">
          <img :src="avatar ?? ''" alt="">
        </div>
        <div class="profile-info">
          <h2 class="welcome-text">欢迎回来, <span>{{ name }}</span></h2>
          <div class="user-stats">
            <span class="motto">“ 享受音乐的美好时光 ”</span>
          </div>
        </div>
      </div>
    </div>

    <div class="content-layout">
      <PlaylistCollection />
      <LikedSongs />
    </div>
  </div>
</template>


<script setup lang="ts">
  import PlaylistCollection from '../../components/MyMusic/PlaylistCollection.vue'
  import LikedSongs from '../../components/MyMusic/LikedSongs.vue'
  import { useMyMusic } from './useMyMusic';

  const { name, avatar } = useMyMusic()

</script>

<style lang="less" scoped>
  @glass-bg: rgba(255, 255, 255, 0.1);
  @glass-border: rgba(255, 255, 255, 0.2);
  @accent-color: #667eea;

  .my-music-container {
    padding: 10px 0;
    background: transparent;

    // 用户资料卡片
    .user-profile-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 35px;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(20px);
      border: 1px solid @glass-border;
      border-radius: 30px;
      margin-bottom: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);

      .profile-main {
        display: flex;
        align-items: center;
        gap: 25px;

        .avatar-glow {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background-size: cover;
          background-position: center;
          border: 4px solid white;
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .welcome-text {
          font-size: 24px;
          font-weight: 800;
          color: #2d3436;
          margin-bottom: 8px;

          span {
            color: @accent-color;
          }
        }

        .user-stats {
          display: flex;
          align-items: center;
          gap: 15px;

          .stat-tag {
            padding: 2px 10px;
            background: @accent-color;
            color: white;
            font-size: 11px;
            border-radius: 20px;
            font-weight: 700;
          }

          .motto {
            font-size: 14px;
            color: #636e72;
            font-style: italic;
          }
        }
      }

      .edit-btn {
        padding: 10px 20px;
        border-radius: 20px;
        border: 1px solid @accent-color;
        background: transparent;
        color: @accent-color;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: @accent-color;
          color: white;
        }
      }
    }
  }
</style>
