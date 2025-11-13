import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useStore } from '@/store'
import { permissionApi } from '@/services/permission'

/**
 * 权限初始化组件
 * 负责在用户登录后初始化权限和菜单配置
 * 不渲染任何UI，只处理权限初始化逻辑
 */
export function PermissionInitializer() {
  const user = useStore((state) => state.user)
  const setPermissions = useStore((state) => state.setPermissions)
  const setMenuConfig = useStore((state) => state.setMenuConfig)
  const clearAuth = useStore((state) => state.clearAuth)

  // 获取用户菜单配置
  const { data: userMenuConfig, isSuccess } = useQuery({
    queryKey: ['userMenuConfig', user?.id],
    queryFn: () => user ? permissionApi.getUserMenuConfig(user) : Promise.resolve(null),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  })

  // 更新权限状态
  useEffect(() => {
    if (userMenuConfig && isSuccess) {
      const userPerms = userMenuConfig.userPermissions || []
      
      // ✅ 只有当配置真的改变时才更新
      const currentPerms = useStore.getState().permissions
      const currentMenuConfig = useStore.getState().menuConfig
      
      // 简单的深度对比（适用于大多数场景）
      const permsChanged = JSON.stringify(currentPerms) !== JSON.stringify(userPerms)
      const configChanged = JSON.stringify(currentMenuConfig) !== JSON.stringify(userMenuConfig)
      
      if (permsChanged) {
        setPermissions(userPerms)
      }
      
      if (configChanged) {
        setMenuConfig(userMenuConfig)
      }
    } else if (!user) {
      clearAuth()
    }
  }, [userMenuConfig, user, isSuccess, setPermissions, setMenuConfig, clearAuth])

  return null
}
