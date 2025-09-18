import { api } from './api'
import { mockUserService } from './mock/userData'
import { envConfig } from '@/config/env.config'
import type { 
  User, 
  UserFilters, 
  CreateUserRequest, 
  UpdateUserRequest,
  PaginatedResponse,
  ApiResponse,
  UserSecurityLevel 
} from '@/types'

// 统一使用 envConfig 判断是否使用Mock数据
const shouldUseMock = () => {
  return envConfig.ENABLE_MOCK
}

export const userService = {
  // 获取用户列表（分页）
  async getUsers(filters?: UserFilters & { page?: number; pageSize?: number }) {
    if (shouldUseMock()) {
      console.log('👥 User API: Using Mock Service')
      return mockUserService.getUsers(filters, filters?.page, filters?.pageSize)
    }
    
    console.log('🌐 User API: Using Real API Service')
    
    const params = new URLSearchParams()
    
    if (filters?.keyword) params.append('keyword', filters.keyword)
    if (filters?.department) params.append('department', filters.department)
    if (filters?.role) params.append('role', filters.role)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.securityLevel) params.append('securityLevel', filters.securityLevel)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString())

    const response = await api.get<ApiResponse<PaginatedResponse<User>>>(`/users?${params}`)
    return response.data
  },

  // 获取单个用户详情
  async getUser(id: string) {
    if (shouldUseMock()) {
      return mockUserService.getUser(id)
    }
    
    const response = await api.get<ApiResponse<User>>(`/users/${id}`)
    return response.data
  },

  // 创建用户
  async createUser(data: CreateUserRequest) {
    if (shouldUseMock()) {
      return mockUserService.createUser(data)
    }
    
    const response = await api.post<ApiResponse<User>>('/users', data)
    return response.data
  },

  // 更新用户
  async updateUser(data: UpdateUserRequest) {
    if (shouldUseMock()) {
      return mockUserService.updateUser(data)
    }
    
    const { id, ...updateData } = data
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, updateData)
    return response.data
  },

  // 删除用户
  async deleteUser(id: string) {
    if (shouldUseMock()) {
      return mockUserService.deleteUser(id)
    }
    
    const response = await api.delete<ApiResponse<void>>(`/users/${id}`)
    return response.data
  },

  // 批量删除用户
  async batchDeleteUsers(ids: string[]) {
    if (shouldUseMock()) {
      return mockUserService.batchDeleteUsers(ids)
    }
    
    const response = await api.delete<ApiResponse<void>>('/users/batch', { data: { ids } })
    return response.data
  },

  // 重置密码
  async resetPassword(id: string) {
    if (shouldUseMock()) {
      return mockUserService.resetPassword(id)
    }
    
    const response = await api.post<ApiResponse<void>>(`/users/${id}/reset-password`)
    return response.data
  },

  // 更新用户状态
  async updateUserStatus(id: string, status: 'active' | 'inactive' | 'suspended') {
    if (shouldUseMock()) {
      return mockUserService.updateUserStatus(id, status)
    }
    
    const response = await api.put<ApiResponse<User>>(`/users/${id}/status`, { status })
    return response.data
  },

  // 验证用户名是否可用
  async checkUsername(username: string, excludeId?: string) {
    if (shouldUseMock()) {
      return { code: 200, message: 'success', data: { available: true } }
    }
    
    const params = new URLSearchParams({ username })
    if (excludeId) params.append('excludeId', excludeId)
    
    const response = await api.get<ApiResponse<{ available: boolean }>>(`/users/check-username?${params}`)
    return response.data
  },

  // 验证邮箱是否可用
  async checkEmail(email: string, excludeId?: string) {
    if (shouldUseMock()) {
      return { code: 200, message: 'success', data: { available: true } }
    }
    
    const params = new URLSearchParams({ email })
    if (excludeId) params.append('excludeId', excludeId)
    
    const response = await api.get<ApiResponse<{ available: boolean }>>(`/users/check-email?${params}`)
    return response.data
  },

  // 获取用户统计信息
  async getUserStats() {
    if (shouldUseMock()) {
      return mockUserService.getUserStats()
    }
    
    const response = await api.get<ApiResponse<{
      total: number
      active: number
      inactive: number
      suspended: number
      byRole: Record<string, number>
      bySecurityLevel: Record<string, number>
    }>>('/users/stats')
    return response.data
  },

  // 更新用户密级
  async updateUserSecurityLevel(id: string, securityLevel: UserSecurityLevel) {
    if (shouldUseMock()) {
      return mockUserService.updateUserSecurityLevel(id, securityLevel)
    }
    
    const response = await api.put<ApiResponse<User>>(`/users/${id}/security-level`, { securityLevel })
    return response.data
  },

  // 批量更新用户密级
  async batchUpdateSecurityLevel(ids: string[], securityLevel: UserSecurityLevel) {
    if (shouldUseMock()) {
      return mockUserService.batchUpdateSecurityLevel(ids, securityLevel)
    }
    
    const response = await api.put<ApiResponse<void>>('/users/batch/security-level', { ids, securityLevel })
    return response.data
  },

  // 获取密级变更历史（可选）
  async getSecurityLevelHistory(userId: string) {
    if (shouldUseMock()) {
      return mockUserService.getSecurityLevelHistory(userId)
    }
    
    const response = await api.get<ApiResponse<Array<{
      id: string
      userId: string
      oldLevel: UserSecurityLevel
      newLevel: UserSecurityLevel
      updatedBy: string
      updatedByName: string
      updatedAt: string
      reason?: string
    }>>>(`/users/${userId}/security-level-history`)
    return response.data
  }
}
