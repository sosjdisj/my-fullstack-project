<template>
    <div class="sidebar-panel">
        <h3>公告</h3>
        <div class="p-div">
            <p>欢迎来到我的个人博客！这是一个基于 Vue 3 + Spring Boot + Python AI 的全栈项目。</p>
            <p>集成 RAG 知识库问答、Agent 工具调用与微前端音乐播放器。</p>
            <p>本项目为个人学习与作品展示用途，本地运行即可体验完整功能。</p>
            <p>欢迎指出网站的不足，给我提供意见。</p>
        </div>
    </div>
</template>

<script lang="ts" setup>

</script>

<style lang="less" scoped>
    .sidebar-panel {
        width: 100%;
        height: 241.35px;
        box-sizing: content-box;
        opacity: 0;
        background: rgba(20, 20, 25, 0.6); // 使用深色半透，压住背景
        backdrop-filter: blur(15px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        overflow-x: auto;

        .p-div {
            display: flex;
            flex-direction: column;
        }

        h3:first-child {
            width: 60px;
            color: aliceblue;
            margin: 10px 0 6% 16%;
        }

        p {
            width: 120%;
            color: gray;
            margin-left: 10px;
            font-size: 15px;
            user-select: none;
        }
    }
</style>