
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 对于GitHub Pages，使用仓库名称作为base路径
  // 如果您的仓库名是 'face-insight'，则使用 '/face-insight/'
  // 如果是用户主页 (username.github.io)，则使用 '/'
  base: '/face-insight/',
  define: {
    // 允许在构建环境中使用 process.env (用于 API_KEY)
    // 注意：在 GitHub Pages 上这是公开的，不要提交真实的 API Key
    'process.env': process.env
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // 确保资源正确加载
    assetsDir: 'assets',
    // 确保复制public目录中的所有文件
    copyPublicDir: true,
    // 生成正确的相对路径
    rollupOptions: {
      output: {
        manualChunks: undefined,
        // 确保资源路径使用绝对路径
        // assetFileNames: 'assets/[name].[hash][extname]',
        // chunkFileNames: 'assets/[name].[hash].js',
        // entryFileNames: 'assets/[name].[hash].js'
      }
    }
  },
  // 确保所有资源正确加载
  server: {
    fs: {
      strict: false
    }
  },
  // 确保构建时复制public目录中的文件
  publicDir: 'public'
});