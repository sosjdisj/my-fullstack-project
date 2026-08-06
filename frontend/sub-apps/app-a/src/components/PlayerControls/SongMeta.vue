<template>
    <div class="song-meta-box">
        <div class="cover-wrapper" :class="{ 'is-playing': isPlaying }" @click="goToLyrics">
            <img :src="'/images/5.jpg'" alt="封面" />
        </div>
        <div class="text-info">
            <div class="name-scroller">{{ name }}</div>
            <div class="artist-fade">{{ singer }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { useRouter } from 'vue-router'

    defineProps<{
        name: string
        singer: string | undefined
        isPlaying: boolean
    }>()

    const router = useRouter()
    const goToLyrics = () => {
        router.push('/lyrics')
    }
</script>

<style lang="less" scoped>
    .song-meta-box {
        display: flex;
        align-items: center;
        gap: 15px;
        width: 25%;

        .cover-wrapper {
            width: 55px;
            height: 55px;
            border-radius: 12px;
            overflow: hidden;
            border: 2px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
            cursor: pointer;

            &.is-playing {
                animation: rotateImg 20s linear infinite;
                border-radius: 50%;
            }

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }

        .text-info {
            .name-scroller {
                font-size: 15px;
                font-weight: 700;
                color: #333;
                margin-bottom: 4px;
            }

            .artist-fade {
                font-size: 12px;
                color: #666;
            }
        }
    }

    @keyframes rotateImg {
        from {
            transform: rotate(0deg);
        }

        to {
            transform: rotate(360deg);
        }
    }
</style>