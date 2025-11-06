import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { MainLayout } from '@/components/layouts'
import { Loading } from '@/components/ui/Loading'
import { useGlobalStore } from '@/store'
import { useMenuPermission } from '@/hooks/usePermission'
import { generateRoutesFromMenus } from '@/utils/routeGenerator'

const LoginPage = lazy(() => import('@/pages/LoginPage'))

function LazyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      {children}
    </Suspense>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useGlobalStore()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useGlobalStore()
  
  if (user) {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

// 静态基础路由
const staticRoutes = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LazyWrapper>
          <LoginPage />
        </LazyWrapper>
      </PublicRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])

// 动态路由提供者组件
export function DynamicRouter() {
  const { user } = useGlobalStore()
  const { menus, isLoading } = useMenuPermission()

  // 未登录时使用静态路由
  if (!user) {
    return <RouterProvider router={staticRoutes} />
  }

  // 加载菜单时显示加载状态
  if (isLoading) {
    return <Loading />
  }

  // 生成动态路由
  const dynamicRoutes = generateRoutesFromMenus(menus)
  
  const router = createBrowserRouter([
    {
      path: '/login',
      element: (
        <PublicRoute>
          <LazyWrapper>
            <LoginPage />
          </LazyWrapper>
        </PublicRoute>
      ),
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: dynamicRoutes,
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ])

  return <RouterProvider router={router} />
}

// 导出空的 router 用于兼容旧代码
export const router = staticRoutes
