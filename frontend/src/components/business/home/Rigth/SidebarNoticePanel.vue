<template>
    <div class="sidebar-panel">
        <h3>公告</h3>
        <div class="p-div">
            <p>本项目github & gitee 开源地址：
                https://github.com/kuailemao/Ruyu-Blog
                https://gitee.com/kuailemao/ruyu-blog</p>
            <p>项目部署文档：https://kuailemao.xyz/article/48</p>
            <p>文档独立站点：http://docs.kuailemao.xyz/</p>
            <p>qq交流群：635887836</p>
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