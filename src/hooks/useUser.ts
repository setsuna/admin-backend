import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService, departmentService } from '@/services'
import { useNotifications } from '@/hooks/useNotifications'
import type { UserFilters, CreateUserRequest, UpdateUserRequest, UserSecurityLevel } from '@/types'

export interface UseUserOptions {
  initialFilters?: UserFilters
  initialPagination?: { page: number; pageSize: number }
  enableAutoRefresh?: boolean
  autoRefreshInterval?: number
}

/**
 * 用户管理Hook
 * 处理用户的增删改查和相关业务逻辑
 * 注意：状态管理边界明确，只管理服务端数据同步，不涉及全局状态
 */
export const useUser = (options: UseUserOptions = {}) => {
  const { 
    initialFilters = {},
    initialPagination = { page: 1, pageSize: 20 },
    enableAutoRefresh = false,
    autoRefreshInterval = 30000
  } = options
  
  const { showSuccess, showError } = useNotifications()
  const queryClient = useQueryClient()
  
  // 本地状态管理 - 这些状态不需要全局共享
  const [filters, setFilters] = useState<UserFilters>(initialFilters)
  const [pagination, setPagination] = useState(initialPagination)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  // 服务端状态查询 - 使用TanStack Query管理
  const userQuery = useQuery({
    queryKey: ['users', filters, pagination],
    queryFn: () => userService.getUsers({ ...filters, ...pagination }),
    refetchInterval: enableAutoRefresh ? autoRefreshInterval : false
  })
  
  const departmentOptionsQuery = useQuery({
    queryKey: ['departmentOptions'],
    queryFn: () => departmentService.getDepartmentOptions(),
    staleTime: 10 * 60 * 1000, // 10分钟缓存
  })
  
  const userStatsQuery = useQuery({
    queryKey: ['userStats'],
    queryFn: () => userService.getUserStats(),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  })
  
  // 缓存失效函数
  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
    queryClient.invalidateQueries({ queryKey: ['userStats'] })
  }
  
  // 创建用户
  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),
    onSuccess: () => {
      showSuccess('创建成功', '用户已成功创建')
      invalidateQueries()
    },
    onError: (error: any) => {
      showError('创建失败', error.message || '请稍后重试')
    }
  })
  
  // 更新用户
  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserRequest) => userService.updateUser(data),
    onSuccess: () => {
      showSuccess('更新成功', '用户信息已成功更新')
      invalidateQueries()
    },
    onError: (error: any) => {
      showError('更新失败', error.message || '请稍后重试')
    }
  })
  
  // 删除用户
  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      showSuccess('删除成功', '用户已成功删除')
      invalidateQueries()
    },
    onError: (error: any) => {
      showError('删除失败', error.message || '请稍后重试')
    }
  })
  
  // 批量删除
  const batchDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => userService.batchDeleteUsers(ids),
    onSuccess: (_, ids) => {
      showSuccess('批量删除成功', `已删除 ${ids.length} 个用户`)
      setSelectedIds([])
      invalidateQueries()
    },
    onError: (error: any) => {
      showError('批量删除失败', error.message || '请稍后重试')
    }
  })
  
  // 重置密码
  const resetPasswordMutation = useMutation({
    mutationFn: (id: string) => userService.resetPassword(id),
    onSuccess: () => {
      showSuccess('重置成功', '用户密码已重置为默认密码')
    },
    onError: (error: any) => {
      showError('重置失败', error.message || '请稍后重试')
    }
  })
  
  // 更新用户状态
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' | 'suspended' }) => 
      userService.updateUserStatus(id, status),
    onSuccess: (_, { status }) => {
      const statusMap = { active: '启用', inactive: '禁用', suspended: '停用' }
      showSuccess('状态更新成功', `用户已${statusMap[status]}`)
      invalidateQueries()
    },
    onError: (error: any) => {
      showError('状态更新失败', error.message || '请稍后重试')
    }
  })
  
  // 更新用户密级
  const updateSecurityLevelMutation = useMutation({
    mutationFn: ({ id, securityLevel }: { id: string; securityLevel: UserSecurityLevel }) => 
      userService.updateUserSecurityLevel(id, securityLevel),
    onSuccess: (_, { securityLevel }) => {
      const levelMap = { unknown: '未知', internal: '内部', confidential: '机密', secret: '绝密' }
      showSuccess('密级更新成功', `用户密级已调整为 ${levelMap[securityLevel]}`)
      invalidateQueries()
    },
    onError: (error: any) => {
      showError('密级更新失败', error.message || '请稍后重试')
    }
  })
  
  // 批量更新用户密级
  const batchUpdateSecurityLevelMutation = useMutation({
    mutationFn: ({ ids, securityLevel }: { ids: string[]; securityLevel: UserSecurityLevel }) => 
      userService.batchUpdateSecurityLevel(ids, securityLevel),
    onSuccess: (_, { ids, securityLevel }) => {
      const levelMap = { unknown: '未知', internal: '内部', confidential: '机密', secret: '绝密' }
      showSuccess('批量密级更新成功', `已将 ${ids.length} 个用户的密级调整为 ${levelMap[securityLevel]}`)
      setSelectedIds([])
      invalidateQueries()
    },
    onError: (error: any) => {
      showError('批量密级更新失败', error.message || '请稍后重试')
    }
  })
  
  // 工具函数
  const resetFilters = () => {
    setFilters(initialFilters)
    setPagination(initialPagination)
  }
  
  const refreshData = () => {
    userQuery.refetch()
  }
  
  const toggleSelectAll = () => {
    const allIds = userQuery.data?.data.items.map(user => user.id) || []
    setSelectedIds(selectedIds.length === allIds.length ? [] : allIds)
  }
  
  const toggleSelectId = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    )
  }
  
  const isAllSelected = () => {
    const allIds = userQuery.data?.data.items.map(user => user.id) || []
    return allIds.length > 0 && selectedIds.length === allIds.length
  }
  
  const isIndeterminate = () => {
    const allIds = userQuery.data?.data.items.map(user => user.id) || []
    return selectedIds.length > 0 && selectedIds.length < allIds.length
  }
  
  // 根据角色获取权限选项
  const getPermissionsByRole = (role: string): string[] => {
    const rolePermissions: Record<string, string[]> = {
      admin: ['user:manage', 'org:manage', 'system:manage', 'meeting:manage', 'dashboard:view'],
      meeting_admin: ['meeting:manage', 'meeting:create', 'dashboard:view'],
      auditor: ['audit:view', 'report:view', 'dashboard:view'],
      user: ['meeting:view', 'dashboard:view']
    }
    return rolePermissions[role] || []
  }
  
  return {
    // 数据
    users: userQuery.data?.data.items || [],
    departmentOptions: departmentOptionsQuery.data?.data || [],
    userStats: userStatsQuery.data?.data,
    pagination: userQuery.data?.data.pagination,
    
    // 状态
    filters,
    selectedIds,
    isLoading: userQuery.isLoading,
    error: userQuery.error,
    
    // 状态更新
    setFilters,
    setPagination,
    setSelectedIds,
    
    // 操作
    createUser: createMutation.mutate,
    updateUser: updateMutation.mutate,
    deleteUser: deleteMutation.mutate,
    batchDeleteUsers: batchDeleteMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    updateUserStatus: updateStatusMutation.mutate,
    updateUserSecurityLevel: updateSecurityLevelMutation.mutate,
    batchUpdateSecurityLevel: batchUpdateSecurityLevelMutation.mutate,
    
    // 操作状态
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBatchDeleting: batchDeleteMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isUpdatingSecurityLevel: updateSecurityLevelMutation.isPending,
    isBatchUpdatingSecurityLevel: batchUpdateSecurityLevelMutation.isPending,
    
    // 工具函数
    resetFilters,
    refreshData,
    invalidateQueries,
    toggleSelectAll,
    toggleSelectId,
    isAllSelected,
    isIndeterminate,
    getPermissionsByRole
  }
}

export default useUser
