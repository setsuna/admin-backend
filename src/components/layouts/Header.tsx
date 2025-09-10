import React from 'react'
import { Bell, User, LogOut } from 'lucide-react'
import { cn } from '@/utils'
import { useGlobalStore } from '@/store'
import { Button } from '@/components/ui'
import { ThemeSwitcher } from '@/components'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { user, setUser } = useGlobalStore()
  
  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    window.location.href = '/login'
  }
  
  return (
    <header className={cn(
      'flex h-16 items-center justify-between border-b bg-background px-6',
      className
    )}>
      {/* 面包屑导航 */}
      <div className="flex items-center gap-2">
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
          <span>管理后台</span>
          <span>/</span>
          <span className="text-foreground">仪表板</span>
        </nav>
      </div>
      
      {/* 右侧操作区 */}
      <div className="flex items-center gap-2">
        {/* 通知 */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
        </Button>
        
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
