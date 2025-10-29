import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { usePermission } from '@/hooks/usePermission'
import { Separator } from '@/components/ui/Separator'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { useAuth } from '@/store'
import { authService } from '@/services/core/auth.service'
import { useLocation } from 'react-router-dom'

export function MainLayout() {
  // 初始化权限数据
  usePermission()
  const { user, clearAuth } = useAuth()
  const location = useLocation()
  
  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.warn('Logout API error:', error)
    } finally {
      clearAuth()
      window.location.href = '/login'
    }
  }
  
  // 根据路径获取面包屑导航
  const getBreadcrumb = () => {
    const path = location.pathname
    const pathMap: Record<string, { module: string; parent?: string; page: string }> = {
      '/': { module: '工作台', page: '仪表板' },
      '/meetings': { module: '会议管理', page: '会议列表' },
      '/meetings/create': { module: '会议管理', parent: '会议列表', page: '新建会议' },
      '/my-meetings': { module: '会议管理', page: '我的会议' },
      '/sync-status': { module: '同步管理', page: '同步状态' },
      '/participants': { module: '人员管理', page: '参会人员' },
      '/role-permissions': { module: '权限管理', page: '角色权限' },
      '/security-levels': { module: '权限管理', page: '人员密级' },
      '/departments': { module: '组织管理', page: '部门管理' },
      '/staff': { module: '组织管理', page: '人员管理' },
      '/data-dictionary': { module: '系统配置', page: '数据字典' },
      '/basic-config': { module: '系统配置', page: '基础配置' },
      '/system-logs': { module: '系统监控', page: '系统日志' },
      '/admin-logs': { module: '系统监控', page: '操作日志（系统员）' },
      '/audit-logs': { module: '系统监控', page: '操作日志（审计员）' },
      '/anomaly-alerts': { module: '系统监控', page: '异常行为告警' },
    }
    
    if (path.startsWith('/meetings/') && path !== '/meetings/create') {
      return { module: '会议管理', parent: '会议列表', page: '编辑会议' }
    }
    
    return pathMap[path] || { module: '工作台', page: '仪表板' }
  }
  
  const breadcrumb = getBreadcrumb()
  
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 bg-background p-4 sm:gap-4">
          <SidebarTrigger variant="outline" className="scale-125 sm:scale-100" />
          <Separator orientation="vertical" className="h-6" />
          
          {/* 面包屑导航 */}
          <div className="flex flex-1 items-center justify-between">
            <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>{breadcrumb.module}</span>
              <span>/</span>
              {breadcrumb.parent && (
                <>
                  <span>{breadcrumb.parent}</span>
                  <span>/</span>
                </>
              )}
              <span className="text-foreground">{breadcrumb.page}</span>
            </nav>
            
            {/* 右侧操作区 */}
            <div className="flex items-center gap-2">
              {/* 通知 */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
              </Button>
              
              {/* 主题切换 */}
              <ThemeSwitcher />
              
              {/* 用户菜单 */}
              {user && (
                <div className="flex items-center gap-3 pl-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:block">
                      <div className="text-sm font-medium">{user.username}</div>
                      <div className="text-xs text-muted-foreground">{user.role}</div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <span className="sr-only">退出登录</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" x2="9" y1="12" y2="12" />
                    </svg>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
