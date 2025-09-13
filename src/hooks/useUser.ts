import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService, departmentService } from '@/services'
import { useGlobalStore } from '@/store'
import type { User, UserFilters, CreateUserRequest, UpdateUserRequest } from '@/types'

export interface UseUserOptions {
  initialFilters?: UserFilters
  initialPagination?: { page: number; pageSize: number }
  enableAutoRefresh?: boolean
  autoRefreshInterval?: number
}

export const useUser = (options: UseUserOptions = {}) => {
  const { 
    initialFilters = {},
    initialPagination = { page: 1, pageSize: 20 },
    enableAutoRefresh = false,
    autoRefreshInterval = 30000
  } = options
  
  const { addNotification } = useGlobalStore()
  const queryClient = useQueryClient()
  
  // 状态管理
  const [filters, setFilters] = useState<UserFilters>(initialFilters)
  const [pagination, setPagination] = useState(initialPagination)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  // 查询用户列表
  const userQuery = useQuery({
    queryKey: ['users', filters, pagination],
    queryFn: () => userService.getUsers({ ...filters, ...pagination }),
    refetchInterval: enableAutoRefresh ? autoRefreshInterval : false
  })
  
  // 查询部门选项（用于筛选和表单）
  const departmentOptionsQuery = useQuery({
    queryKey: ['departmentOptions'],
    queryFn: () => departmentService.getDepartmentOptions()
  })
  
  // 查询用户统计
  const userStatsQuery = useQuery({
    queryKey: ['userStats'],
    queryFn: () => userService.getUserStats()
  })
  
  // 刷新相关查询
  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
    queryClient.invalidateQueries({ queryKey: ['userStats'] })
  }
  
  // 创建用户
  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),
    onSuccess: () => {
      addNotification({ type: 'success', title: '创建成功', message: '用户已成功创建' })
      invalidateQueries()
    },
    onError: (error: any) => {
      addNotification({ 
        type: 'error', 
        title: '创建失败', 
        message: error.message || '请稍后重试' 
      })
    }
  })
  
  // 更新用户
  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserRequest) => userService.updateUser(data),
    onSuccess: () => {
      addNotification({ type: 'success', title: '更新成功', message: '用户信息已成功更新' })
      invalidateQueries()
    },
    onError: (error: any) => {
      addNotification({ 
        type: 'error', 
        title: '更新失败', 
        message: error.message || '请稍后重试' 
      })
    }
  })
  
  // 删除用户
  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      addNotification({ type: 'success', title: '删除成功', message: '用户已成功删除' })
      invalidateQueries()
    },
    onError: (error: any) => {
      addNotification({ 
        type: 'error', 
        title: '删除失败', 
        message: error.message || '请稍后重试' 
      })
    }
  })
  
  // 批量删除
  const batchDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => userService.batchDeleteUsers(ids),
    onSuccess: (_, ids) => {
      addNotification({ type: 'success', title: '批量删除成功', message: `已删除 ${ids.length} 个用户` })
      setSelectedIds([])
      invalidateQueries()
    },
    onError: (error: any) => {
      addNotification({ 
        type: 'error', 
        title: '批量删除失败', 
        message: error.message || '请稍后重试' 
      })
    }
  })
  
  // 重置密码
  const resetPasswordMutation = useMutation({
    mutationFn: (id: string) => userService.resetPassword(id),
    onSuccess: () => {
      addNotification({ type: 'success', title: '重置成功', message: '用户密码已重置为默认密码' })
    },
    onError: (error: any) => {
      addNotification({ 
        type: 'error', 
        title: '重置失败', 
        message: error.message || '请稍后重试' 
      })
    }
  })
  
  // 更新用户状态
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' | 'suspended' }) => 
      userService.updateUserStatus(id, status),
    onSuccess: (_, { status }) => {
      const statusMap = { active: '启用', inactive: '禁用', suspended: '停用' }
      addNotification({ 
        type: 'success', 
        title: '状态更新成功', 
        message: `用户已${statusMap[status]}` 
      })
      invalidateQueries()
    },
    onError: (error: any) => {
      addNotification({ 
        type: 'error', 
        title: '状态更新失败', 
        message: error.message || '请稍后重试' 
      })
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
    
    // 操作状态
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBatchDeleting: batchDeleteMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    
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