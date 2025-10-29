import {
  ChevronRight,
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
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { useMenuPermission } from '@/hooks/usePermission'
import { usePolicy } from '@/hooks/usePolicy'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/Collapsible'
import { cn } from '@/utils'

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
function getIconComponent(
  iconName?: string | React.ReactNode
): React.ComponentType<any> | null {
  if (!iconName) return null

  // 如果已经是React组件，直接返回
  if (typeof iconName !== 'string') {
    return null
  }

  // 如果是字符串，查找对应的图标组件
  const IconComponent = iconMap[iconName]
  return IconComponent || null
}

// Logo 组件
function AppLogo() {
  const { policy } = usePolicy()
  const { state } = useSidebar()

  // 密级文本映射
  const securityLevelText: Record<string, string> = {
    confidential: '秘密级',
    secret: '机密级',
  }

  // 获取密级标识
  const getSecurityLevelBadge = () => {
    if (!policy?.systemSecurityLevel) return null
    const levelText = securityLevelText[policy.systemSecurityLevel]
    return levelText ? `${levelText}` : null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-1 px-2 py-2">
          <img src="/logo.svg" alt="Logo" className="size-8" />
          {state === 'expanded' && (
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                会议文档综合管控系统
              </span>
              {getSecurityLevelBadge() && (
                <span className="truncate text-xs text-sidebar-foreground/70">
                  {getSecurityLevelBadge()}
                </span>
              )}
            </div>
          )}
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

// 菜单组
function NavGroup({
  label,
  children,
  defaultOpen = true,
}: {
  label: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const { state } = useSidebar()

  if (state === 'collapsed') {
    return <>{children}</>
  }

  return (
    <Collapsible defaultOpen={defaultOpen} className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="w-full">
            {label}
            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>{children}</SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}

// 主 Sidebar 组件
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { menus: menuItems, isLoading } = useMenuPermission()
  const { state } = useSidebar()

  if (isLoading) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarContent>
          <div className="flex items-center justify-center py-4">
            <div className="text-sm text-muted-foreground">加载中...</div>
          </div>
        </SidebarContent>
      </Sidebar>
    )
  }

  // 将菜单项按分组整理
  const groupedMenus = menuItems.reduce(
    (acc, item) => {
      if (item.type === 'group' && item.children) {
        acc.groups.push(item)
      } else if (item.path) {
        acc.standalone.push(item)
      }
      return acc
    },
    { groups: [] as any[], standalone: [] as any[] }
  )

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>

      <SidebarContent>
        {/* 独立菜单项 */}
        {groupedMenus.standalone.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {groupedMenus.standalone.map((item) => {
                  const IconComponent = getIconComponent(item.icon)
                  if (!IconComponent) return null

                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        asChild
                        tooltip={state === 'collapsed' ? item.label : undefined}
                      >
                        <NavLink
                          to={item.path!}
                          className={({ isActive }) =>
                            cn(isActive && 'font-medium')
                          }
                        >
                          <IconComponent className="h-4 w-4" />
                          <span>{item.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* 分组菜单 */}
        {groupedMenus.groups.map((group) => (
          <NavGroup key={group.key} label={group.label} defaultOpen>
            <SidebarMenu>
              {group.children?.map((item: any) => {
                const IconComponent = getIconComponent(item.icon)
                if (!IconComponent) return null

                // 如果有子菜单
                if (item.children && item.children.length > 0) {
                  return (
                    <Collapsible
                      key={item.key}
                      defaultOpen={false}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={
                              state === 'collapsed' ? item.label : undefined
                            }
                          >
                            <IconComponent className="h-4 w-4" />
                            <span>{item.label}</span>
                            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((subItem: any) => (
                              <SidebarMenuSubItem key={subItem.key}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={
                                    window.location.pathname === subItem.path
                                  }
                                >
                                  <NavLink to={subItem.path}>
                                    <span>{subItem.label}</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }

                // 普通菜单项
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      asChild
                      tooltip={state === 'collapsed' ? item.label : undefined}
                      isActive={window.location.pathname === item.path}
                    >
                      <NavLink to={item.path!}>
                        <IconComponent className="h-4 w-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </NavGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-1 text-xs text-muted-foreground">
          {state === 'expanded' ? '版本 v1.0.0' : 'v1.0'}
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
