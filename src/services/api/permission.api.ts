/**
 * 权限管理API服务
 */

import { httpClient } from '@/services/core/http.client'
import { API_PATHS } from '@/config/api.config'
import type {
  Permission,
  Role,
  User,
  MenuConfig,
  OperationResult
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

  /**
   * 分配角色给用户
   */
  async assignRoleToUser(userId: string, roleId: string): Promise<OperationResult> {
    const response = await httpClient.post<OperationResult>(`/users/${userId}/roles`, {
      roleId
    })
    return response.data
  }

  /**
   * 移除用户角色
   */
  async removeRoleFromUser(userId: string, roleId: string): Promise<OperationResult> {
    const response = await httpClient.delete<OperationResult>(`/users/${userId}/roles/${roleId}`)
    return response.data
  }

  /**
   * 获取用户的所有权限
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const response = await httpClient.get<{ permissions: string[] }>(`/users/${userId}/permissions`)
    return response.data.permissions
  }

  /**
   * 批量检查用户权限
   */
  async checkMultiplePermissions(userId: string, permissions: string[]): Promise<Record<string, boolean>> {
    const response = await httpClient.post<Record<string, boolean>>(
      `/users/${userId}/permissions/check-batch`,
      { permissions }
    )
    return response.data
  }
}

export const permissionApi = new PermissionApiService()

// 兼容性导出
export const permissionApiService = permissionApi
