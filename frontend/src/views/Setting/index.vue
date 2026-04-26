<template>
    <div class="Setting">
        <ProfileSettingsCard :initial-data="userData" @submit="handProfile" />

        <Profile :signature="userData.signature" :username="userData.username" :avater="userData.cover"
            @upload-avatar="handleAvatarUpload" />
    </div>
</template>
<script lang="ts" setup>
    import { onMounted } from 'vue';
    import Profile from '@/components/business/Profile.vue'
    import ProfileSettingsCard from '@/components/business/ProfileSettingsCard.vue'
    import { useSetting } from '@/views/Setting/useSetting'

    const { userData, handProfile, handleAvatarUpload, fetchSettings } = useSetting()

    onMounted(async () => {
        await fetchSettings()
    })
</script>

<style lang="less" scoped>
    .Setting {
        width: 100%;
        min-height: 100vh;
        /* 使用和时间轴一致的深色底色，确保玻璃感 */
        background: #3c3f49;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding-top: 80px;
        gap: 40px;

        .Form-card {
            width: 45%;
            padding: 40px;
            background: rgba(255, 255, 255, 0.04);
            backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 30px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;

            .header-section {
                width: 100%;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding-bottom: 20px;
                margin-bottom: 30px;

                h3 {
                    color: #fff;
                    font-size: 24px;
                    font-weight: 500;
                    margin: 0 0 8px 0;
                }

                p {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.5);
                    margin: 0;
                }
            }

            .main-form {
                display: flex;
                flex-direction: column;
                gap: 25px;

                .input-item {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;

                    label {
                        font-size: 14px;
                        color: rgba(255, 255, 255, 0.8);
                        font-weight: 500;
                        padding-left: 5px;
                    }
                }

                .glass-input,
                .glass-textarea {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    color: #fff;
                    padding: 12px 15px;
                    font-size: 15px;
                    transition: all 0.3s ease;

                    &:focus {
                        outline: none;
                        border-color: #409EFF;
                        background: rgba(64, 158, 255, 0.05);
                        box-shadow: 0 0 15px rgba(64, 158, 255, 0.2);
                    }

                    &::placeholder {
                        color: rgba(255, 255, 255, 0.2);
                    }
                }

                .glass-textarea {
                    resize: none;
                    line-height: 1.6;
                }

                /* 深度修改 Element Plus 单选框颜色 */
                :deep(.el-radio) {
                    color: rgba(255, 255, 255, 0.6);

                    .el-radio__inner {
                        background-color: transparent;
                        border-color: rgba(255, 255, 255, 0.3);
                    }

                    &.is-checked {
                        .el-radio__label {
                            color: #409EFF;
                        }

                        .el-radio__inner {
                            background: #409EFF;
                            border-color: #409EFF;
                        }
                    }
                }

                .footer-action {
                    margin-top: 10px;

                    .update-btn {
                        padding: 12px 30px;
                        background: linear-gradient(135deg, #10b981, #059669);
                        color: white;
                        border: none;
                        border-radius: 12px;
                        font-weight: 600;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);

                        &:hover {
                            transform: translateY(-3px);
                            box-shadow: 0 15px 25px rgba(16, 185, 129, 0.4);
                            filter: brightness(1.1);
                        }

                        &:active {
                            transform: translateY(0);
                        }
                    }
                }
            }
        }
    }
</style>