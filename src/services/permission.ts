/**
 * 权限服务 - 重构后的简洁版本
 * 直接使用API服务，移除Mock逻辑
 */

import { permissionApi as permissionApiService } from './api/permission.api'
import type { 
  MenuConfig, 
  Permission, 
  Role, 
  User, 
  MenuItem, 
  PermissionGroup, 
  RolePermissionMatrix 
} from '@/types'

/**
 * 权限服务类
 * 封装权限相关的业务逻辑
 */
class PermissionService {
  /**
   * 获取所有权限
   */
  async getAllPermissions(): Promise<Permission[]> {
    return permissionApiService.getAllPermissions()
  }

  /**
   * 获取所有角色
   */
  async getAllRoles(): Promise<Role[]> {
    return permissionApiService.getAllRoles()
  }

  /**
   * 获取用户菜单配置
   */
  async getUserMenuConfig(user: User): Promise<MenuConfig> {
    return permissionApiService.getUserMenuConfig(user)
  }

  /**
   * 检查用户权限
   */
  async checkUserPermission(userId: string, permission: string): Promise<boolean> {
    return permissionApiService.checkUserPermission(userId, permission)
  }

  /**
   * 获取权限分组
   */
  async getPermissionGroups(): Promise<PermissionGroup[]> {
    const result = await permissionApiService.getPermissionGroups()
    
    // 处理不同的响应格式
    if (Array.isArray(result)) {
      // 如果已经是数组，确保每个分组的permissions也是数组
      return result.map(group => ({
        ...group,
        permissions: Array.isArray(group.permissions) ? group.permissions : []
      }))
    }
    
    // 如果是Record<string, Permission[]>格式，转换为PermissionGroup[]
    return Object.entries(result).map(([key, permissions]) => ({
      id: key,
      key,
      name: key,
      permissions: Array.isArray(permissions) ? permissions : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'business' as const,
      sort: 0
    }))
  }

  /**
   * 获取角色权限矩阵
   */
  async getRolePermissionMatrix(): Promise<RolePermissionMatrix[]> {
    const roles = await permissionApiService.getAllRoles()
    
    return roles.map(role => ({
      roleId: role.id,
      roleName: role.name,
      permissions: role.permissions.reduce((acc, code) => {
        acc[code] = true
        return acc
      }, {} as Record<string, boolean>),
      effectivePermissions: role.permissions
    }))
  }

  /**
   * 更新角色权限
   */
  async updateRolePermissions(roleId: string, permissions: string[]): Promise<Role> {
    return permissionApiService.updateRole(roleId, { id: roleId, permissions })
  }

  /**
   * 创建角色
   */
  async createRole(roleData: any): Promise<Role> {
    return permissionApiService.createRole(roleData)
  }

  /**
   * 更新角色
   */
  async updateRole(roleId: string, roleData: any): Promise<Role> {
    return permissionApiService.updateRole(roleId, roleData)
  }

  /**
   * 删除角色
   */
  async deleteRole(roleId: string): Promise<any> {
    return permissionApiService.deleteRole(roleId)
  }

  /**
   * 根据用户角色过滤菜单项
   */
  filterMenuByUserRole(menuItems: MenuItem[], userRoles: string[]): MenuItem[] {
    return menuItems.filter(item => {
      if (!item.permissions || item.permissions.length === 0) {
        return true
      }
      
      // 检查用户是否有任一权限
      return item.permissions.some(permission => 
        userRoles.some(role => this.roleHasPermission(role, permission))
      )
    }).map(item => ({
      ...item,
      children: item.children ? this.filterMenuByUserRole(item.children, userRoles) : undefined
    }))
  }

  /**
   * 检查角色是否有指定权限
   */
  private roleHasPermission(_role: string, _permission: string): boolean {
    // 这里应该根据实际的权限系统来实现
    // 暂时返回true，实际使用时需要调用API
    return true
  }
  
}

export const permissionService = new PermissionService()

// 兼容性导出，保持原有接口不变
export const permissionApi = {
  getAllPermissions: permissionService.getAllPermissions.bind(permissionService),
  getAllRoles: permissionService.getAllRoles.bind(permissionService),
  getUserMenuConfig: permissionService.getUserMenuConfig.bind(permissionService),
  checkUserPermission: permissionService.checkUserPermission.bind(permissionService),
  getPermissionGroups: permissionService.getPermissionGroups.bind(permissionService),
  getRolePermissionMatrix: permissionService.getRolePermissionMatrix.bind(permissionService),
  updateRolePermissions: permissionService.updateRolePermissions.bind(permissionService),
  createRole: permissionService.createRole.bind(permissionService),
  updateRole: permissionService.updateRole.bind(permissionService),
  deleteRole: permissionService.deleteRole.bind(permissionService)
}
