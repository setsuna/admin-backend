/**
 * 角色相关钩子
 * 提供角色选项和角色显示名称功能
 */

import { useQuery } from '@tanstack/react-query'
import { permissionApi } from '@/services/permission'

// 角色选项钩子
export function useRoleOptions() {
  const { data: roleOptions = [], isLoading, error } = useQuery({
    queryKey: ['roleOptions'],
    queryFn: () => permissionApi.getRoleOptions(),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  })

  return {
    roleOptions,
    isLoading,
    error
  }
}

// 角色显示名称钩子
export function useRoleDisplayName(roleCode?: string) {
  const getRoleDisplayName = (code: string) => {
    return permissionApi.getRoleDisplayName(code)
  }

  if (!roleCode) {
    return { roleDisplayName: '', getRoleDisplayName }
  }

  return {
    roleDisplayName: getRoleDisplayName(roleCode),
    getRoleDisplayName
  }
}

// 批量获取角色显示名称
export function useBatchRoleDisplayNames(roleCodes: string[]) {
  const getRoleDisplayName = (code: string) => {
    return permissionApi.getRoleDisplayName(code)
  }

  const roleDisplayNames = roleCodes.reduce((acc, code) => {
    acc[code] = getRoleDisplayName(code)
    return acc
  }, {} as Record<string, string>)

  return {
    roleDisplayNames,
    getRoleDisplayName
  }
}
