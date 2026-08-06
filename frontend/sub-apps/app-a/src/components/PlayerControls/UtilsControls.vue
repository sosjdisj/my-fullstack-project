<template>
    <div class="utils-section">
        <button class="util-btn heart" :class="{ liked: isLiked }" @click="store.toggleSongLikeStatus(id)">
            <svg viewBox="0 0 24 24" width="20">
                <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill="currentColor" />
            </svg>
        </button>

        <slot name="volume-control"></slot>

        <button class="util-btn queue" @click="openPlayQueue">
            <svg viewBox="0 0 24 24" width="20">
                <path fill="currentColor"
                    d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
            </svg>
        </button>
    </div>
</template>

<script lang="ts" setup>
    import { useUserStore } from '@/stores/user'

    defineProps<{
        isLiked: boolean
        id: string
    }>()
    const emit = defineEmits(['close'])
    const store = useUserStore()

    const openPlayQueue = () => {
        emit('close')
    }
</script>

<style lang="less" scoped>
    @orange-red: #f06;

    .utils-section {
        display: flex;
        align-items: center;
        gap: 15px;
        width: 25%;
        justify-content: flex-end;

        .util-btn {
            background: none;
            border: none;
            color: #333;
            cursor: pointer;

            &:hover {
                color: @orange-red;
            }

            &.liked {
                color: @orange-red;
            }

            svg {
                display: block;
            }
        }
    }
</style>