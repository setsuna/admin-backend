/**
 * 权限服务 - 重构后的简洁版本
 * 直接使用API服务，移除Mock逻辑
 */

import { permissionApiService } from './api/user.api'
import type { 
  MenuConfig, 
  Permission, 
  Role, 
  User, 
  MenuItem, 
  MenuItemConfig, 
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
  private roleHasPermission(role: string, permission: string): boolean {
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
  checkUserPermission: permissionService.checkUserPermission.bind(permissionService)
}
