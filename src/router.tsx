import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { MainLayout } from '@/components/layouts'
import { PermissionGuard } from '@/components/PermissionGuard'
import { Loading } from '@/components/ui/Loading'
import { useGlobalStore } from '@/store'

// 懒加载组件
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const MeetingListPage = lazy(() => import('@/pages/MeetingListPage'))
const MyMeetingPage = lazy(() => import('@/pages/MyMeetingPage'))
const CreateMeetingPage = lazy(() => import('@/pages/CreateMeetingPage'))
const DataDictionaryPage = lazy(() => import('@/pages/DataDictionaryPage'))

// 未来页面的懒加载（占位符）
const SyncStatusPage = lazy(() => 
  Promise.resolve({
    default: () => (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">同步状态</h1>
        <p className="text-muted-foreground">同步状态页面待开发</p>
      </div>
    )
  })
)

const ParticipantsPage = lazy(() => 
  Promise.resolve({
    default: () => (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">参会人员</h1>
        <p className="text-muted-foreground">参会人员页面待开发</p>
      </div>
    )
  })
)

const RolePermissionsPage = lazy(() => 
  Promise.resolve({
    default: () => (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">角色权限</h1>
        <p className="text-muted-foreground">角色权限页面待开发</p>
      </div>
    )
  })
)

const SecurityLevelsPage = lazy(() => 
  Promise.resolve({
    default: () => (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">人员密级</h1>
        <p className="text-muted-foreground">人员密级页面待开发</p>
      </div>
    )
  })
)

const DepartmentsPage = lazy(() => 
  Promise.resolve({
    default: () => (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">部门管理</h1>
        <p className="text-muted-foreground">部门管理页面待开发</p>
      </div>
    )
  })
)

const StaffPage = lazy(() => 
  Promise.resolve({
    default: () => (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">人员管理</h1>
        <p className="text-muted-foreground">人员管理页面待开发</p>
      </div>
    )
  })
)



const BasicConfigPage = lazy(() => 
  Promise.resolve({
    default: () => (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">基础配置</h1>
        <p className="text-muted-foreground">基础配置页面待开发</p>
      </div>
    )
  })
)

const SystemLogsPage = lazy(() => 
  Promise.resolve({
    default: () => (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">系统日志</h1>
        <p className="text-muted-foreground">系统日志页面待开发</p>
      </div>
    )
  })
)

const AdminLogsPage = lazy(() => 
  Promise.resolve({
    default: () => (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">操作日志（系统员）</h1>
        <p className="text-muted-foreground">系统员操作日志页面待开发</p>
      </div>
    )
  })
)

const AuditLogsPage = lazy(() => 
  Promise.resolve({
    default: () => (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">操作日志（审计员）</h1>
        <p className="text-muted-foreground">审计员操作日志页面待开发</p>
      </div>
    )
  })
)

const AnomalyAlertsPage = lazy(() => 
  Promise.resolve({
    default: () => (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">异常行为告警</h1>
        <p className="text-muted-foreground">异常行为告警页面待开发</p>
      </div>
    )
  })
)

// 懒加载包装器组件
function LazyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      {children}
    </Suspense>
  )
}

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
    children: [
      {
        index: true,
        element: (
          <PermissionGuard permissions={['dashboard:view']}>
            <LazyWrapper>
              <Dashboard />
            </LazyWrapper>
          </PermissionGuard>
        ),
      },
      {
        path: 'meetings',
        element: (
          <PermissionGuard permissions={['meeting:view']}>
            <LazyWrapper>
              <MeetingListPage />
            </LazyWrapper>
          </PermissionGuard>
        ),
      },
      {
        path: 'meetings/create',
        element: (
          <PermissionGuard permissions={['meeting:manage']}>
            <LazyWrapper>
              <CreateMeetingPage />
            </LazyWrapper>
          </PermissionGuard>
        ),
      },
      {
        path: 'my-meetings',
        element: (
          <PermissionGuard permissions={['meeting:view']}>
            <LazyWrapper>
              <MyMeetingPage />
            </LazyWrapper>
          </PermissionGuard>
        ),
      },
      {
        path: 'sync-status',
        element: (
          <PermissionGuard permissions={['sync:view']}>
            <LazyWrapper>
              <SyncStatusPage />
            </LazyWrapper>
          </PermissionGuard>
        ),
      },
      {
        path: 'participants',
        element: (
          <PermissionGuard permissions={['personnel:view']}>
            <LazyWrapper>
              <ParticipantsPage />
            </LazyWrapper>
          </PermissionGuard>
        ),
      },
      {
        path: 'role-permissions',
        element: (
          <PermissionGuard permissions={['role:manage']}>
            <LazyWrapper>
              <RolePermissionsPage />
            </LazyWrapper>
          </PermissionGuard>
        ),
      },
      {
        path: 'security-levels',
        element: (
          <PermissionGuard permissions={['security:manage']}>
            <LazyWrapper>
              <SecurityLevelsPage />
            </LazyWrapper>
          </PermissionGuard>
        ),
      },
      {
        path: 'departments',
        element: (
          <PermissionGuard permissions={['org:manage']}>
            <LazyWrapper>
              <DepartmentsPage />
            </LazyWrapper>
          </PermissionGuard>
        ),
      },
      {
        path: 'staff',
        element: (
          <PermissionGuard permissions={['staff:manage']}>
            <LazyWrapper>
              <StaffPage />
            </LazyWrapper>
          </PermissionGuard>
        ),
      },
      {
        path: 'data-dictionary',
        element: (
          <PermissionGuard permissions={['system:dict']}>
            <LazyWrapper>
              <DataDictionaryPage />
            </LazyWrapper>
          </PermissionGuard>
        ),
      },
      {
        path: 'basic-config',
        element: (
          <PermissionGuard permissions={['system:config']}>
            <LazyWrapper>
              <BasicConfigPage />
            </LazyWrapper>
          </PermissionGuard>
        ),
      },
      {
        path: 'system-logs',
        element: (
          <PermissionGuard permissions={['system:logs']}>
            <LazyWrapper>
              <SystemLogsPage />
            </LazyWrapper>
          </PermissionGuard>
        ),
      },
      {
        path: 'admin-logs',
        element: (
          <PermissionGuard permissions={['logs:admin']}>
            <LazyWrapper>
              <AdminLogsPage />
            </LazyWrapper>
          </PermissionGuard>
        ),
      },
      {
        path: 'audit-logs',
        element: (
          <PermissionGuard permissions={['logs:audit']}>
            <LazyWrapper>
              <AuditLogsPage />
            </LazyWrapper>
          </PermissionGuard>
        ),
      },
      {
        path: 'anomaly-alerts',
        element: (
          <PermissionGuard permissions={['monitor:alerts']}>
            <LazyWrapper>
              <AnomalyAlertsPage />
            </LazyWrapper>
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
