import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from './router'
import { PerformanceMonitor, DevPerformanceTools } from './components/PerformanceMonitor'
import { DialogProvider } from '@/components/ui/DialogProvider'
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
  
  return (
    <QueryClientProvider client={queryClient}>
      <DialogProvider>
        <PerformanceMonitor />
        {isDevelopment && <DevPerformanceTools />}
        <RouterProvider router={router} />
      </DialogProvider>
    </QueryClientProvider>
  )
}

export default App
