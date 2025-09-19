import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { router } from './router'
import { PerformanceMonitor, DevPerformanceTools } from './components/PerformanceMonitor'
import { DialogProvider } from '@/components/ui/DialogProvider'
import { AuthErrorModal } from '@/components/ui/AuthErrorModal'
import { useGlobalStore } from '@/store'
import { checkAndShowExpirationWarning } from '@/utils/errorHandler'
import { showAlert } from '@/components/ui/DialogProvider'
import './styles/globals.css'

// 创建QueryClient实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5分钟
    },
    mutations: {
      retry: 1,
    },
  },
})

function App() {
  const isDevelopment = import.meta.env.DEV
  const { showAuthManagement } = useGlobalStore()
  
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
    
    // 监听URL变化
    const handleHashChange = () => checkUrlParams()
    window.addEventListener('hashchange', handleHashChange)
    
    return () => {
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
        <RouterProvider router={router} />
        <AuthErrorModal />
      </DialogProvider>
    </QueryClientProvider>
  )
}

export default App
