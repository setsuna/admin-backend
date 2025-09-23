import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/store'
import { permissionApi } from '@/services/permission'
import type { MenuItem } from '@/types'

/**
 * 权限管理Hook
 * 统一管理用户权限和菜单配置
 */
export function usePermission() {
  const {
    user,
    permissions,
    menuConfig,
    setPermissions,
    setMenuConfig,
    hasPermission,
    hasAnyPermission,
    clearAuth
  } = useAuth()

  // 获取用户菜单配置
  const { data: userMenuConfig, isLoading } = useQuery({
    queryKey: ['userMenuConfig', user?.id],
    queryFn: () => user ? permissionApi.getUserMenuConfig(user) : Promise.resolve(null),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  })

  // 更新权限状态
  useEffect(() => {
    if (userMenuConfig) {
      setPermissions(userMenuConfig.userPermissions)
      setMenuConfig(userMenuConfig)
    } else if (!user) {
      clearAuth()
    }
  }, [userMenuConfig, user, setPermissions, setMenuConfig, clearAuth])

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
