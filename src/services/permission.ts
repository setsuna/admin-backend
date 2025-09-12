/**
 * 权限服务 - 重构版本
 * 保持原有接口不变，内部切换到新的API架构
 */

import type { MenuConfig, Permission, Role, User, MenuItem, MenuItemConfig } from '@/types'
import { permissionApiService } from './api/user.api'
import { dictApi } from './dict'
import { envConfig } from '@/config/env.config'

// Mock权限数据
const mockPermissions: Permission[] = [
  { id: '1', name: '仪表板查看', code: 'dashboard:view', description: '查看仪表板' },
  
  // 会议管理权限
  { id: '2', name: '会议查看', code: 'meeting:view', description: '查看会议信息' },
  { id: '3', name: '会议管理', code: 'meeting:manage', description: '创建、编辑、删除会议' },
  
  // 同步管理权限
  { id: '4', name: '同步状态查看', code: 'sync:view', description: '查看同步状态' },
  { id: '5', name: '同步管理', code: 'sync:manage', description: '管理同步设置' },
  
  // 人员管理权限
  { id: '6', name: '人员查看', code: 'personnel:view', description: '查看参会人员' },
  { id: '7', name: '人员管理', code: 'personnel:manage', description: '管理参会人员' },
  { id: '8', name: '角色管理', code: 'role:manage', description: '管理角色权限' },
  { id: '9', name: '密级管理', code: 'security:manage', description: '管理人员密级' },
  
  // 组织架构权限
  { id: '10', name: '组织管理', code: 'org:manage', description: '管理组织架构' },
  { id: '11', name: '员工管理', code: 'staff:manage', description: '管理员工信息' },
  
  // 系统管理权限
  { id: '12', name: '数据字典', code: 'system:dict', description: '管理数据字典' },
  { id: '13', name: '系统配置', code: 'system:config', description: '管理系统配置' },
  { id: '14', name: '系统日志', code: 'system:logs', description: '查看系统日志' },
  { id: '15', name: '管理员日志', code: 'logs:admin', description: '查看管理员操作日志' },
  { id: '16', name: '审计日志', code: 'logs:audit', description: '查看审计日志' },
  
  // 监控告警权限
  { id: '17', name: '告警监控', code: 'monitor:alerts', description: '查看和处理告警' },
]

const mockRoles: Role[] = [
  {
    id: '1',
    name: '系统管理员',
    code: 'admin',
    permissions: [
      'dashboard:view',
      'meeting:view',
      'meeting:manage',
      'sync:view',
      'sync:manage',
      'personnel:view',
      'personnel:manage',
      'role:manage',
      'security:manage',
      'org:manage',
      'staff:manage',
      'system:dict',
      'system:config',
      'system:logs',
      'logs:admin',
      'logs:audit',
      'monitor:alerts'
    ],
    description: '拥有所有权限'
  },
  {
    id: '2',
    name: '会议管理员',
    code: 'meeting_admin',
    permissions: [
      'dashboard:view',
      'meeting:view',
      'meeting:manage',
      'sync:view',
      'personnel:view',
      'personnel:manage',
    ],
    description: '会议相关管理权限'
  },
  {
    id: '3',
    name: '普通用户',
    code: 'user',
    permissions: [
      'dashboard:view',
      'meeting:view',
      'sync:view',
    ],
    description: '基础查看权限'
  },
  {
    id: '4',
    name: '审计员',
    code: 'auditor',
    permissions: [
      'dashboard:view',
      'meeting:view',
      'system:logs',
      'logs:admin',
      'logs:audit',
      'monitor:alerts'
    ],
    description: '审计和监控权限'
  }
]

// Mock服务实现
class MockPermissionService {
  // 根据用户角色获取权限
  getPermissionsByRole(userRole: string): string[] {
    const role = mockRoles.find(r => r.code === userRole)
    return role ? role.permissions : []
  }

  // 从数据字典构建菜单配置
  async buildMenuFromDict(userPermissions: string[]): Promise<MenuItem[]> {
    try {
      // 获取菜单分组和菜单项字典
      const [groupsResult, itemsResult] = await Promise.all([
        dictApi.getDictionaries({ keyword: 'MENU_GROUPS' }, 1, 100),
        dictApi.getDictionaries({ keyword: 'MENU_ITEMS' }, 1, 100)
      ])
      
      // 查找对应的字典数据
      const groupsDict = groupsResult.items.find(dict => dict.dictCode === 'MENU_GROUPS')
      const itemsDict = itemsResult.items.find(dict => dict.dictCode === 'MENU_ITEMS')
      
      const groupsData = groupsDict?.items || []
      const itemsData = itemsDict?.items || []
      
      if (groupsData.length === 0 || itemsData.length === 0) {
        console.warn('Menu dict data is empty, falling back to minimal config')
        return this.getMinimalMenu(userPermissions)
      }
      
      // 按分组构建菜单结构
      const menuGroups: MenuItem[] = []
      
      // 处理启用的分组
      const enabledGroups = groupsData
        .filter(group => group.status === 'enabled')
        .sort((a, b) => a.sort - b.sort)
      
      for (const group of enabledGroups) {
        // 获取该分组下的菜单项
        const groupItems: MenuItem[] = []
        
        const enabledItems = itemsData
          .filter(item => {
            if (item.status !== 'enabled') return false
            
            try {
              const menuConfig: MenuItemConfig = JSON.parse(item.value as string)
              return menuConfig.group === group.value
            } catch {
              return false
            }
          })
          .sort((a, b) => a.sort - b.sort)
        
        for (const item of enabledItems) {
          try {
            const menuConfig: MenuItemConfig = JSON.parse(item.value as string)
            
            // 检查权限
            const hasPermission = !menuConfig.permissions?.length || 
              menuConfig.permissions.some(permission => userPermissions.includes(permission))
            
            if (hasPermission) {
              groupItems.push({
                key: menuConfig.key,
                label: menuConfig.label,
                icon: menuConfig.icon,
                path: menuConfig.path,
                permissions: menuConfig.permissions,
                group: menuConfig.group
              })
            }
          } catch (error) {
            console.warn(`Failed to parse menu item config:`, item, error)
          }
        }
        
        // 只有当分组下有菜单项时才添加该分组
        if (groupItems.length > 0) {
          menuGroups.push({
            key: group.value as string,
            label: group.name,
            type: 'group',
            children: groupItems
          })
        }
      }
      
      return menuGroups
    } catch (error) {
      console.error('Failed to build menu from dict:', error)
      // 降级到最小化菜单
      return this.getMinimalMenu(userPermissions)
    }
  }

  // 获取最小化降级菜单
  private getMinimalMenu(userPermissions: string[]): MenuItem[] {
    const minimalMenus: MenuItem[] = [
      {
        key: 'workspace',
        label: '工作台',
        type: 'group',
        children: [
          {
            key: 'dashboard',
            label: '仪表板',
            icon: 'BarChart3',
            path: '/',
            permissions: ['dashboard:view']
          }
        ]
      },
      {
        key: 'system',
        label: '系统管理',
        type: 'group',
        children: [
          {
            key: 'data-dictionary',
            label: '数据字典',
            icon: 'Book',
            path: '/data-dictionary',
            permissions: ['system:dict']
          }
        ]
      }
    ]
    
    return this.filterMenuByPermissions(minimalMenus, userPermissions)
  }

  // 根据权限过滤菜单
  filterMenuByPermissions(menus: any[], userPermissions: string[]): any[] {
    return menus.filter(menu => {
      if (menu.type === 'group' && menu.children) {
        menu.children = this.filterMenuByPermissions(menu.children, userPermissions)
        return menu.children.length > 0
      } else {
        if (!menu.permissions || menu.permissions.length === 0) {
          return true
        }
        return menu.permissions.some((permission: string) => 
          userPermissions.includes(permission)
        )
      }
    })
  }

  // 获取用户菜单配置
  async getUserMenuConfig(user: User): Promise<MenuConfig> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const userPermissions = user.permissions || this.getPermissionsByRole(user.role)
    
    // 优先从数据字典获取菜单配置
    const menus = await this.buildMenuFromDict(userPermissions)
    
    return {
      menus,
      userPermissions
    }
  }

  // 获取所有权限
  async getAllPermissions(): Promise<Permission[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return [...mockPermissions]
  }

  // 获取所有角色
  async getAllRoles(): Promise<Role[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return [...mockRoles]
  }

  // 检查用户权限
  async checkUserPermission(): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return true
  }

  // 测试方法：验证菜单是否从字典读取
  async testMenuFromDict(): Promise<{ success: boolean, menuCount: number, source: string }> {
    try {
      const testPermissions = ['dashboard:view', 'meeting:view', 'system:dict']
      const menus = await this.buildMenuFromDict(testPermissions)
      return {
        success: true,
        menuCount: menus.length,
        source: 'dictionary'
      }
    } catch (error) {
      return {
        success: false,
        menuCount: 0,
        source: 'fallback'
      }
    }
  }
}

// 决定使用哪个服务实现
const shouldUseMock = () => {
  return envConfig.ENABLE_MOCK || envConfig.DEV
}

// 创建统一的API接口
const createPermissionApi = () => {
  if (shouldUseMock()) {
    console.log('🔐 Permission API: Using Mock Service')
    return new MockPermissionService()
  } else {
    console.log('🌐 Permission API: Using Real Service')
    // 适配器模式，将新API服务包装成旧接口
    return {
      async getUserMenuConfig(user: User) {
        // 尝试从数据字典构建菜单
        const mockService = new MockPermissionService()
        const userPermissions = user.permissions || mockService.getPermissionsByRole(user.role)
        
        try {
          const menus = await mockService.buildMenuFromDict(userPermissions)
          return {
            menus,
            userPermissions
          }
        } catch (error) {
          console.error('Failed to build menu from dict in real API, falling back to API service:', error)
          // 如果字典方式失败，降级到原有API服务
          const apiUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            department: user.department,
            position: user.position,
            phone: user.phone,
            status: user.status,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            permissions: user.permissions
          }
          return permissionApiService.getUserMenuConfig(apiUser)
        }
      },

      async getAllPermissions() {
        return permissionApiService.getAllPermissions()
      },

      async getAllRoles() {
        return permissionApiService.getAllRoles()
      },

      async checkUserPermission(userId?: string, permission?: string) {
        if (userId && permission) {
          return permissionApiService.checkUserPermission(userId, permission)
        }
        return true // Mock实现
      }
    }
  }
}

export const permissionApi = createPermissionApi()
