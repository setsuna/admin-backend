import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect } from 'react'
import { router } from './router'
import { PerformanceMonitor, DevPerformanceTools } from './components/PerformanceMonitor'
import { DialogProvider } from '@/components/ui/DialogProvider'
import { AuthErrorModal } from '@/components/ui/AuthErrorModal'
// 🔧 修复：导入通知组件
import { NotificationContainer } from '@/components/ui/Notification'
import { useGlobalStore } from '@/store'
import { checkAndShowExpirationWarning } from '@/utils/errorHandler'
import { showAlert } from '@/components/ui/DialogProvider'
// 🔧 修复：导入全局错误处理Hook
import { useErrorHandler } from '@/hooks/useErrorHandler'
// 🔧 使用新的 query config
import { queryClient } from '@/config/query.config'
import './styles/globals.css'

function App() {
  const isDevelopment = import.meta.env.DEV
  const { showAuthManagement } = useGlobalStore()
  
  // 🔧 修复：启用全局错误处理
  useErrorHandler()
  
  // 动态设置页面标题
  useEffect(() => {
    const title = import.meta.env.VITE_APP_TITLE || '管理系统'
    document.title = title
  }, [])
  
  // 监听URL参数
  useEffect(() => {
    const checkUrlParams = () => {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('info') === 'true') {
        showAuthManagement()
        
        // 清除URL参数
        const newUrl = window.location.pathname + window.location.hash
        window.history.replaceState({}, '', newUrl)
      }
    }
    
    // 页面加载时检查
    checkUrlParams()
    
    // 监听URL变化（popstate 事件处理前进/后退）
    const handlePopState = () => checkUrlParams()
    window.addEventListener('popstate', handlePopState)
    
    // 监听 hash 变化
    const handleHashChange = () => checkUrlParams()
    window.addEventListener('hashchange', handleHashChange)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [showAuthManagement])
  
  // 检查授权状态
  useEffect(() => {
    const checkAuthPeriodically = () => {
      checkAndShowExpirationWarning(showAlert)
    }
    
    // 立即检查一次
    checkAuthPeriodically()
    
    // 每小时检查一次
    const interval = setInterval(checkAuthPeriodically, 60 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <QueryClientProvider client={queryClient}>
      <DialogProvider>
        <PerformanceMonitor />
        {isDevelopment && <DevPerformanceTools />}
        {isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
        <RouterProvider router={router} />
        <AuthErrorModal />
        {/* 🔧 修复：添加通知组件 */}
        <NotificationContainer />
      </DialogProvider>
    </QueryClientProvider>
  )
}

export default App
