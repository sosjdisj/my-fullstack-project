<template>
    <h3 class="left-h3">禁止发无关评论，违者永久封禁！！！</h3>
    <div class="left-memorable">
        <img :src="randomArticle?.cover" alt="" style="z-index: -1;">
        <h2 class="col">{{ randomArticle?.title }}</h2>
        <span class="col">{{ formatDate(randomArticle?.published) }}</span>
    </div>
</template>

<script lang="ts" setup>
    import type { Article } from '@/types/index'
    import { computed } from 'vue';
    import { formatDate } from '@/utils/helpers'

    const props = defineProps<{
        articleList: Article[]
    }>()

    // 生成随机索引
    const randomIndex = computed(() => {
        if (!props.articleList.length) return -1
        return Math.floor(Math.random() * props.articleList.length)
    })

    // 获取随机文章
    const randomArticle = computed(() => {
        if (!props.articleList.length || randomIndex.value === -1) return null
        return props.articleList[randomIndex.value]
    })
</script>

<style lang="less" scoped>

    .left-h3 {
        width: 95%;
        height: 40px;
        // margin-top: 20px;
        font-size: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: aliceblue;
        border-radius: 14px;
        border: 1px solid gray;
        cursor: default;
    }

    .left-memorable {
        width: 95%;
        height: 200px;
        margin-block: 5% 12%;
        border-radius: 12px;
        background-size: cover;
        display: flex;
        position: relative;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
        cursor: default;
        overflow: hidden;

        img {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .col {
            width: inherit;
            height: 30px;
            text-align: center;
            color: aliceblue;
        }
    }



    .bottom-p {
        width: 100%;
        display: flex;
        margin-bottom: 20px;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
        color: aliceblue;
    }

</style>