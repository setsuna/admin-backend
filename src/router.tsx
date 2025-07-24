import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layouts'
import { Dashboard, DevicesPage, ConfigsPage, LoginPage } from '@/pages'
import { useGlobalStore } from '@/store'

// 路由守卫组件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useGlobalStore()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

// 公共路由组件
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useGlobalStore()
  
  if (user) {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
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
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'devices',
        element: <DevicesPage />,
      },
      {
        path: 'configs',
        element: <ConfigsPage />,
      },
      {
        path: 'users',
        element: <div>用户管理页面待开发</div>,
      },
      {
        path: 'analytics',
        element: <div>数据分析页面待开发</div>,
      },
      {
        path: 'settings',
        element: <div>系统设置页面待开发</div>,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
