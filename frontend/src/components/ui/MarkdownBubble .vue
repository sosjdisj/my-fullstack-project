<template>
    <div class="markdown-bubble" v-html="sanitizedHtml"></div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import { marked } from 'marked'
    import DOMPurify from 'dompurify'

    // 🔥 定义类型
    type MessageRole = 'assistant' | 'user'

    const props = defineProps({
        content: {
            type: String,
            required: true
        },
        role: {
            type: String as () => MessageRole,
            default: 'assistant' as MessageRole,
            validator: (val: unknown): val is MessageRole => {
                return typeof val === 'string' && ['assistant', 'user'].includes(val)
            }
        }
    })

    // 配置 marked
    marked.setOptions({
        breaks: true,
        gfm: true
    })

    const sanitizedHtml = computed(() => {
        if (!props.content) return ''

        if (props.role === 'assistant') {
            // 🔥 关键修复：marked.parse() 在同步模式下返回 string
            // 如果是异步，需要用 await，但这里配置了同步选项，所以强制断言为 string
            const rawHtml = marked.parse(props.content) as string
            // 🔥 DOMPurify.sanitize 需要 string 类型，现在 rawHtml 已经是 string 了
            return DOMPurify.sanitize(rawHtml)
        } else {
            return props.content
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;')
                .replace(/\n/g, '<br>')
        }
    })
</script>

<style scoped lang="less">
    .markdown-bubble {
        word-break: break-word;

        :deep(p) {
            margin: 0 0 8px 0;

            &:last-child {
                margin-bottom: 0;
            }
        }

        :deep(ul),
        :deep(ol) {
            margin: 4px 0 8px 0;
            padding-left: 20px;
        }

        :deep(li) {
            margin-bottom: 2px;
        }

        :deep(strong) {
            font-weight: 600;
        }

        :deep(em) {
            font-style: italic;
        }

        // 行内代码 - 毛玻璃风格
        :deep(code) {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(4px);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Fira Code', 'Consolas', monospace;
            font-size: 0.9em;
            color: #e0e0e0;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        // 代码块 - 毛玻璃风格
        :deep(pre) {
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            padding: 16px;
            border-radius: 12px;
            overflow-x: auto;
            margin: 12px 0;
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

            code {
                background: transparent;
                padding: 0;
                border: none;
                backdrop-filter: none;
                color: #d4d4d4;
                font-size: 14px;
                line-height: 1.6;
            }
        }

        // 引用块 - 毛玻璃风格
        :deep(blockquote) {
            margin: 12px 0;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(8px);
            border-left: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 0 8px 8px 0;
            color: #c0c0c0;

            p {
                margin: 0;
            }
        }

        // 表格 - 毛玻璃风格
        :deep(table) {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(8px);
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.08);

            th,
            td {
                padding: 10px 12px;
                text-align: left;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }

            th {
                background: rgba(255, 255, 255, 0.08);
                font-weight: 600;
                color: #fff;
            }

            tr:last-child td {
                border-bottom: none;
            }

            tr:hover {
                background: rgba(255, 255, 255, 0.03);
            }
        }

        // 分割线
        :deep(hr) {
            border: none;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            margin: 20px 0;
        }

        // 链接
        :deep(a) {
            color: #7dd3fc;
            text-decoration: none;
            border-bottom: 1px solid rgba(125, 211, 252, 0.3);
            transition: all 0.2s;

            &:hover {
                color: #bae6fd;
                border-bottom-color: rgba(186, 230, 253, 0.6);
            }
        }

        // 图片
        :deep(img) {
            max-width: 100%;
            border-radius: 8px;
            margin: 8px 0;
        }

        // 任务列表
        :deep(input[type="checkbox"]) {
            margin-right: 8px;
            accent-color: rgba(255, 255, 255, 0.5);
        }
    }
</style>