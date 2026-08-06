<template>
    <div class="progress-floating-layer">
        <div class="progress-bar-container">
            <div class="time-wrapper">
                <span class="time-tag current">{{ formatTime(currentPlaybackTime) }}</span>
            </div>

            <div class="progress-track-glass" ref="progresstrackglass" @click="handleProgressClick">
                <div class="progress-fill-gradient" :style="{ width: progressPercentage + '%' }"></div>
                <div class="progress-knob" :style="{ left: progressPercentage + '%' }"></div>
            </div>

            <div class="time-wrapper">
                <span class="time-tag total">{{ formatTime(remainingTime) }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { ref, computed } from 'vue'

    const props = defineProps<{
        currentPlaybackTime: number
        remainingTime: number
        totalDuration: number
        audioPlayer: HTMLAudioElement | null
    }>()

    const emit = defineEmits<{
        (e: 'update:currentPlaybackTime', value: number): void
    }>()

    const progresstrackglass = ref<HTMLElement | null>(null)

    const progressPercentage = computed(() => {
        if (!props.totalDuration) return 0;

        const rawPercentage = (props.currentPlaybackTime / props.totalDuration) * 100;

        return Math.min(100, Math.max(0, rawPercentage)).toFixed(2);
    });

    const formatTime = (seconds?: number): string => {
        if (seconds === undefined || isNaN(seconds) || seconds < 0) {
            return '00:00'
        }

        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)

        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleProgressClick = (e: MouseEvent) => {
        if (!props.audioPlayer || !props.totalDuration || isNaN(props.totalDuration)) return
        const progressTrack = progresstrackglass.value

        if (!progressTrack) return;

        const rect = progressTrack.getBoundingClientRect()
        const clickPosition = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        const newTime = clickPosition * props.totalDuration
        props.audioPlayer.currentTime = newTime
        emit('update:currentPlaybackTime', Math.floor(newTime))
    }
</script>

<style lang="less" scoped>
    @accent: #667eea;
    @accent-light: #764ba2;
    @glass-dark: rgba(0, 0, 0, 0.4);

    .progress-floating-layer {
        position: absolute;
        top: -12px;
        left: 40px;
        right: 40px;

        .progress-bar-container {
            display: flex;
            align-items: center;
            gap: 12px;

            .time-tag {
                font-size: 11px;
                font-family: 'Monaco', monospace;
                background: @glass-dark;
                color: #ffffff;
                padding: 2px 8px;
                border-radius: 6px;
                min-width: 40px;
                text-align: center;
                backdrop-filter: blur(5px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }

            .progress-track-glass {
                flex: 1;
                height: 6px;
                background: rgba(0, 0, 0, 0.15);
                border-radius: 10px;
                position: relative;
                cursor: pointer;
                overflow: visible;

                .progress-fill-gradient {
                    height: 100%;
                    background: linear-gradient(90deg, @accent, @accent-light);
                    border-radius: 10px;
                    box-shadow: 0 0 12px rgba(102, 126, 234, 0.6);
                }

                .progress-knob {
                    position: absolute;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    width: 14px;
                    height: 14px;
                    background: #fff;
                    border: 2px solid @accent;
                    border-radius: 50%;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                    opacity: 1;
                    transition: transform 0.2s;

                    &:hover {
                        transform: translate(-50%, -50%) scale(1.3);
                    }
                }
            }
        }
    }
</style>