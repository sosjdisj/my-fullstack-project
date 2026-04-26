<template>
    <micro-app name='MusicApp' baseroute="/musicPlayer" url='http://localhost:5175/'
        :data="{ isAuthenticated }" ></micro-app>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import { useCounterStore } from '@/stores/counter'

    const store = useCounterStore()
    const isAuthenticated = computed(() => store.username)
</script>