/**
 * 权限服务 - 重构版本
 * 保持原有接口不变，内部切换到新的API架构
 */

import type { MenuConfig, Permission, Role, User, MenuItem, MenuItemConfig, PermissionGroup, RolePermissionMatrix } from '@/types'
import { permissionApiService } from './api/user.api'
import { dictApi } from './dict'
import { envConfig } from '@/config/env.config'

// Mock权限数据
const mockPermissions: Permission[] = [
  // 仪表板权限
  { id: '1', name: '仪表板查看', code: 'dashboard:view', category: 'workspace', resource: 'dashboard', action: 'read', description: '查看仪表板' },
  
  // 会议管理权限
  { id: '2', name: '会议查看', code: 'meeting:read', category: 'meeting', resource: 'meeting', action: 'read', description: '查看会议信息' },
  { id: '3', name: '会议创建', code: 'meeting:write', category: 'meeting', resource: 'meeting', action: 'write', description: '创建会议' },
  { id: '4', name: '会议删除', code: 'meeting:delete', category: 'meeting', resource: 'meeting', action: 'delete', description: '删除会议' },
  { id: '5', name: '会议管理', code: 'meeting:manage', category: 'meeting', resource: 'meeting', action: 'manage', description: '全面管理会议' },
  
  // 同步管理权限
  { id: '6', name: '同步状态查看', code: 'sync:read', category: 'sync', resource: 'sync', action: 'read', description: '查看同步状态' },
  { id: '7', name: '同步管理', code: 'sync:manage', category: 'sync', resource: 'sync', action: 'manage', description: '管理同步设置' },
  
  // 人员管理权限
  { id: '8', name: '人员查看', code: 'personnel:read', category: 'personnel', resource: 'personnel', action: 'read', description: '查看参会人员' },
  { id: '9', name: '人员编辑', code: 'personnel:write', category: 'personnel', resource: 'personnel', action: 'write', description: '编辑人员信息' },
  { id: '10', name: '人员删除', code: 'personnel:delete', category: 'personnel', resource: 'personnel', action: 'delete', description: '删除人员' },
  { id: '11', name: '人员管理', code: 'personnel:manage', category: 'personnel', resource: 'personnel', action: 'manage', description: '管理参会人员' },
  
  // 角色权限管理
  { id: '12', name: '角色查看', code: 'role:read', category: 'personnel', resource: 'role', action: 'read', description: '查看角色信息' },
  { id: '13', name: '角色编辑', code: 'role:write', category: 'personnel', resource: 'role', action: 'write', description: '编辑角色权限' },
  { id: '14', name: '角色删除', code: 'role:delete', category: 'personnel', resource: 'role', action: 'delete', description: '删除角色' },
  { id: '15', name: '角色管理', code: 'role:manage', category: 'personnel', resource: 'role', action: 'manage', description: '管理角色权限' },
  
  // 密级管理权限
  { id: '16', name: '密级查看', code: 'security:read', category: 'personnel', resource: 'security', action: 'read', description: '查看人员密级' },
  { id: '17', name: '密级管理', code: 'security:manage', category: 'personnel', resource: 'security', action: 'manage', description: '管理人员密级' },
  
  // 组织架构权限
  { id: '18', name: '组织查看', code: 'org:read', category: 'organization', resource: 'organization', action: 'read', description: '查看组织架构' },
  { id: '19', name: '组织管理', code: 'org:manage', category: 'organization', resource: 'organization', action: 'manage', description: '管理组织架构' },
  { id: '20', name: '员工查看', code: 'staff:read', category: 'organization', resource: 'staff', action: 'read', description: '查看员工信息' },
  { id: '21', name: '员工管理', code: 'staff:manage', category: 'organization', resource: 'staff', action: 'manage', description: '管理员工信息' },
  
  // 用户管理权限
  { id: '31', name: '用户查看', code: 'user:read', category: 'organization', resource: 'user', action: 'read', description: '查看用户信息' },
  { id: '32', name: '用户创建', code: 'user:write', category: 'organization', resource: 'user', action: 'write', description: '创建用户' },
  { id: '33', name: '用户删除', code: 'user:delete', category: 'organization', resource: 'user', action: 'delete', description: '删除用户' },
  { id: '34', name: '用户管理', code: 'user:manage', category: 'organization', resource: 'user', action: 'manage', description: '全面管理用户' },
  
  // 系统管理权限
  { id: '22', name: '数据字典查看', code: 'system:dict:read', category: 'system', resource: 'dict', action: 'read', description: '查看数据字典' },
  { id: '23', name: '数据字典管理', code: 'system:dict:manage', category: 'system', resource: 'dict', action: 'manage', description: '管理数据字典' },
  { id: '24', name: '系统配置查看', code: 'system:config:read', category: 'system', resource: 'config', action: 'read', description: '查看系统配置' },
  { id: '25', name: '系统配置管理', code: 'system:config:manage', category: 'system', resource: 'config', action: 'manage', description: '管理系统配置' },
  { id: '26', name: '系统日志查看', code: 'system:logs:read', category: 'system', resource: 'logs', action: 'read', description: '查看系统日志' },
  { id: '27', name: '管理员日志查看', code: 'logs:admin:read', category: 'system', resource: 'admin_logs', action: 'read', description: '查看管理员操作日志' },
  { id: '28', name: '审计日志查看', code: 'logs:audit:read', category: 'system', resource: 'audit_logs', action: 'read', description: '查看审计日志' },
  
  // 监控告警权限
  { id: '29', name: '告警查看', code: 'monitor:alerts:read', category: 'monitoring', resource: 'alerts', action: 'read', description: '查看告警信息' },
  { id: '30', name: '告警处理', code: 'monitor:alerts:manage', category: 'monitoring', resource: 'alerts', action: 'manage', description: '处理告警' },
]

const mockRoles: Role[] = [
  {
    id: '1',
    name: '系统管理员',
    code: 'admin',
    permissions: [
      'dashboard:view',
      'meeting:read', 'meeting:write', 'meeting:delete', 'meeting:manage',
      'sync:read', 'sync:manage',
      'personnel:read', 'personnel:write', 'personnel:delete', 'personnel:manage',
      'role:read', 'role:write', 'role:delete', 'role:manage',
      'security:read', 'security:manage',
      'org:read', 'org:manage',
      'staff:read', 'staff:manage',
      'user:read', 'user:write', 'user:delete', 'user:manage',
      'system:dict:read', 'system:dict:manage',
      'system:config:read', 'system:config:manage',
      'system:logs:read', 'logs:admin:read', 'logs:audit:read',
      'monitor:alerts:read', 'monitor:alerts:manage'
    ],
    status: 'enabled',
    description: '拥有所有权限',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: '2',
    name: '会议管理员',
    code: 'meeting_admin',
    permissions: [
      'dashboard:view',
      'meeting:read', 'meeting:write', 'meeting:manage',
      'sync:read',
      'personnel:read', 'personnel:write', 'personnel:manage',
    ],
    status: 'enabled',
    description: '会议相关管理权限',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: '3',
    name: '普通用户',
    code: 'user',
    permissions: [
      'dashboard:view',
      'meeting:read',
      'sync:read',
      'personnel:read',
    ],
    status: 'enabled',
    description: '基础查看权限',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: '4',
    name: '审计员',
    code: 'auditor',
    permissions: [
      'dashboard:view',
      'meeting:read',
      'personnel:read',
      'system:logs:read', 'logs:admin:read', 'logs:audit:read',
      'monitor:alerts:read'
    ],
    status: 'enabled',
    description: '审计和监控权限',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
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
        key: 'organization',
        label: '组织管理',
        type: 'group',
        children: [
          {
            key: 'departments',
            label: '部门管理',
            icon: 'Building',
            path: '/departments',
            permissions: ['org:manage']
          },
          {
            key: 'users',
            label: '用户管理',
            icon: 'Users',
            path: '/users',
            permissions: ['user:manage']
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
            permissions: ['system:dict:read']
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
    // 这里可以实现更复杂的权限检查逻辑
    return true
  }

  // 获取权限分组
  async getPermissionGroups(): Promise<PermissionGroup[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const groups = mockPermissions.reduce((acc, permission) => {
      const existingGroup = acc.find(g => g.key === permission.category)
      if (existingGroup) {
        existingGroup.permissions.push(permission)
      } else {
        acc.push({
          key: permission.category,
          name: this.getCategoryName(permission.category),
          permissions: [permission]
        })
      }
      return acc
    }, [] as PermissionGroup[])
    
    return groups
  }

  private getCategoryName(category: string): string {
    const categoryNames: Record<string, string> = {
      'workspace': '工作台',
      'meeting': '会议管理',
      'sync': '同步管理',
      'personnel': '人员管理',
      'organization': '组织架构',
      'system': '系统管理',
      'monitoring': '监控告警'
    }
    return categoryNames[category] || category
  }

  // 更新角色权限
  async updateRolePermissions(roleId: string, permissions: string[]): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const roleIndex = mockRoles.findIndex(r => r.id === roleId)
    if (roleIndex === -1) return false
    
    mockRoles[roleIndex].permissions = permissions
    mockRoles[roleIndex].updatedAt = new Date().toISOString()
    
    return true
  }

  // 创建角色
  async createRole(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const now = new Date().toISOString()
    const newRole: Role = {
      id: Date.now().toString(),
      ...roleData,
      createdAt: now,
      updatedAt: now
    }
    
    mockRoles.push(newRole)
    return newRole
  }

  // 更新角色
  async updateRole(roleId: string, roleData: Partial<Omit<Role, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Role | null> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const roleIndex = mockRoles.findIndex(r => r.id === roleId)
    if (roleIndex === -1) return null
    
    mockRoles[roleIndex] = {
      ...mockRoles[roleIndex],
      ...roleData,
      updatedAt: new Date().toISOString()
    }
    
    return mockRoles[roleIndex]
  }

  // 删除角色
  async deleteRole(roleId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const roleIndex = mockRoles.findIndex(r => r.id === roleId)
    if (roleIndex === -1) return false
    
    mockRoles.splice(roleIndex, 1)
    return true
  }

  // 获取角色权限矩阵
  async getRolePermissionMatrix(): Promise<RolePermissionMatrix[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return mockRoles.map(role => ({
      roleId: role.id,
      roleName: role.name,
      permissions: mockPermissions.reduce((acc, permission) => {
        acc[permission.code] = role.permissions.includes(permission.code)
        return acc
      }, {} as Record<string, boolean>)
    }))
  }

  // 获取启用的角色选项
  async getRoleOptions(): Promise<Array<{ label: string, value: string, sort: number }>> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return mockRoles
      .filter(role => role.status === 'enabled')
      .sort((a, b) => parseInt(a.id) - parseInt(b.id))
      .map(role => ({
        label: role.name,
        value: role.code,
        sort: parseInt(role.id)
      }))
  }

  // 根据角色代码获取角色名称
  getRoleDisplayName(roleCode: string): string {
    const role = mockRoles.find(r => r.code === roleCode)
    return role?.name || roleCode
  }
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

      async getPermissionGroups() {
        // 使用Mock服务的方法
        const mockService = new MockPermissionService()
        return mockService.getPermissionGroups()
      },

      async updateRolePermissions() {
        // TODO: 实现真实API调用
        return true
      },

      async createRole(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) {
        // TODO: 实现真实API调用
        return {
          ...roleData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Role
      },

      async updateRole() {
        // TODO: 实现真实API调用
        return null
      },

      async deleteRole() {
        // TODO: 实现真实API调用
        return true
      },

      async getRolePermissionMatrix() {
        // 使用Mock服务的方法
        const mockService = new MockPermissionService()
        return mockService.getRolePermissionMatrix()
      },

      async getRoleOptions() {
        // 使用Mock服务的方法
        const mockService = new MockPermissionService()
        return mockService.getRoleOptions()
      },

      getRoleDisplayName(roleCode: string) {
        // 使用Mock服务的方法
        const mockService = new MockPermissionService()
        return mockService.getRoleDisplayName(roleCode)
      },

      async checkUserPermission() {
        return true // Mock实现
      }
    }
  }
}

export const permissionApi = createPermissionApi()
