import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from './router'
import { PerformanceMonitor, DevPerformanceTools } from './components/PerformanceMonitor'
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
      <PerformanceMonitor />
      {isDevelopment && <DevPerformanceTools />}
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

export default App
