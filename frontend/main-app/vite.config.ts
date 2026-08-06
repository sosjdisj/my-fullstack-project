import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { compression } from 'vite-plugin-compression2'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 在构建时也识别 micro-app 为自定义元素
          isCustomElement: (tag) => tag === 'micro-app',
        }
      }
    }),
    vueDevTools(),
    tailwindcss(),
    // Element Plus 按需引入 + Vue/Vue Router/Pinia API 全局化
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: [
        'vue',
        'vue-router',
        'pinia',
        // 将 ElMessage 命令式 API 全局化，删除各文件中的显式 import
        { 'element-plus': ['ElMessage', 'ElMessageBox', 'ElNotification', 'ElLoading'] },
      ],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    // gzip + brotli 压缩，减小传输体积
    compression({
      algorithms: ['gzip', 'brotliCompress'],
      exclude: [/\.map$/, /\.svg$/],
      threshold: 1024,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    // 面向现代浏览器，减少 polyfill 体积
    target: 'es2020',
    // 启用 CSS 代码分割，避免首屏加载所有 CSS
    // cssCodeSplit: true,
    // 默认按需 modulePreload，加速子模块加载但避免 polyfill 噪声
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        // 分包：将稳定依赖独立打包，利于缓存
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus', '@element-plus/icons-vue'],
          micro: ['@micro-zoe/micro-app'],
          // 将动画相关重依赖单独分包，避免被 Home chunk 内联
          gsap: ['gsap'],
        },
      },
    },
    // 提高警告阈值，便于发现超大 chunk
    chunkSizeWarningLimit: 1000,
  },
  server: {
    // 开发环境基础安全头，生产环境由反向代理统一注入
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
    },
  },
})
