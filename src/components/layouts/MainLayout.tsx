import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { usePermission } from '@/hooks/usePermission'
import { useWebSocket } from '@/hooks/useWebSocket'
import { Separator } from '@/components/ui/Separator'
import { Bell, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { useAuth, useUI } from '@/store'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import { NotificationPanel } from '@/components/business/notification/NotificationPanel'
import { authService } from '@/services/core/auth.service'
import { soundManager } from '@/utils/sound'
import { useLocation } from 'react-router-dom'
import { getBreadcrumbFromMenu } from '@/utils/breadcrumb'
import { useEffect } from 'react'

export function MainLayout() {
  // 初始化权限数据和 WebSocket
  const { menuConfig } = usePermission()
  const { user, clearAuth } = useAuth()
  const { soundEnabled, toggleSound, unreadCount } = useUI()
  const location = useLocation()
  
  // 初始化 WebSocket 连接
  useWebSocket()
  
  // 同步音效状态到 soundManager
  useEffect(() => {
    soundManager.setEnabled(soundEnabled)
  }, [soundEnabled])
  
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
  
  // 从菜单配置动态生成面包屑
  const breadcrumb = getBreadcrumbFromMenu(location.pathname, menuConfig)
  
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 text-xs rounded-full bg-destructive text-destructive-foreground">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <NotificationPanel />
                </PopoverContent>
              </Popover>
              
              {/* 音效开关 */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSound}
                title={soundEnabled ? '关闭音效' : '开启音效'}
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
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
