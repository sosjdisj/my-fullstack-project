<template>
    <div class="form-container">
        <div class="input-wrapper" :class="{ 'shake-animation': codeerrorMsg }">
            <input type="text" :placeholder="props.placeholder" class="custom-input" v-model="codeUpdate"
                @blur="checkPassword(props.updata)" @keydown.enter="handleEnterKey" :class="{
                    'is-error': codeerrorMsg,
                    'is-success': !codeerrorMsg && innerValue && innerValue.length > 0
                }" :autocomplete="props.updata">
        </div>

        <transition name="expand">
            <div class="error-wrapper" v-if="codeerrorMsg">
                <span class="error-message">
                    {{ props.errors[props.updata] }}
                </span>
            </div>
        </transition>
    </div>
</template>

<script lang="ts" setup>
    import { computed, ref } from 'vue'
    import type { FormField, LoginResult } from '@/types/index'

    const emit = defineEmits(['update-form-field', 'handCheck'])

    const props = defineProps<{
        errors: LoginResult
        updata: FormField
        placeholder: string
    }>()

    const innerValue = ref<string>('')

    const codeUpdate = computed({
        get() {
            return innerValue.value;
        },
        set(newValue) {
            innerValue.value = newValue
            emit('update-form-field', newValue)
        }
    })

    // 判断是否有错误信息
    const codeerrorMsg = computed(() => {
        return props.errors[props.updata] !== '' && props.errors[props.updata] !== undefined
    })

    const checkPassword = (fieldName: FormField) => {
        emit('handCheck', fieldName)
    }

    const handleEnterKey = (event: KeyboardEvent) => {
        (event.target as HTMLElement).blur()
    }
</script>

<style lang="less" scoped>
    @danger: #f87171;
    @primary: #4f46e5;

    .form-container {
        display: flex;
        flex-direction: column;
        width: 300px;
        margin-bottom: 10px;

        .input-wrapper {
            position: relative;
            transition: transform 0.3s ease; // 为抖动准备
        }

        .custom-input {
            width: 100%;
            height: 42px;
            padding: 0 14px;
            background: rgba(255, 255, 255, 0.05);
            border: 1.5px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #fff;
            box-sizing: border-box;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

            &:focus {
                outline: none;
                border-color: @primary;
                box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
                background: rgba(255, 255, 255, 0.1);
            }

            &.is-error {
                border-color: @danger;
                background: rgba(248, 113, 113, 0.05);
            }
        }

        // 1. 错误提示的容器：控制高度动画
        .error-wrapper {
            overflow: hidden; // 必须，否则文字会溢出
            display: flex;
            align-items: center;
        }

        .error-message {
            padding: 6px 0 2px 4px;
            font-size: 12px;
            color: @danger;
            font-weight: 500;
        }
    }

    /* --- 动画 1: 展开推开效果 --- */
    .expand-enter-active {
        transition: all 0.3s ease-out;
        max-height: 40px; // 足够容纳文字的高度
    }

    .expand-leave-active {
        transition: all 0.2s ease-in;
        max-height: 40px;
    }

    .expand-enter-from,
    .expand-leave-to {
        max-height: 0;
        opacity: 0;
        transform: translateY(-5px); // 带有轻微位移感
    }

    /* --- 动画 2: 抖动反馈 --- */
    .shake-animation {
        animation: shake 0.4s cubic-bezier(.36, .07, .19, .97) both;
    }

    @keyframes shake {

        10%,
        90% {
            transform: translate3d(-1px, 0, 0);
        }

        20%,
        80% {
            transform: translate3d(2px, 0, 0);
        }

        30%,
        50%,
        70% {
            transform: translate3d(-4px, 0, 0);
        }

        40%,
        60% {
            transform: translate3d(4px, 0, 0);
        }
    }
</style>