<template>
    <micro-app name='MusicApp' baseroute="/musicPlayer" url='http://localhost:5175/' :data="userData"
        @datachange='handleDataChange'></micro-app>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import { useUserStore } from '@/stores/user'
    import { useRouter } from 'vue-router'

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