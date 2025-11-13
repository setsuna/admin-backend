import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useStore } from '@/store'
import { permissionApi } from '@/services/permission'
import type { MenuItem } from '@/types'

/**
 * 权限管理Hook
 * 统一管理用户权限和菜单配置
 */
export function usePermission() {
  // ✅ 直接使用 useStore 选择器，避免 useAuth() 返回新对象导致重渲染
  const user = useStore((state) => state.user)
  const permissions = useStore((state) => state.permissions)
  const menuConfig = useStore((state) => state.menuConfig)
  const setPermissions = useStore((state) => state.setPermissions)
  const setMenuConfig = useStore((state) => state.setMenuConfig)
  const hasPermission = useStore((state) => state.hasPermission)
  const hasAnyPermission = useStore((state) => state.hasAnyPermission)
  const clearAuth = useStore((state) => state.clearAuth)

  // 获取用户菜单配置
  const { data: userMenuConfig, isLoading, isSuccess } = useQuery({
    queryKey: ['userMenuConfig', user?.id],
    queryFn: () => user ? permissionApi.getUserMenuConfig(user) : Promise.resolve(null),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  })

  // 更新权限状态
  useEffect(() => {
    if (userMenuConfig && isSuccess) {
      // 🔧 修复：从 userMenuConfig 中提取 userPermissions 字段
      const userPerms = userMenuConfig.userPermissions || []
      setPermissions(userPerms)
      setMenuConfig(userMenuConfig)
    } else if (!user) {
      clearAuth()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userMenuConfig, user, isSuccess])

  return {
    permissions,
    menuConfig,
    isLoading,
    hasPermission,
    hasAnyPermission
  }
}

/**
 * 菜单权限Hook
 * 获取用户可见的菜单项
 */
export function useMenuPermission() {
  const { menuConfig, isLoading } = usePermission()
  
  const getVisibleMenus = (): MenuItem[] => {
    return menuConfig?.menus || []
  }

  return {
    menus: getVisibleMenus(),
    isLoading
  }
}

/**
 * 路由权限Hook
 * 检查用户是否有访问特定路由的权限
 */
export function useRoutePermission(requiredPermissions: string[] = []) {
  const { hasAnyPermission, isLoading } = usePermission()
  
  const hasAccess = requiredPermissions.length === 0 || hasAnyPermission(requiredPermissions)
  
  return {
    hasAccess,
    isLoading
  }
}
