import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    // 设置ES模块兼容性
    target: 'esnext',
    // 使用传统脚本加载方式
    modulePreload: false,
    // 生成系统兼容性更好的输出
    outDir: 'dist',
    assetsDir: 'assets',
    // 关闭分块以解决浏览器直接打开的问题
    rollupOptions: {
      output: {
        manualChunks: undefined,
        // 降低代码分割粒度，减少文件请求
        inlineDynamicImports: true
      }
    }
  }
})