/**
 * 用户管理API服务
 */

import { httpClient } from '@/services/core/http.client'
import { API_PATHS } from '@/config/api.config'
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  PaginatedResponse,
  OperationResult,
  Permission,
  Role,
  MenuConfig,
  MenuItem
} from '@/types'

// 角色相关请求类型
export interface CreateRoleRequest {
  name: string
  code: string
  permissions: string[]
  description?: string
}

export interface UpdateRoleRequest extends Partial<CreateRoleRequest> {
  id: string
}

// 重置密码响应类型
export interface ResetPasswordResponse {
  tempPassword: string
  expiresIn: number
  requireChange: boolean
}

export class UserApiService {
  private basePath = API_PATHS.USERS

  /**
   * 获取用户列表
   */
  async getUsers(
    filters: UserFilters = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<User>> {
    const response = await httpClient.get<PaginatedResponse<User>>(this.basePath, {
      ...filters,
      page,
      pageSize
    })
    return response.data
  }

  /**
   * 获取单个用户详情
   */
  async getUser(id: string): Promise<User> {
    const response = await httpClient.get<User>(`${this.basePath}/${id}`)
    return response.data
  }

  /**
   * 创建用户
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await httpClient.post<User>(this.basePath, data)
    return response.data
  }

  /**
   * 更新用户
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await httpClient.put<User>(`${this.basePath}/${id}`, data)
    return response.data
  }

  /**
   * 删除用户
   */
  async deleteUser(id: string): Promise<OperationResult> {
    const response = await httpClient.delete<OperationResult>(`${this.basePath}/${id}`)
    return response.data
  }

  /**
   * 批量删除用户
   */
  async deleteUsers(ids: string[]): Promise<{ successCount: number; failedCount: number }> {
    const response = await httpClient.post<{ successCount: number; failedCount: number }>(
      `${this.basePath}/batch-delete`,
      { ids }
    )
    return response.data
  }

  /**
   * 重置用户密码
   */
  async resetUserPassword(id: string): Promise<ResetPasswordResponse> {
    const response = await httpClient.post<ResetPasswordResponse>(`${this.basePath}/${id}/reset-password`)
    return response.data
  }

  /**
   * 更新用户状态
   */
  async updateUserStatus(id: string, status: 'active' | 'inactive'): Promise<OperationResult> {
    const response = await httpClient.patch<OperationResult>(`${this.basePath}/${id}/status`, { status })
    return response.data
  }

  /**
   * 获取用户安全等级选项
   */
  async getUserSecurityLevels(): Promise<string[]> {
    const response = await httpClient.get<string[]>(`${this.basePath}/security-levels`)
    return response.data
  }

  /**
   * 搜索用户
   */
  async searchUsers(keyword: string, limit: number = 10): Promise<User[]> {
    const response = await httpClient.get<User[]>(`${this.basePath}/search`, {
      keyword,
      limit
    })
    return response.data
  }
}

export class PermissionApiService {
  private basePath = API_PATHS.PERMISSIONS
  private rolePath = API_PATHS.ROLES

  /**
   * 获取所有权限
   */
  async getAllPermissions(): Promise<Permission[]> {
    const response = await httpClient.get<Permission[]>(this.basePath)
    return response.data
  }

  /**
   * 获取权限分组
   */
  async getPermissionGroups(): Promise<Record<string, Permission[]>> {
    const response = await httpClient.get<Record<string, Permission[]>>(`${this.basePath}/groups`)
    return response.data
  }

  /**
   * 获取所有角色
   */
  async getAllRoles(): Promise<Role[]> {
    const response = await httpClient.get<Role[]>(this.rolePath)
    return response.data
  }

  /**
   * 获取单个角色详情
   */
  async getRole(id: string): Promise<Role> {
    const response = await httpClient.get<Role>(`${this.rolePath}/${id}`)
    return response.data
  }

  /**
   * 创建角色
   */
  async createRole(data: CreateRoleRequest): Promise<Role> {
    const response = await httpClient.post<Role>(this.rolePath, data)
    return response.data
  }

  /**
   * 更新角色
   */
  async updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
    const response = await httpClient.put<Role>(`${this.rolePath}/${id}`, data)
    return response.data
  }

  /**
   * 删除角色
   */
  async deleteRole(id: string): Promise<OperationResult> {
    const response = await httpClient.delete<OperationResult>(`${this.rolePath}/${id}`)
    return response.data
  }

  /**
   * 获取用户菜单配置
   */
  async getUserMenuConfig(user: User): Promise<MenuConfig> {
    const response = await httpClient.get<MenuConfig>('/menus/user-config', {
      userId: user.id
    })
    return response.data
  }

  /**
   * 检查用户权限
   */
  async checkUserPermission(userId: string, permission: string): Promise<boolean> {
    const response = await httpClient.get<{ hasPermission: boolean }>(
      `/users/${userId}/permissions/check`,
      { permission }
    )
    return response.data.hasPermission
  }
}

// 导出服务实例
export const userApiService = new UserApiService()
export const permissionApiService = new PermissionApiService()
