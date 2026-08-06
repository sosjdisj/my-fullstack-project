import { defineConfig, type PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { compression } from 'vite-plugin-compression2'

export default defineConfig({
  plugins: [
    vue(),
    // gzip + brotli 压缩，减小传输体积
    // 注：npm workspaces 下 vite-plugin-compression2 解析到根目录提升的 vite，
    // 与子应用本地 vite 的 Plugin 类型实例不兼容，这里用断言对齐
    compression({
      algorithms: ['gzip', 'brotliCompress'],
      exclude: [/\.map$/, /\.svg$/],
      threshold: 1024,
    }) as PluginOption,
  ],
  base: '/', // 确保基础路径正确
  server: {
    headers: {
      // 仅允许主应用域名加载子应用资源，避免被其他站点 iframe/script 引用
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    },
    port: 5175,
    cors: true, // 直接开启 cors 简单有效
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    // 面向现代浏览器，减少 polyfill 体积
    target: 'es2020',
    // 默认按需 modulePreload，加速子模块加载但避免 polyfill 噪声
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        // 分包：将稳定依赖独立打包，利于缓存
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
        },
        // 如果你希望打包出的文件名固定，可以保留这个
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      }
    },
    // 提高警告阈值，便于发现超大 chunk
    chunkSizeWarningLimit: 1000,
  }
})
