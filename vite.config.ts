import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // 移除 Monaco 后，可以尝试更精细的分包
        manualChunks: (id) => {
          // React 核心
          if (id.includes('react') && !id.includes('react-router') && 
              !id.includes('react-hook-form') && !id.includes('react-dropzone')) {
            return 'react'
          }
          
          // React 生态系统
          if (id.includes('react-router') || id.includes('react-hook-form') || 
              id.includes('react-dropzone') || id.includes('@tanstack')) {
            return 'react-eco'
          }
          
          // 状态管理
          if (id.includes('zustand')) {
            return 'state'
          }
          
          // UI 和图标库
          if (id.includes('lucide-react') || id.includes('@dnd-kit') || 
              id.includes('allotment')) {
            return 'ui-libs'
          }
          
          // 工具库
          if (id.includes('axios') || id.includes('zod') || 
              id.includes('js-yaml') || id.includes('clsx') || 
              id.includes('tailwind-merge')) {
            return 'utils'
          }
          
          // 其他第三方库
          if (id.includes('node_modules')) {
            return 'vendor'
          }
          
          // 应用代码
          return 'app'
        }
      }
    },
    
    minify: 'esbuild',
    sourcemap: false,
    target: 'es2020'
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom'
    ]
  }
})
