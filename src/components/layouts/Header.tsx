import { Bell, LogOut } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { cn } from '@/utils'
import { useAuth, useStore } from '@/store'
import { Button } from '@/components/ui/Button'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/Popover'
import { NotificationPanel } from '@/components/business/notification/NotificationPanel'
import { authService } from '@/services/core/auth.service'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { user, clearAuth } = useAuth()
  // 只订阅 unreadCount，避免不必要的重新渲染
  const unreadCount = useStore((state) => state.unreadCount)
  const location = useLocation()
  
  const handleLogout = async () => {
    try {
      // 🔧 调用认证服务清理 token 和 localStorage
      await authService.logout()
    } catch (error) {
      console.warn('Logout API error:', error)
    } finally {
      // 🔧 清理 store 状态
      clearAuth()
      // 跳转到登录页
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
      '/admin-logs': { module: '系统监控', page: '操作日志（安全管理员员）' },
      '/audit-logs': { module: '系统监控', page: '操作日志（审计员）' },
      '/anomaly-alerts': { module: '系统监控', page: '异常行为告警' },
    }
    
    // 处理动态路由（如编辑页面）
    if (path.startsWith('/meetings/') && path !== '/meetings/create') {
      // 会议编辑页面：/meetings/:id
      return { module: '会议管理', parent: '会议列表', page: '编辑会议' }
    }
    
    return pathMap[path] || { module: '工作台', page: '仪表板' }
  }
  
  return (
    <header className={cn(
      'flex h-16 items-center justify-between border-b bg-background px-6 min-h-16',
      className
    )}>
      {/* 面包屑导航 */}
      <div className="flex items-center gap-2">
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
          <span>{getBreadcrumb().module}</span>
          <span>/</span>
          {getBreadcrumb().parent && (
            <>
              <span>{getBreadcrumb().parent}</span>
              <span>/</span>
            </>
          )}
          <span className="text-foreground">{getBreadcrumb().page}</span>
        </nav>
      </div>
      
      {/* 右侧操作区 */}
      <div className="flex items-center gap-2">
        {/* 通知 */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-80" align="end">
            <NotificationPanel />
          </PopoverContent>
        </Popover>
        
        {/* 主题切换 */}
        <ThemeSwitcher />
        
        {/* 用户菜单 */}
        <div className="flex items-center gap-3 pl-2">
          {user && (
            <>
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
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
