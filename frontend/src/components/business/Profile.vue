<template>
    <div class="avatar-card">
        <div class="UserInfo">
            <div class="img-shining-wrapper">
                <div class="UserImg">
                    <img v-if="avater" :src="avater" alt="">
                </div>
            </div>
            <h4>你好，<span>{{ username }}</span></h4>
        </div>

        <span class="user-intro">{{ signature }}</span>

        <div class="image-upload">
            <input type="file" ref="fileInput" accept="image/*" @change="handleImageSelect" style="display: none;">

            <button v-if="!previewUrl" @click="openFileDialog" class="upload-btn">
                <el-icon style="margin-right: 8px;">
                    <Camera />
                </el-icon>
                修改头像
            </button>

            <div v-if="previewUrl" class="preview">
                <div class="preview-wrapper">
                    <img :src="previewUrl" alt="预览" class="preview-image">
                </div>
                <div class="Buttons">
                    <button @click="clearImage" class="clear-btn">取消</button>
                    <button @click="newImage" class="confirm-btn">确认</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { ref, computed } from 'vue'
    import { useCounterStore } from '@/stores/counter'
    import { Camera } from '@element-plus/icons-vue'

    const props = defineProps<{
        username: string,
        signature: string
        avater: string | null
    }>()

    const emit = defineEmits<{
        (e: 'upload-avatar', file: File, previewUrl: string): void
    }>()

    //前端展示用Base64 字符串
    const previewUrl = ref('')
    const fileImage = ref<File>()
    const fileInput = ref<HTMLInputElement | null>()

    // const avater = computed(() => store.avatar)
    // const store = useCounterStore()

    const handleImageSelect = (event: Event) => {
        const target = event.target as HTMLInputElement
        const file = target.files?.[0]//FileList 对象是一个类数组对象，它代表了通过 <input type="file"> 元素选择的文件列表,这个数组名字就叫files

        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader()//FileReader 是浏览器内置的 API，用于读取文件内容
            fileImage.value = file
            reader.onload = (e) => {//当文件读取完成时，onload这个函数会被调用

                previewUrl.value = e.target?.result as string//e.target.result 包含读取的结果（Base64 字符串）
            }
            reader.readAsDataURL(file)//开始读取文件
        }
    }
    const openFileDialog = () => {
        fileInput.value?.click()
    }
    const clearImage = () => {

        previewUrl.value = ''
        if (fileInput.value) {
            fileInput.value.value = ''
        }
    }
    const newImage = () => {
        if (fileImage.value) {
            emit('upload-avatar', fileImage.value, previewUrl.value)
            previewUrl.value=''
        }
    }
</script>

<style lang="less" scoped>
    .avatar-card {
        width: 280px; // 使用固定宽度在响应式中更稳
        padding: 30px 20px;
        background: rgba(255, 255, 255, 0.05); // 极透明白
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: transform 0.3s ease;
        margin-top: 50px;

        &:hover {
            transform: translateY(-5px);
            border-color: rgba(255, 255, 255, 0.2);
        }

        .UserInfo {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            margin-bottom: 15px;

            .img-shining-wrapper {
                padding: 5px;
                border-radius: 50%;
                background: linear-gradient(135deg, rgba(64, 158, 255, 0.5), rgba(103, 194, 58, 0.5));
                margin-top: 10px;
                box-shadow: 0 0 20px rgba(64, 158, 255, 0.2);
            }

            .UserImg {
                width: 85px;
                height: 85px;
                border-radius: 50%;
                background-color: #222;
                background-size: cover;
                background-position: center;
                border: 3px solid rgba(255, 255, 255, 0.8);
                overflow: hidden;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }

            h4 {
                color: #fff;
                font-size: 18px;
                font-weight: 300;
                margin: 20px 0 15px;
                letter-spacing: 1px;

                span {
                    font-weight: 600;
                    color: #409EFF;
                }
            }
        }

        .user-intro {
            width: 100%;
            min-height: 60px;
            font-size: 13px;
            line-height: 1.6;
            text-align: center;
            color: rgba(255, 255, 255, 0.6);
            padding: 0 10px;
            margin-bottom: 20px;
        }

        .image-upload {
            width: 100%;

            .upload-btn {
                width: 100%;
                height: 45px;
                background: rgba(64, 158, 255, 0.2);
                color: #409EFF;
                border: 1px solid rgba(64, 158, 255, 0.3);
                border-radius: 12px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

                &:hover {
                    background: #409EFF;
                    color: white;
                    box-shadow: 0 10px 20px rgba(64, 158, 255, 0.3);
                }
            }

            .preview {
                animation: fadeIn 0.4s ease-out;

                .preview-wrapper {
                    width: 100px;
                    height: 100px;
                    margin: 0 auto 15px;
                    border-radius: 15px;
                    overflow: hidden;
                    border: 2px solid #409EFF;
                    box-shadow: 0 0 15px rgba(64, 158, 255, 0.4);

                    .preview-image {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                }

                .Buttons {
                    display: flex;
                    gap: 10px;

                    button {
                        flex: 1;
                        height: 35px;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: 600;
                        transition: all 0.2s;
                    }

                    .clear-btn {
                        background: rgba(245, 108, 108, 0.1);
                        color: #f56c6c;
                        border: 1px solid rgba(245, 108, 108, 0.3);

                        &:hover {
                            background: #f56c6c;
                            color: white;
                        }
                    }

                    .confirm-btn {
                        background: rgba(103, 194, 58, 0.1);
                        color: #67c23a;
                        border: 1px solid rgba(103, 194, 58, 0.3);

                        &:hover {
                            background: #67c23a;
                            color: white;
                        }
                    }
                }
            }
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>