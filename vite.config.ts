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
    // 提高 chunk 大小警告阈值到 1000kb
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // 手动分包策略
        manualChunks: (id) => {
          // React 生态系统
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router')) {
            return 'react-vendor'
          }
          
          // UI 和图标库
          if (id.includes('node_modules/lucide-react') ||
              id.includes('node_modules/@tanstack/react-query') ||
              id.includes('node_modules/zustand') ||
              id.includes('node_modules/allotment')) {
            return 'ui-vendor'
          }
          
          // 文件处理相关
          if (id.includes('node_modules/react-dropzone')) {
            return 'file-vendor'
          }
          
          // 工具库
          if (id.includes('node_modules/clsx') ||
              id.includes('node_modules/tailwind-merge') ||
              id.includes('node_modules/date-fns')) {
            return 'utils-vendor'
          }
          
          // 会议相关组件
          if (id.includes('/src/components/meeting/')) {
            return 'meeting-components'
          }
          
          // 页面组件
          if (id.includes('/src/pages/')) {
            return 'pages'
          }
          
          // 服务和模拟数据
          if (id.includes('/src/services/') || id.includes('/src/mock/')) {
            return 'services'
          }
          
          // 其他 node_modules
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
        
        // 基于模块路径的动态分包
        chunkFileNames: (chunkInfo) => {
          // 为不同类型的模块使用不同的命名
          if (chunkInfo.name?.includes('vendor')) {
            return 'vendors/[name]-[hash].js'
          }
          if (chunkInfo.name?.includes('components')) {
            return 'components/[name]-[hash].js'
          }
          if (chunkInfo.name?.includes('pages')) {
            return 'pages/[name]-[hash].js'
          }
          if (chunkInfo.name?.includes('services')) {
            return 'services/[name]-[hash].js'
          }
          return 'chunks/[name]-[hash].js'
        },
        
        // 入口文件命名
        entryFileNames: 'assets/[name]-[hash].js',
        
        // CSS 文件命名
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/styles/[name]-[hash].css'
          }
          return 'assets/[name]-[hash].[ext]'
        }
      }
    },
    
    // 启用 minification (使用 esbuild，更快但压缩率稍低)
    minify: 'esbuild',
    
    // 启用 source map（可选，用于调试）
    sourcemap: false,
    
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    
    // 设置静态资源处理
    assetsInlineLimit: 4096, // 小于 4kb 的资源内联为 base64
  },
  
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      '@tanstack/react-query',
      'zustand',
      'react-dropzone',
      'allotment'
    ],
    exclude: [
      // 排除一些不需要预构建的包
    ]
  }
})
