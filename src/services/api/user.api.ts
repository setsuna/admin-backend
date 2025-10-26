/**
 * 用户管理API服务
 */

import { httpClient } from '@/services/core/http.client'
import { API_PATHS } from '@/config'
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  PaginatedResponse,
  OperationResult,
  Permission,
  Role,
  MenuConfig
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
    return await httpClient.get<PaginatedResponse<User>>(this.basePath, {
      ...filters,
      page,
      pageSize
    })
  }

  /**
   * 获取单个用户详情
   */
  async getUser(id: string): Promise<User> {
    return await httpClient.get<User>(`${this.basePath}/${id}`)
  }

  /**
   * 创建用户
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    return await httpClient.post<User>(this.basePath, data)
  }

  /**
   * 更新用户
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    return await httpClient.put<User>(`${this.basePath}/${id}`, data)
  }

  /**
   * 删除用户
   */
  async deleteUser(id: string): Promise<OperationResult> {
    return await httpClient.delete<OperationResult>(`${this.basePath}/${id}`)
  }

  /**
   * 批量删除用户
   */
  async deleteUsers(ids: string[]): Promise<{ successCount: number; failedCount: number }> {
    return await httpClient.post<{ successCount: number; failedCount: number }>(
      `${this.basePath}/batch-delete`,
      { ids }
    )
  }

  /**
   * 重置用户密码
   */
  async resetUserPassword(id: string): Promise<ResetPasswordResponse> {
    return await httpClient.post<ResetPasswordResponse>(`${this.basePath}/${id}/reset-password`)
  }

  /**
   * 更新用户状态
   */
  async updateUserStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<OperationResult> {
    return await httpClient.put<OperationResult>(`${this.basePath}/${id}/status`, { status })
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(): Promise<{
    total: number
    active: number
    inactive: number
    suspended: number
    byRole: Record<string, number>
    bySecurityLevel: Record<string, number>
  }> {
    return await httpClient.get(`${this.basePath}/stats`)
  }

  /**
   * 更新用户密级
   */
  async updateUserSecurityLevel(id: string, securityLevel: string): Promise<User> {
    return await httpClient.put<User>(`${this.basePath}/${id}/security-level`, { securityLevel })
  }

  /**
   * 批量更新用户密级
   */
  async batchUpdateSecurityLevel(ids: string[], securityLevel: string): Promise<OperationResult> {
    return await httpClient.put<OperationResult>(`${this.basePath}/batch-security-level`, {
      ids,
      securityLevel
    })
  }

  /**
   * 获取用户安全等级选项
   */
  async getUserSecurityLevels(): Promise<string[]> {
    return await httpClient.get<string[]>(`${this.basePath}/security-levels`)
  }

  /**
   * 搜索用户
   */
  async searchUsers(keyword: string, limit: number = 10): Promise<User[]> {
    return await httpClient.get<User[]>(`${this.basePath}/search`, {
      keyword,
      limit
    })
  }
}

export class PermissionApiService {
  private basePath = API_PATHS.PERMISSIONS
  private rolePath = API_PATHS.ROLES

  /**
   * 获取所有权限
   */
  async getAllPermissions(): Promise<Permission[]> {
    return await httpClient.get<Permission[]>(this.basePath)
  }

  /**
   * 获取权限分组
   */
  async getPermissionGroups(): Promise<Record<string, Permission[]>> {
    return await httpClient.get<Permission[]>(`${this.basePath}/groups`).then(permissions => {
      // 将数组转换为分组对象
      const groups: Record<string, Permission[]> = {}
      permissions.forEach(permission => {
        const category = (permission as any).category || 'default'
        if (!groups[category]) {
          groups[category] = []
        }
        groups[category].push(permission)
      })
      return groups
    })
  }

  /**
   * 获取所有角色
   */
  async getAllRoles(): Promise<Role[]> {
    return await httpClient.get<Role[]>(this.rolePath)
  }

  /**
   * 获取单个角色详情
   */
  async getRole(id: string): Promise<Role> {
    return await httpClient.get<Role>(`${this.rolePath}/${id}`)
  }

  /**
   * 创建角色
   */
  async createRole(data: CreateRoleRequest): Promise<Role> {
    return await httpClient.post<Role>(this.rolePath, data)
  }

  /**
   * 更新角色
   */
  async updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
    return await httpClient.put<Role>(`${this.rolePath}/${id}`, data)
  }

  /**
   * 删除角色
   */
  async deleteRole(id: string): Promise<OperationResult> {
    return await httpClient.delete<OperationResult>(`${this.rolePath}/${id}`)
  }

  /**
   * 获取用户菜单配置
   */
  async getUserMenuConfig(user: User): Promise<MenuConfig> {
    return await httpClient.get<MenuConfig>('/menus/user-config', {
      userId: user.id
    })
  }

  /**
   * 检查用户权限
   */
  async checkUserPermission(userId: string, permission: string): Promise<boolean> {
    const result = await httpClient.get<{ hasPermission: boolean }>(
      `/users/${userId}/permissions/check`,
      { permission }
    )
    return result.hasPermission
  }
}

// 导出服务实例
export const userApiService = new UserApiService()
export const permissionApiService = new PermissionApiService()
