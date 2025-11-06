/**
 * 动态路由生成器
 * 根据后端返回的菜单配置动态生成路由配置
 */

import { lazy, Suspense, ComponentType } from 'react'
import { RouteObject } from 'react-router-dom'
import type { MenuItem } from '@/types'
import { PermissionGuard } from '@/components/business/permission/PermissionGuard'
import { Loading } from '@/components/ui/Loading'

// 页面组件映射表
const PAGE_COMPONENTS: Record<string, () => Promise<{ default: ComponentType<any> }>> = {
  '/': () => import('@/pages/Dashboard'),
  '/meetings': () => import('@/pages/MeetingListPage'),
  '/my-meetings': () => import('@/pages/MyMeetingPage'),
  '/sync-status': () => import('@/pages/MeetingSyncPage'),
  '/participants': () => import('@/pages/UserManagePage'),
  '/role-permissions': () => import('@/pages/permission/PermissionManagePage'),
  '/security-levels': () => import('@/pages/UserManagePage'),
  '/departments': () => import('@/pages/DepartmentPage'),
  '/users': () => import('@/pages/UserManagePage'),
  '/security-users': () => import('@/pages/UserManagePage'),
  '/data-dictionary': () => import('@/pages/DataDictionaryPage'),
  '/basic-config': () => import('@/pages/PolicyConfigPage'),
  '/admin-logs': () => import('@/pages/LogPage'),
  '/audit-logs': () => import('@/pages/LogPage'),
  '/anomaly-alerts': () => Promise.resolve({
    default: () => (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">异常行为告警</h1>
        <p className="text-muted-foreground">异常行为告警页面待开发</p>
      </div>
    )
  }),
  '/system-logs': () => Promise.resolve({
    default: () => (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">系统日志</h1>
        <p className="text-muted-foreground">系统日志页面待开发</p>
      </div>
    )
  }),
  '/staff': () => Promise.resolve({
    default: () => (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">人员管理</h1>
        <p className="text-muted-foreground">人员管理页面待开发</p>
      </div>
    )
  }),
}

// 页面属性配置
const PAGE_PROPS: Record<string, any> = {
  '/participants': { mode: 'admin' },
  '/security-levels': { mode: 'security_level' },
  '/users': { mode: 'admin' },
  '/security-users': { mode: 'security' },
  '/admin-logs': { mode: 'application' },
  '/audit-logs': { mode: 'three-admin' },
}

// 创建特殊路由的懒加载组件
const MeetingCreatePage = lazy(async () => {
  const module = await import('@/pages/MeetingFormPage')
  return { default: () => module.default({ mode: 'create' }) }
})

const MeetingEditPage = lazy(async () => {
  const module = await import('@/pages/MeetingFormPage')
  return { default: () => module.default({ mode: 'edit' }) }
})

const MeetingViewPage = lazy(async () => {
  const module = await import('@/pages/MeetingFormPage')
  return { default: () => module.default({ mode: 'view' }) }
})

// 额外的子路由配置（不在菜单中但需要的路由）
function getExtraRoutes(): RouteObject[] {
  return [
    {
      path: 'meetings/create',
      element: (
        <PermissionGuard permissions={['meeting:manage']}>
          <LazyWrapper>
            <MeetingCreatePage />
          </LazyWrapper>
        </PermissionGuard>
      ),
    },
    {
      path: 'meetings/edit/:id',
      element: (
        <PermissionGuard permissions={['meeting:manage']}>
          <LazyWrapper>
            <MeetingEditPage />
          </LazyWrapper>
        </PermissionGuard>
      ),
    },
    {
      path: 'meetings/view/:id',
      element: (
        <PermissionGuard permissions={['meeting:read']}>
          <LazyWrapper>
            <MeetingViewPage />
          </LazyWrapper>
        </PermissionGuard>
      ),
    },
  ]
}

// 懒加载包装器
function LazyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      {children}
    </Suspense>
  )
}

// 创建懒加载组件
function createLazyComponent(path: string) {
  const componentLoader = PAGE_COMPONENTS[path]
  if (!componentLoader) {
    return lazy(() => Promise.resolve({
      default: () => (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">页面未找到</h1>
          <p className="text-muted-foreground">路径: {path}</p>
        </div>
      )
    }))
  }

  return lazy(async () => {
    const module = await componentLoader()
    const Component = module.default
    const props = PAGE_PROPS[path] || {}
    
    return {
      default: (componentProps: any) => <Component {...props} {...componentProps} />
    }
  })
}

// 从菜单项生成路由配置
function menuItemToRoute(menuItem: MenuItem): RouteObject | null {
  // 跳过分组类型和没有路径的项
  if (menuItem.type === 'group' || !menuItem.path) {
    return null
  }

  const Component = createLazyComponent(menuItem.path)
  const permissions = menuItem.permissions || []

  // 移除开头的斜杠，因为这些是子路由
  const routePath = menuItem.path.startsWith('/') ? menuItem.path.slice(1) : menuItem.path
  // 根路径特殊处理
  const finalPath = routePath === '' ? undefined : routePath

  return {
    path: finalPath,
    index: routePath === '',
    element: (
      <PermissionGuard permissions={permissions}>
        <LazyWrapper>
          <Component />
        </LazyWrapper>
      </PermissionGuard>
    ),
  }
}

// 递归提取所有菜单项（包括子菜单）
function extractAllMenuItems(menus: MenuItem[]): MenuItem[] {
  const items: MenuItem[] = []
  
  function traverse(menuList: MenuItem[]) {
    for (const menu of menuList) {
      if (menu.type !== 'group' && menu.path) {
        items.push(menu)
      }
      if (menu.children && menu.children.length > 0) {
        traverse(menu.children)
      }
    }
  }
  
  traverse(menus)
  return items
}

/**
 * 根据菜单配置生成动态路由
 */
export function generateRoutesFromMenus(menus: MenuItem[]): RouteObject[] {
  const allMenuItems = extractAllMenuItems(menus)
  
  const routes: RouteObject[] = []
  
  for (const menuItem of allMenuItems) {
    const route = menuItemToRoute(menuItem)
    if (route) {
      routes.push(route)
    }
  }
  
  // 添加额外的子路由
  routes.push(...getExtraRoutes())
  
  return routes
}
