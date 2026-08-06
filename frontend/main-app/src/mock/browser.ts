import { setupWorker } from 'msw/browser'
import { handlers } from '@/mock/handlers'  // 导入上面写的拦截规则

// 创建 worker 实例
export const worker = setupWorker(...handlers)