<template>
  <div class="lyrics-page">
    <!-- 模糊封面背景 -->
    <div class="lyrics-bg" :style="{ backgroundImage: `url(${coverUrl})` }"></div>
    <div class="lyrics-dim"></div>

    <!-- 头部：返回按钮 + 歌曲信息 -->
    <header class="lyrics-header">
      <button class="back-btn" @click="goBack" title="返回">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
        <span>返回</span>
      </button>

      <div class="song-meta">
        <h1 class="song-name">{{ songName }}</h1>
        <p class="song-singer">{{ singer }}</p>
      </div>

      <div class="header-spacer"></div>
    </header>

    <!-- 歌词主体 -->
    <main class="lyrics-body" ref="lyricsBody">
      <div class="lyrics-scroll" :style="{ transform: `translateY(${scrollOffset}px)` }">
        <p
          v-for="(line, idx) in lrcLines"
          :key="idx"
          class="lrc-line"
          :class="{ active: idx === currentLine }"
          :ref="el => setLineRef(el as HTMLElement, idx)"
        >{{ line.text || '\u00A0' }}</p>
        <p v-if="!lrcLines.length" class="lrc-line empty">暂无歌词</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { useLyricsPage } from './useLyricsPage';

  const {
    songName,
    singer,
    coverUrl,
    lrcLines,
    lyricsBody,
    currentLine,
    scrollOffset,
    setLineRef,
    goBack
  } = useLyricsPage()
</script>

<style lang="less" scoped>
  @accent-color: #667eea;
  @accent-soft: rgba(102, 126, 234, 0.6);
  @glass-border: rgba(255, 255, 255, 0.3);

  .lyrics-page {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 24px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    isolation: isolate; // 让 z-index 在当前组件内独立
  }

  // 模糊封面背景
  .lyrics-bg {
    position: absolute;
    inset: -40px;
    background-size: cover;
    background-position: center;
    filter: blur(80px) brightness(0.55) saturate(1.2);
    transform: scale(1.2);
    z-index: 0;
    transition: background-image 0.6s ease;
  }

  // 渐变遮罩，加深氛围感
  .lyrics-dim {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.5) 100%),
      linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(155, 109, 255, 0.1));
    z-index: 1;
  }

  // 顶部 header
  .lyrics-header {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    padding: 24px 36px;
    gap: 24px;

    .back-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px 8px 12px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid @glass-border;
      border-radius: 24px;
      color: #fff;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      backdrop-filter: blur(12px);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.22);
        transform: translateX(-2px);
      }
    }

    .song-meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;

      .song-name {
        color: #fff;
        font-size: 20px;
        font-weight: 700;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
      }

      .song-singer {
        color: rgba(255, 255, 255, 0.65);
        font-size: 13px;
        margin: 4px 0 0;
      }
    }

    .header-spacer {
      width: 88px; // 平衡返回按钮的视觉宽度
    }
  }

  // 歌词主体
  .lyrics-body {
    position: relative;
    z-index: 2;
    flex: 1;
    overflow: hidden;
    // 上下渐隐遮罩
    mask-image: linear-gradient(transparent 0%, #000 12%, #000 88%, transparent 100%);
    -webkit-mask-image: linear-gradient(transparent 0%, #000 12%, #000 88%, transparent 100%);

    .lyrics-scroll {
      transition: transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
      padding: 40px 0;
    }

    .lrc-line {
      text-align: center;
      padding: 14px 40px;
      color: rgba(255, 255, 255, 0.42);
      font-size: 17px;
      font-weight: 500;
      line-height: 1.6;
      transition: all 0.45s cubic-bezier(0.4, 0, 0.2, 1);
      transform: scale(0.92);

      &.active {
        color: #fff;
        font-size: 22px;
        font-weight: 700;
        transform: scale(1);
        text-shadow: 0 0 24px @accent-soft, 0 2px 8px rgba(0, 0, 0, 0.3);
      }

      &.empty {
        color: rgba(255, 255, 255, 0.35);
        font-size: 15px;
        font-style: italic;
      }
    }
  }
</style>
