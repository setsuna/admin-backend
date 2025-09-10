import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layouts'
import { PermissionGuard } from '@/components/PermissionGuard'
import { Dashboard, LoginPage, MeetingListPage, MyMeetingPage, CreateMeetingPage } from '@/pages'
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
        path: 'meetings',
        element: (
          <PermissionGuard permissions={['meeting:view']}>
            <div className="p-6">
              <MeetingListPage />
            </div>
          </PermissionGuard>
        ),
      },
      {
        path: 'meetings/create',
        element: (
          <PermissionGuard permissions={['meeting:manage']}>
            <CreateMeetingPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'my-meetings',
        element: (
          <PermissionGuard permissions={['meeting:view']}>
            <div className="p-6">
              <MyMeetingPage />
            </div>
          </PermissionGuard>
        ),
      },
      {
        path: 'sync-status',
        element: (
          <PermissionGuard permissions={['sync:view']}>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">同步状态</h1>
              <p className="text-muted-foreground">同步状态页面待开发</p>
            </div>
          </PermissionGuard>
        ),
      },
      {
        path: 'participants',
        element: (
          <PermissionGuard permissions={['personnel:view']}>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">参会人员</h1>
              <p className="text-muted-foreground">参会人员页面待开发</p>
            </div>
          </PermissionGuard>
        ),
      },
      {
        path: 'role-permissions',
        element: (
          <PermissionGuard permissions={['role:manage']}>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">角色权限</h1>
              <p className="text-muted-foreground">角色权限页面待开发</p>
            </div>
          </PermissionGuard>
        ),
      },
      {
        path: 'security-levels',
        element: (
          <PermissionGuard permissions={['security:manage']}>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">人员密级</h1>
              <p className="text-muted-foreground">人员密级页面待开发</p>
            </div>
          </PermissionGuard>
        ),
      },
      {
        path: 'departments',
        element: (
          <PermissionGuard permissions={['org:manage']}>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">部门管理</h1>
              <p className="text-muted-foreground">部门管理页面待开发</p>
            </div>
          </PermissionGuard>
        ),
      },
      {
        path: 'staff',
        element: (
          <PermissionGuard permissions={['staff:manage']}>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">人员管理</h1>
              <p className="text-muted-foreground">人员管理页面待开发</p>
            </div>
          </PermissionGuard>
        ),
      },
      {
        path: 'data-dictionary',
        element: (
          <PermissionGuard permissions={['system:dict']}>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">数据字典</h1>
              <p className="text-muted-foreground">数据字典页面待开发</p>
            </div>
          </PermissionGuard>
        ),
      },
      {
        path: 'basic-config',
        element: (
          <PermissionGuard permissions={['system:config']}>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">基础配置</h1>
              <p className="text-muted-foreground">基础配置页面待开发</p>
            </div>
          </PermissionGuard>
        ),
      },
      {
        path: 'system-logs',
        element: (
          <PermissionGuard permissions={['system:logs']}>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">系统日志</h1>
              <p className="text-muted-foreground">系统日志页面待开发</p>
            </div>
          </PermissionGuard>
        ),
      },
      {
        path: 'admin-logs',
        element: (
          <PermissionGuard permissions={['logs:admin']}>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">操作日志（系统员）</h1>
              <p className="text-muted-foreground">系统员操作日志页面待开发</p>
            </div>
          </PermissionGuard>
        ),
      },
      {
        path: 'audit-logs',
        element: (
          <PermissionGuard permissions={['logs:audit']}>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">操作日志（审计员）</h1>
              <p className="text-muted-foreground">审计员操作日志页面待开发</p>
            </div>
          </PermissionGuard>
        ),
      },
      {
        path: 'anomaly-alerts',
        element: (
          <PermissionGuard permissions={['monitor:alerts']}>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">异常行为告警</h1>
              <p className="text-muted-foreground">异常行为告警页面待开发</p>
            </div>
          </PermissionGuard>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
