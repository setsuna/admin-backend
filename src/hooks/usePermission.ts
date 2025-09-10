import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useGlobalStore, usePermissionStore } from '@/store'
import { permissionApi } from '@/services/permission'
import type { MenuItem } from '@/types'

// 权限钩子
export function usePermission() {
  const { user } = useGlobalStore()
  const {
    permissions,
    menuConfig,
    setPermissions,
    setMenuConfig,
    hasPermission,
    hasAnyPermission,
    clearPermissions
  } = usePermissionStore()

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
      clearPermissions()
    }
  }, [userMenuConfig, user, setPermissions, setMenuConfig, clearPermissions])

  return {
    permissions,
    menuConfig,
    isLoading,
    hasPermission,
    hasAnyPermission
  }
}

// 菜单权限钩子
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

// 路由权限钩子
export function useRoutePermission(requiredPermissions: string[] = []) {
  const { hasAnyPermission, isLoading } = usePermission()
  
  const hasAccess = requiredPermissions.length === 0 || hasAnyPermission(requiredPermissions)
  
  return {
    hasAccess,
    isLoading
  }
}
