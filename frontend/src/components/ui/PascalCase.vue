<template>
    <div class="search-expansion-container" :class="{ 'is-active': active }">
        <form class="search-header">
            <input v-model="keyword" ref="inputRef" type="text" placeholder="搜索文章、专题或代码..." @blur="handleBlur"
                @keydown.enter.prevent="handleSearch" />
        </form>

        <div class="search-content">
            <!-- 搜索结果列表：当有搜索内容时显示 -->
            <div v-if="keyword.trim()" class="search-result-list">
                <div class="result-item" v-for="item in searchResults" :key="item" @click="handleResultClick(item)">
                    <div class="result-icon">
                        <el-icon :size="18">
                            <Document />
                        </el-icon>
                    </div>
                    <div class="result-content">
                        <div class="result-title" v-html="highlightText(item)"></div>
                        <!-- <div class="result-desc" v-if="item.description">{{ item.description }}</div> -->
                    </div>
                </div>
                <div v-if="searchResults.length === 0" class="no-results">
                    <el-icon :size="24">
                        <InfoFilled />
                    </el-icon>
                    <span>暂无搜索结果</span>
                </div>
            </div>

            <!-- 历史搜索和热搜：当没有搜索内容时显示 -->
            <div v-else>
                <div class="section-title">✨ 历史搜索</div>
                <div class="tag-group">
                    <span v-for="item in searchHistoryList" @click="handleSearchTagClick(item)">{{ item }}</span>
                </div>

                <div class="section-title" style="margin-top: 20px;">🔥 实时热搜</div>
                <ul class="hot-list">
                    <li v-for="(item, index) in hotTitles" @click="handleSearchTagClick(item)">
                        <span>{{ index + 1 }}</span>
                        {{ item }}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useRouter } from 'vue-router';
    import { ref, watch, nextTick, onMounted } from 'vue';
    import { Document, InfoFilled } from '@element-plus/icons-vue'
    import { get } from '@/api/request';

    const props = defineProps({
        active: Boolean
    });
    const emit = defineEmits(['close'])
    const inputRef = ref<HTMLInputElement | null>(null);
    const keyword = ref<string>('')
    const SEARCH_HISTORY = 'searchHistory'
    const searchHistoryList = ref<Array<string>>([])
    const hotTitles = ref<Array<string>>([])
    const router = useRouter()
    const REAL_TIME_HOT_SEARCH = 'real_time_hot_search'

    // 搜索结果列表（你需要从后端获取数据并填充这个数组）
    const searchResults = ref<Array<any>>([])

    // 当外部点击图标激活时，自动聚焦输入框
    watch(() => props.active, (newVal) => {
        if (newVal) {
            nextTick(() => {
                inputRef.value?.focus();
            });
        }
    });

    const handleBlur = () => {
        // 如果输入框没内容，失焦自动关闭
        if (inputRef.value && !inputRef.value.value) {
        }
    };
    const handleSearch = async () => {
        const searchText = keyword.value.trim();

        const rawHistory = localStorage.getItem(SEARCH_HISTORY);
        let historyList: string[] = [];

        if (rawHistory) {
            const parsedData = JSON.parse(rawHistory);
            historyList = Array.isArray(parsedData) ? parsedData : [];
        }

        if (searchText !== '' && !historyList.includes(searchText)) {
            historyList.push(searchText);
            historyList = historyList.slice(-10);
        }

        localStorage.setItem(SEARCH_HISTORY, JSON.stringify(historyList));

        searchHistoryList.value = historyList;

        emit('close')
        router.push({
            path: '/searchResult',
            query: {
                searchResult: keyword.value,
            }
        });
        keyword.value = ''
    }

    // 处理搜索结果点击
    const handleResultClick = (item: string) => {
        // 你可以在这里实现跳转到具体的文章或页面
        handleSearchTagClick(item)
    }

    // 高亮搜索关键词
    const highlightText = (title: string) => {
        if (!title) return '';
        if (!keyword.value.trim()) return title
        const regex = new RegExp(`(${keyword.value.trim()})`, 'gi')
        return title.replace(regex, '<span class="highlight">$1</span>')
    }

    // 监听输入框内容变化，触发搜索
    watch(keyword, async (newValue) => {
        if (newValue.trim()) {
            const result = await get('/search/titles', { keyword: keyword.value })

            if (result.success) {
                searchResults.value = result.data.data.list
            }
        } else {
            searchResults.value = []
        }
    })
    const handleSearchTagClick = (item: string) => {
        keyword.value = item
        handleSearch()
    }
    watch(() => props.active, async (newValue) => {
        if (newValue) {
            const result = await get('/search/hot-titles')
            if (result.success) {
                hotTitles.value = result.data.data.list
            }
        }
    })
    onMounted(() => {
        const rawHistory = localStorage.getItem(SEARCH_HISTORY);
        if (rawHistory) {
            searchHistoryList.value = JSON.parse(rawHistory)
        }
    })
</script>

<style lang="less" scoped>
    // 变量定义
    @glass-bg: rgba(255, 255, 255, 0.08);
    @glass-border: rgba(255, 255, 255, 0.2);
    @accent: #38bdf8;

    .search-expansion-container {
        // 基础定位：从图标下方或中心展开
        position: absolute;
        top: 40px;
        right: -40px; // 根据你的图标位置微调
        width: 0;
        height: 0;
        opacity: 0;
        overflow: hidden;
        pointer-events: none;

        // 玻璃效果
        background: @glass-bg;
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        border: 1px solid @glass-border;
        border-radius: 20px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);

        // 动画
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        transform-origin: top right;
        z-index: 100;

        &.is-active {
            width: 350px;
            height: auto;
            min-height: 280px;
            opacity: 1;
            pointer-events: auto;
            padding: 20px;
            transform: translateY(10px);
        }

        .search-header {
            input {
                width: 100%;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid @glass-border;
                border-radius: 12px;
                padding: 12px 15px;
                color: #fff;
                outline: none;
                font-size: 14px;
                transition: border-color 0.3s;

                &:focus {
                    border-color: @accent;
                    background: rgba(255, 255, 255, 0.15);
                }
            }
        }

        .search-content {
            margin-top: 20px;

            // 搜索结果列表样式
            .search-result-list {
                max-height: 300px;
                overflow-y: auto;
                padding: 4px 0;

                // 自定义滚动条
                &::-webkit-scrollbar {
                    width: 4px;
                }

                &::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 2px;
                }

                &::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 2px;

                    &:hover {
                        background: rgba(255, 255, 255, 0.3);
                    }
                }

                .result-item {
                    display: flex;
                    align-items: flex-start;
                    padding: 6px;
                    margin-bottom: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid transparent;

                    &:hover {
                        background: rgba(255, 255, 255, 0.08);
                        border-color: rgba(56, 189, 248, 0.3);
                        transform: translateX(4px);

                        .result-icon {
                            color: @accent;
                            transform: scale(1.1);
                        }
                    }

                    .result-icon {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 12px;
                        color: rgba(255, 255, 255, 0.4);
                        transition: all 0.3s;
                        flex-shrink: 0;
                    }

                    .result-content {
                        flex: 1;
                        min-width: 0;
                        overflow: hidden;

                        .result-title {
                            font-size: 14px;
                            color: #fff;
                            font-weight: 500;
                            line-height: 1.5;
                            margin-bottom: 4px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;

                            :deep(.highlight) {
                                color: @accent;
                                font-weight: 600;
                                background: rgba(56, 189, 248, 0.1);
                                padding: 0 4px;
                                border-radius: 2px;
                            }
                        }

                        .result-desc {
                            font-size: 12px;
                            color: rgba(255, 255, 255, 0.5);
                            line-height: 1.4;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                    }
                }

                .no-results {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                    color: rgba(255, 255, 255, 0.4);
                    gap: 12px;
                }
            }

            .section-title {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.5);
                margin-bottom: 12px;
                letter-spacing: 1px;
            }

            .tag-group {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;

                span {
                    padding: 5px 12px;
                    font-size: 12px;
                    color: #ddd;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;

                    &:hover {
                        background: @accent;
                        color: #000;
                    }
                }
            }

            .hot-list {
                list-style: none;
                padding: 0;
                margin: 0;

                li {
                    padding: 8px 0;
                    color: #eee;
                    font-size: 13px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;

                    span {
                        margin-right: 10px;
                        color: @accent;
                        font-weight: bold;
                        font-style: italic;
                    }

                    &:hover {
                        color: @accent;
                    }
                }
            }
        }
    }
</style>