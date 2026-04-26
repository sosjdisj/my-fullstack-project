import { worker } from './browser'

export async function enableMocking() {
  // 使用 Vite 的环境变量（推荐）
  if (import.meta.env.PROD) {
    return
  }

  return worker.start()
}