<template>
    <div class="vol-wrapper" @mouseenter="isVolumeHover = true" @mouseleave="isVolumeHover = false"
        @wheel="handleVolumeWheel">
        <button class="util-btn" @click="toggleMute" :class="{ 'is-muted': isMuted }">
            <svg viewBox="0 0 24 24" width="20">
                <path v-if="!isMuted && volume > 0" fill="currentColor"
                    d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />

                <path v-else fill="currentColor"
                    d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
        </button>

        <transition name="vol-pop">
            <div class="vol-popover" v-show="showVolumeSlider">
                <div class="vol-track-glass" ref="voltrackglass" @mousedown="handleVolumeMouseDown"
                    @wheel="handleVolumeWheel">
                    <div class="vol-fill" :style="{ height: volumePercentage + '%' }"></div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts" setup>
    import { ref, computed } from 'vue'

    const props = defineProps<{
        volume: number
        isMuted: boolean
        audioPlayer: HTMLAudioElement | null
    }>()

    const emit = defineEmits<{
        (e: 'update:volume', value: number): void
        (e: 'update:isMuted', value: boolean): void
    }>()

    const voltrackglass = ref<HTMLElement | null>(null)
    const isVolumeHover = ref<boolean>(false)
    const isDraggingVolume = ref<boolean>(false)

    const showVolumeSlider = computed(() => {
        if (isDraggingVolume.value || isVolumeHover.value) {
            return true
        }
        return false
    })

    const volumePercentage = computed(() => {
        return props.isMuted ? 0 : props.volume
    })

    const toggleMute = () => {
        if (!props.audioPlayer) return

        const newMutedState = !props.isMuted
        emit('update:isMuted', newMutedState)
        props.audioPlayer.muted = newMutedState
    }

    const setVolume = (newVolume: number) => {
        const normalizedVolume = Math.max(0, Math.min(100, newVolume))
        emit('update:volume', normalizedVolume)

        if (props.isMuted) {
            emit('update:isMuted', false)
        }

        if (props.audioPlayer) {
            props.audioPlayer.volume = normalizedVolume / 100
        }
    }

    const calculateTotalPrice = (e: MouseEvent) => {
        const volumeTrack = voltrackglass.value

        if (!volumeTrack) return;

        const rect = volumeTrack.getBoundingClientRect()
        const clickPosition = Math.max(0, Math.min(1, (rect.bottom - e.clientY) / rect.height))
        const newVolume = clickPosition * 100

        setVolume(newVolume)
    }

    const handleVolumeMouseDown = (e: MouseEvent) => {
        e.preventDefault()
        isDraggingVolume.value = true

        handleVolumeMouseMove(e)

        document.addEventListener('mousemove', handleVolumeMouseMove)
        document.addEventListener('mouseup', handleVolumeMouseUp)
    }

    const handleVolumeWheel = (e: WheelEvent) => {
        e.preventDefault()

        if (e.deltaY < 0) {
            setVolume(props.volume + 2)
        } else {
            setVolume(props.volume - 2)
        }
    }

    const handleVolumeMouseMove = (e: MouseEvent) => {
        if (!isDraggingVolume.value) return
        e.preventDefault()

        calculateTotalPrice(e)
    }

    const handleVolumeMouseUp = () => {
        isDraggingVolume.value = false

        document.removeEventListener('mousemove', handleVolumeMouseMove)
        document.removeEventListener('mouseup', handleVolumeMouseUp)
    }
</script>

<style lang="less" scoped>
    @accent: #667eea;

    .vol-wrapper {
        position: relative;

        .vol-popover {
            position: absolute;
            bottom: 35px;
            left: 50%;
            transform: translateX(-50%);
            width: 32px;
            height: 100px;
            background: rgba(255, 255, 255, 0.95);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border-radius: 8px;
            display: flex;
            justify-content: center;
            padding: 12px 0;

            .vol-track-glass {
                width: 4px;
                height: 100%;
                background: #eee;
                border-radius: 10px;
                position: relative;
                cursor: pointer;

                &::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: -10px;
                    right: -10px;
                    background: transparent;
                }

                .vol-fill {
                    position: absolute;
                    bottom: 0;
                    width: 100%;
                    background: @accent;
                    border-radius: 10px;

                    &::after {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 10px;
                        height: 10px;
                        background: #fff;
                        border: 2px solid @accent;
                        border-radius: 50%;
                        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
                    }
                }
            }
        }

        .util-btn {
            background: none;
            border: none;
            padding: 4px;
            cursor: pointer;
            color: #333;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;

            &:hover {
                color: @accent;
                transform: scale(1.1);
            }

            &.is-muted {
                color: #999;

                &:hover {
                    color: #666;
                }
            }

            svg {
                display: block;
            }
        }
    }

    .vol-pop-enter-active,
    .vol-pop-leave-active {
        transition: all 0.2s;
    }

    .vol-pop-enter-from,
    .vol-pop-leave-to {
        opacity: 0;
        transform: translate(-50%, 10px);
    }
</style>