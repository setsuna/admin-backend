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

  // 🔧 修复：获取用户菜单配置 - 增强认证检查
  const { data: userMenuConfig, isLoading } = useQuery({
    queryKey: ['userMenuConfig', user?.id],
    queryFn: async () => {
      if (!user) return null
      
      // 检查是否有有效的token
      const token = localStorage.getItem('access_token')
      if (!token) {
        console.log('[usePermission] 无有效token，跳过菜单加载')
        return null
      }
      
      try {
        return await permissionApi.getUserMenuConfig(user)
      } catch (error: any) {
        console.error('[usePermission] 加载菜单配置失败:', error)
        // 如果是认证错误，不再重试
        if (error.code === 1101 || error.httpStatus === 401) {
          console.log('[usePermission] 认证失败，停止加载菜单')
          return null
        }
        throw error
      }
    },
    enabled: !!user && !!localStorage.getItem('access_token'), // 同时检查user和token
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    retry: false, // 禁用重试，避免循环
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
