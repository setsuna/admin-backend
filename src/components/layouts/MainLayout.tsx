import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/Separator'
import { Button } from '@/components/ui/Button'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { SoundToggle } from './SoundToggle'
import { SoundEffectManager } from './SoundEffectManager'
import { PermissionInitializer } from './PermissionInitializer'
import { WebSocketInitializer } from './WebSocketInitializer'
import { useStore } from '@/store'
import { authService } from '@/services/core/auth.service'
import { useLocation } from 'react-router-dom'
import { getBreadcrumbFromMenu } from '@/utils/breadcrumb'
import { useMemo, useCallback, memo } from 'react'
import { shallow } from 'zustand/shallow'

// ✅ 将选择器提取到组件外部，避免每次渲染创建新函数
const selectMainLayoutState = (state: any) => ({
  menuConfig: state.menuConfig,
  user: state.user,
  clearAuth: state.clearAuth,
})

// ✅ 使用 React.memo 包装，阻止父组件重渲染导致的不必要重渲染
export const MainLayout = memo(function MainLayout() {
  // ✅ 使用单个选择器 + shallow 比较
  const { menuConfig, user, clearAuth } = useStore(selectMainLayoutState, shallow)
  const location = useLocation()
  
  // ✅ 移除 useWSConnection 调用，改用独立组件
  
  const handleLogout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.warn('Logout API error:', error)
    } finally {
      clearAuth()
      window.location.href = '/login'
    }
  }, [clearAuth])
  
  // 从菜单配置动态生成面包屑 - 使用 useMemo 缓存结果
  const breadcrumb = useMemo(() => 
    getBreadcrumbFromMenu(location.pathname, menuConfig)
  , [location.pathname, menuConfig])
  
  return (
    <SidebarProvider defaultOpen>
      {/* 音效管理器 - 负责同步状态到 soundManager */}
      <SoundEffectManager />
      
      {/* 权限初始化器 - 负责加载和设置权限配置 */}
      <PermissionInitializer />
      
      {/* WebSocket 初始化器 - 负责初始化 WebSocket 连接 */}
      <WebSocketInitializer />
      
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
              {/* 音效开关 - 使用独立组件，避免父组件重渲染 */}
              <SoundToggle />
              
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
})  // ✅ memo 的闭合
