<template>
    <audio :src="musicInfo.path" ref="audioPlayer" v-show="false" @play="handleAudioPlay" @pause="handleAudioPause"
        @ended="handleAudioPlayEnded" @loadedmetadata="handPlay" @timeupdate="updateRemainingTime"></audio>

    <div class="player-controls" v-if="store.selectedmusic">
        <ProgressBar :currentPlaybackTime="currentPlaybackTime" :remainingTime="remainingTime"
            :totalDuration="totalDuration" :audioPlayer="audioPlayer"
            @update:currentPlaybackTime="currentPlaybackTime = $event" />

        <div class="main-control-panel">
            <SongMeta :name="musicInfo.name" :singer="musicInfo.singer" :isPlaying="isPlaying" />

            <PlaybackControls :isPlaying="isPlaying" :isShuffleEnabled="isShuffleEnabled"
                :isRepeatEnabled="isRepeatEnabled" @play="handPlay" @prev="store.handPlayPrevious"
                @next="store.handPlayNext" @toggleShuffle="toggleShuffle" @toggleRepeat="toggleRepeat" />

            <UtilsControls :isLiked="store.UserLikesSong.includes(musicInfo.id)" :id="musicInfo.id"
                @close="handleclose">
                <template #volume-control>
                    <VolumeControl :volume="volume" :isMuted="isMuted" :audioPlayer="audioPlayer"
                        @update:volume="volume = $event" @update:isMuted="isMuted = $event" />
                </template>
            </UtilsControls>
        </div>

        <PlayQueueModal :isVisible="isVisible" @close="handleclose"/>
    </div>


</template>

<script lang="ts" setup>
    import { ref, onMounted, computed } from 'vue'
    import { ElMessage } from 'element-plus'
    import { useUserStore } from '../../stores/user'
    import { resolveAssetPath } from '@/utils/asset'
    import ProgressBar from './ProgressBar.vue'
    import SongMeta from './SongMeta.vue'
    import PlaybackControls from './PlaybackControls.vue'
    import VolumeControl from './VolumeControl.vue'
    import UtilsControls from './UtilsControls.vue'
    import PlayQueueModal from '../MusicPlayer/PlayQueueModal.vue'

    const remainingTime = ref<number>(0)//剩余时长，默认0
    const currentPlaybackTime = ref<number>(0)//当前播放时长，默认0
    const totalDuration = ref<number>(0)//总时长，默认0

    const audioPlayer = ref<HTMLAudioElement | null>(null)
    const store = useUserStore()

    // 音量控制相关
    const volume = ref<number>(40) // 默认音量40%
    const isMuted = ref<boolean>(false) // 是否静音
    const isPlaying = ref<boolean>(false) // 音频是否正在播放

    const isShuffleEnabled = ref<boolean>(false) // 是否开启随机播放
    const isRepeatEnabled = ref<boolean>(false)//是否开启单曲循环

    const isVisible = ref<boolean>(false)//控制歌单列表模态框

    const musicInfo = computed(() => {
        const music = store.selectedmusic;
        return {
            name: music?.name ?? '',
            singer: music?.singer,
            // 微前端环境下拼接子应用前缀，否则 /audio/xxx 会被解析为主应用根 → 404
            path: resolveAssetPath(music?.path),
            id: music?.id ?? '',
            cover: resolveAssetPath(music?.cover ?? '/images/5.jpg')
        };
    });

    // 切换随机播放状态（随机或循序）
    const toggleShuffle = () => {
        isShuffleEnabled.value = !isShuffleEnabled.value
    }
    const toggleRepeat = () => {
        isRepeatEnabled.value = !isRepeatEnabled.value
        console.log(isRepeatEnabled.value)
    }
    // 播放/暂停
    const handPlay = async () => {
        if (!audioPlayer.value) return;
        if (audioPlayer.value.paused) {
            // path 缺失时浏览器会抛 NotSupportedError: The element has no supported sources
            // 提前拦截，给用户明确提示，避免静默失败
            if (!musicInfo.value.path) {
                ElMessage.warning('该歌曲暂无音频源，无法播放')
                isPlaying.value = false
                store.isPlaying = false
                return;
            }
            try {
                await audioPlayer.value.play()
                isPlaying.value = true
                store.isPlaying = true
            } catch (error) {
                console.error('播放失败:', error)
                isPlaying.value = false
                store.isPlaying = false
            }
            return;
        }

        audioPlayer.value.pause()
        isPlaying.value = false
        store.isPlaying = false
    }

    const updateRemainingTime = () => {
        const player = audioPlayer.value

        if (!player) return;

        totalDuration.value = player.duration

        currentPlaybackTime.value = player.currentTime
        store.currentTime = player.currentTime // 同步到 store，供歌词页等组件读取
        const remaining = player.duration - player.currentTime

        remainingTime.value = Math.floor(remaining) // 取整，显示剩余秒数
    }

    //随机播放或下一首
    const handleAudioPlayEnded = () => {

        if (!audioPlayer.value) return;

        if (isShuffleEnabled.value) {
            store.handShuffle()
            return;
        }
        if (isRepeatEnabled.value) {
            audioPlayer.value.currentTime = 0
            audioPlayer.value.play()
            return;
        }
        store.handPlayNext()

    }

    const handleAudioPlay = () => {
        isPlaying.value = true
        store.isPlaying = true
    };

    const handleAudioPause = () => {
        isPlaying.value = false
        store.isPlaying = false
    }
    const handleclose = () => {
        isVisible.value = !isVisible.value
    }
    onMounted(() => {
        // 初始化音量
        if (audioPlayer.value) {
            audioPlayer.value.volume = volume.value / 100

            // 初始化播放状态
            isPlaying.value = !audioPlayer.value.paused
            store.isPlaying = isPlaying.value
        }
    })
</script>

<style lang="less" scoped>
    @accent: #667eea;

    .player-controls {
        position: fixed;
        bottom: 25px;
        left: 20px;
        right: 20px;
        height: 90px;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(30px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 25px;
        z-index: 1000;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        padding: 0 30px;
        display: flex;
        flex-direction: column;
        justify-content: center;

        .main-control-panel {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 100%;
            position: relative;
        }
    }
</style>