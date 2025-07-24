import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Server, 
  Settings, 
  FileText, 
  Users, 
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/utils'
import { useGlobalStore } from '@/store'
import { Button } from '@/components/ui'

interface SidebarProps {
  className?: string
}

const menuItems = [
  {
    key: 'dashboard',
    label: '仪表板',
    icon: Home,
    path: '/',
  },
  {
    key: 'devices',
    label: '设备管理',
    icon: Server,
    path: '/devices',
  },
  {
    key: 'configs',
    label: '配置管理',
    icon: FileText,
    path: '/configs',
  },
  {
    key: 'users',
    label: '用户管理',
    icon: Users,
    path: '/users',
  },
  {
    key: 'analytics',
    label: '数据分析',
    icon: BarChart3,
    path: '/analytics',
  },
  {
    key: 'settings',
    label: '系统设置',
    icon: Settings,
    path: '/settings',
  },
]

export function Sidebar({ className }: SidebarProps) {
  const { sidebarCollapsed, setSidebarCollapsed } = useGlobalStore()
  
  return (
    <aside className={cn(
      'flex h-full flex-col border-r bg-background transition-all duration-300',
      sidebarCollapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Logo区域 */}
      <div className="flex h-16 items-center border-b px-4">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Server className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold">Admin</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            'h-8 w-8',
            sidebarCollapsed ? 'mx-auto' : 'ml-auto'
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {/* 导航菜单 */}
      <nav className="flex-1 space-y-1 p-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive 
                    ? 'bg-accent text-accent-foreground' 
                    : 'text-muted-foreground',
                  sidebarCollapsed && 'justify-center px-2'
                )
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </NavLink>
          )
        })}
      </nav>
      
      {/* 底部信息 */}
      {!sidebarCollapsed && (
        <div className="border-t p-4">
          <div className="text-xs text-muted-foreground">
            版本 v1.0.0
          </div>
        </div>
      )}
    </aside>
  )
}
