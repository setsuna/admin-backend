import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  BarChart3,
  Calendar,
  User,
  Users,
  RefreshCw,
  Shield,
  Lock,
  Building,
  UserCheck,
  Book,
  Settings,
  FileText,
  ScrollText,
  Search,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Server
} from 'lucide-react'
import { cn } from '@/utils'
import { useGlobalStore } from '@/store'
import { useMenuPermission } from '@/hooks'
import { Button } from '@/components/ui'

interface SidebarProps {
  className?: string
}

// 图标映射
const iconMap: Record<string, any> = {
  BarChart3,
  Calendar,
  User,
  Users,
  RefreshCw,
  Shield,
  Lock,
  Building,
  UserCheck,
  Book,
  Settings,
  FileText,
  ScrollText,
  Search,
  AlertTriangle,
}

// 获取图标组件
function getIconComponent(iconName?: string) {
  if (!iconName) return null
  return iconMap[iconName] || null
}

export function Sidebar({ className }: SidebarProps) {
  const { sidebarCollapsed, setSidebarCollapsed } = useGlobalStore()
  const { menus: menuItems, isLoading } = useMenuPermission()
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['workspace', 'meeting', 'sync', 'personnel', 'organization', 'system', 'monitoring'])
  
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupKey)
        ? prev.filter(key => key !== groupKey)
        : [...prev, groupKey]
    )
  }
  
  return (
    <aside className={cn(
      'flex h-full flex-col border-r bg-background transition-all duration-300',
      sidebarCollapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Logo区域 */}
      <div className="flex h-16 items-center justify-between border-b px-4 min-h-16">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Server className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold leading-none">Admin</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            'h-8 w-8 flex-shrink-0',
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
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="text-sm text-muted-foreground">加载中...</div>
          </div>
        ) : sidebarCollapsed ? (
          // 折叠状态：显示所有菜单项（包括分组中的子项）
          <>
            {menuItems.map((item) => {
              if (item.type === 'group' && item.children) {
                // 对于分组，显示其所有子项
                return item.children.map((child) => {
                  const Icon = getIconComponent(child.icon as string)
                  if (!Icon || !child.path) return null
                  return (
                    <NavLink
                      key={child.key}
                      to={child.path}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center justify-center rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                          isActive 
                            ? 'bg-accent text-accent-foreground' 
                            : 'text-muted-foreground'
                        )
                      }
                      title={child.label}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                    </NavLink>
                  )
                })
              } else if (item.icon && item.path) {
                // 普通菜单项
                const Icon = getIconComponent(item.icon as string)
                if (!Icon) return null
                return (
                  <NavLink
                    key={item.key}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-center rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                        isActive 
                          ? 'bg-accent text-accent-foreground' 
                          : 'text-muted-foreground'
                      )
                    }
                    title={item.label}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                  </NavLink>
                )
              }
              return null
            })}
          </>
        ) : (
          // 展开状态：显示分组结构
          <>
            {menuItems.map((item) => {
              if (item.type === 'group') {
                const isExpanded = expandedGroups.includes(item.key)
                return (
                  <div key={item.key} className="space-y-1">
                    {/* 分组标题 */}
                    <button
                      onClick={() => toggleGroup(item.key)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span className="flex-1 text-left">{item.label}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                    
                    {/* 分组子项 */}
                    {isExpanded && item.children && (
                      <div className="ml-2 space-y-1">
                        {item.children.map((child) => {
                          const Icon = getIconComponent(child.icon as string)
                          if (!Icon || !child.path) return null
                          return (
                            <NavLink
                              key={child.key}
                              to={child.path}
                              className={({ isActive }) =>
                                cn(
                                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                                  isActive 
                                    ? 'bg-accent text-accent-foreground' 
                                    : 'text-muted-foreground'
                                )
                              }
                            >
                              <Icon className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{child.label}</span>
                            </NavLink>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              } else {
                // 普通菜单项
                const Icon = getIconComponent(item.icon as string)
                if (!Icon || !item.path) return null
                return (
                  <NavLink
                    key={item.key}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                        isActive 
                          ? 'bg-accent text-accent-foreground' 
                          : 'text-muted-foreground'
                      )
                    }
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                )
              }
            })}
          </>
        )}
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
