<template>
    <micro-app name='MusicApp' baseroute="/musicPlayer" url='http://localhost:5175/' :data="userData"
        @datachange='handleDataChange'></micro-app>
</template>

<script setup lang="ts">
    // Vue/Vue Router/Pinia API 由 unplugin-auto-import 全局注入
    // 按需加载 micro-app：仅在进入音乐播放器路由时注册 <micro-app> 自定义元素
    import '@micro-zoe/micro-app'
    import { useUserStore } from '@/stores/user'

    const store = useUserStore()
    const router = useRouter()

    const MESSAGE_TYPES = {
        type: {
            ROUTE_REQUEST: 'ROUTE_REQUEST'
        },
        action: {
            REDIRECT_LOGIN: 'REDIRECT_LOGIN'
        }
    } as const

    const userData = computed(() => ({
        username: store.username,
        avatar: store.avatar,
        token: store.token
    }))

    const handleDataChange = (e: CustomEvent) => {
        const { type, action } = e.detail.data

        if (
            type === MESSAGE_TYPES.type.ROUTE_REQUEST &&
            action === MESSAGE_TYPES.action.REDIRECT_LOGIN
        ) {
            router.push('/login')
        }
    }

</script>