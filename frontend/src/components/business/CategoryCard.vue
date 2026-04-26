<template>
    <div class="categories-container">
        <div class="categories-div1">

            <div class="bg-image">
                <img src="/src/ass/【哲风壁纸】8k-个性背景.png" alt="">
            </div>

            <div class="bt">
                <h1>{{ props.name }}</h1>
                <span>{{ props.id }}</span>
            </div>
        </div>

        <div>
            <slot></slot>
        </div>

        <div class="categories-div3"></div>
    </div>
</template>

<script lang="ts" setup>
    const props = defineProps({
        name: String,
        id: String
    })
</script>

<style lang="less" scoped>

    .categories-container {
        height: 100%;
        width: 100%;
        overflow-y: auto;

        .categories-div1 {
            width: inherit;
            height: 357px;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;

            .bg-image {
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                position: absolute;
                z-index: -1;


                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }

            .bt {
                width: 200px;
                height: 178px;
                display: flex;
                flex-wrap: wrap;
                justify-content: center;

                h1 {
                    width: inherit;
                    font-size: 60px;
                    text-align: center;
                }


            }
        }

        .categories-div3 {
            width: inherit;
            height: 120px;
            background-color: blue;
        }
    }
</style>