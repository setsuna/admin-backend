import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layouts'
import { PermissionGuard } from '@/components/PermissionGuard'
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
        element: (
          <PermissionGuard permissions={['dashboard:view']}>
            <Dashboard />
          </PermissionGuard>
        ),
      },
      {
        path: 'devices',
        element: (
          <PermissionGuard permissions={['device:view']}>
            <DevicesPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'users',
        element: (
          <PermissionGuard permissions={['user:view']}>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">用户管理</h1>
              <p className="text-muted-foreground">用户管理页面待开发</p>
            </div>
          </PermissionGuard>
        ),
      },
      {
        path: 'projects',
        element: (
          <PermissionGuard permissions={['project:view']}>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">项目管理</h1>
              <p className="text-muted-foreground">项目管理页面待开发</p>
            </div>
          </PermissionGuard>
        ),
      },
      {
        path: 'ansible',
        element: (
          <PermissionGuard permissions={['ansible:view']}>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Ansible管理</h1>
              <p className="text-muted-foreground">Ansible管理页面待开发</p>
            </div>
          </PermissionGuard>
        ),
      },
      {
        path: 'settings',
        element: (
          <PermissionGuard permissions={['system:settings']}>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">设置</h1>
              <p className="text-muted-foreground">系统设置页面待开发</p>
            </div>
          </PermissionGuard>
        ),
      },
      {
        path: 'help',
        element: (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">帮助中心</h1>
            <p className="text-muted-foreground">帮助中心页面待开发</p>
          </div>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
