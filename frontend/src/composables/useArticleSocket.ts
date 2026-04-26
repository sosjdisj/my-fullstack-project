import { ref, onMounted, onUnmounted } from 'vue';
import { socket } from '@/socket/index';

export function useArticleSocket(articleId: string) {
    const readerCount = ref(0);

    // 监听回调
    const handleUpdate = (count: number) => {
        readerCount.value = count;
    };

    onMounted(() => {
        // 1. 挂载监听
        socket.on('reader count', handleUpdate);
        // 2. 加入房间
        socket.emit('join article', articleId);
    });

    onUnmounted(() => {
        // 3. 移除监听（非常重要：防止离开页面后还在后台刷屏）
        socket.emit('leave article', articleId);
        socket.off('reader count', handleUpdate);
    });

    return { readerCount };
}