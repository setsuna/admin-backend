/**
 * 权限管理API服务
 */

import { httpClient } from '@/services/core/http.client'
import { API_PATHS } from '@/config'
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
    const response = await httpClient.get<{ items: Permission[], pagination?: any } | Permission[]>(this.basePath)
    // 兼容两种响应格式：分页格式和数组格式
    return Array.isArray(response) ? response : (response.items || [])
  }

  /**
   * 获取权限分组
   */
  async getPermissionGroups(): Promise<any> {
    const response = await httpClient.get<any>(`${this.basePath}/groups`)
    
    // 处理分页响应格式: { items: [...] }
    if (response && response.items) {
      return response.items
    }
    
    // 处理直接返回数组或对象
    return response
  }

  /**
   * 获取所有角色
   */
  async getAllRoles(): Promise<Role[]> {
    const response = await httpClient.get<{ items: Role[], pagination: any }>(this.rolePath)
    return response.items || []
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
    const response = await httpClient.get<{ hasPermission: boolean }>(
      `/users/${userId}/permissions/check`,
      { permission }
    )
    return response.hasPermission || false
  }

  /**
   * 分配角色给用户
   */
  async assignRoleToUser(userId: string, roleId: string): Promise<OperationResult> {
    return await httpClient.post<OperationResult>(`/users/${userId}/roles`, {
      roleId
    })
  }

  /**
   * 移除用户角色
   */
  async removeRoleFromUser(userId: string, roleId: string): Promise<OperationResult> {
    return await httpClient.delete<OperationResult>(`/users/${userId}/roles/${roleId}`)
  }

  /**
   * 获取用户的所有权限
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const response = await httpClient.get<{ permissions: string[] }>(`/users/${userId}/permissions`)
    return response.permissions || []
  }

  /**
   * 批量检查用户权限
   */
  async checkMultiplePermissions(userId: string, permissions: string[]): Promise<Record<string, boolean>> {
    return await httpClient.post<Record<string, boolean>>(
      `/users/${userId}/permissions/check-batch`,
      { permissions }
    )
  }
}

export const permissionApi = new PermissionApiService()

// 兼容性导出
export const permissionApiService = permissionApi
