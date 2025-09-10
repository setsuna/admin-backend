import type { MenuConfig, Permission, Role, User } from '@/types'

// Mock数据 - 后续替换为真实API
const mockMenuConfig: MenuConfig = {
  menus: [
    {
      key: 'general',
      label: '通用',
      type: 'group',
      children: [
        {
          key: 'dashboard',
          label: '仪表板',
          icon: 'Home',
          path: '/',
          permissions: ['dashboard:view'],
        },
        {
          key: 'devices',
          label: '设备管理',
          icon: 'Server',
          path: '/devices',
          permissions: ['device:view'],
        },
        {
          key: 'users',
          label: '用户',
          icon: 'Users',
          path: '/users',
          permissions: ['user:view'],
        },
      ],
    },
    {
      key: 'book',
      label: 'Book管理',
      type: 'group',
      children: [
        {
          key: 'projects',
          label: '项目管理',
          icon: 'FolderOpen',
          path: '/projects',
          permissions: ['project:view'],
        },
        {
          key: 'ansible',
          label: 'Ansible管理',
          icon: 'GitBranch',
          path: '/ansible',
          permissions: ['ansible:view'],
        },
      ],
    },
    {
      key: 'other',
      label: '其他',
      type: 'group',
      children: [
        {
          key: 'settings',
          label: '设置',
          icon: 'Settings',
          path: '/settings',
          permissions: ['system:settings'],
        },
        {
          key: 'help',
          label: '帮助中心',
          icon: 'HelpCircle',
          path: '/help',
          permissions: [], // 无权限要求，所有人可见
        },
      ],
    },
  ],
  userPermissions: []
}

const mockPermissions: Permission[] = [
  { id: '1', name: '仪表板查看', code: 'dashboard:view', description: '查看仪表板' },
  { id: '2', name: '设备查看', code: 'device:view', description: '查看设备列表' },
  { id: '3', name: '设备管理', code: 'device:manage', description: '管理设备' },
  { id: '4', name: '用户查看', code: 'user:view', description: '查看用户列表' },
  { id: '5', name: '用户管理', code: 'user:manage', description: '管理用户' },
  { id: '6', name: '项目查看', code: 'project:view', description: '查看项目' },
  { id: '7', name: '项目管理', code: 'project:manage', description: '管理项目' },
  { id: '8', name: 'Ansible查看', code: 'ansible:view', description: '查看Ansible配置' },
  { id: '9', name: 'Ansible管理', code: 'ansible:manage', description: '管理Ansible配置' },
  { id: '10', name: '系统设置', code: 'system:settings', description: '系统设置权限' },
]

const mockRoles: Role[] = [
  {
    id: '1',
    name: '超级管理员',
    code: 'admin',
    permissions: [
      'dashboard:view',
      'device:view',
      'device:manage', 
      'user:view',
      'user:manage',
      'project:view',
      'project:manage',
      'ansible:view',
      'ansible:manage',
      'system:settings'
    ],
    description: '拥有所有权限'
  },
  {
    id: '2',
    name: '普通用户',
    code: 'user',
    permissions: [
      'dashboard:view',
      'device:view',
      'project:view',
      'ansible:view'
    ],
    description: '基础查看权限'
  }
]

// 根据用户角色获取权限
function getPermissionsByRole(userRole: string): string[] {
  const role = mockRoles.find(r => r.code === userRole)
  return role ? role.permissions : []
}

// 根据权限过滤菜单
function filterMenuByPermissions(menus: any[], userPermissions: string[]): any[] {
  return menus.filter(menu => {
    if (menu.type === 'group' && menu.children) {
      // 过滤分组的子菜单
      menu.children = filterMenuByPermissions(menu.children, userPermissions)
      // 如果分组下没有可见的子菜单，隐藏整个分组
      return menu.children.length > 0
    } else {
      // 检查菜单项权限
      if (!menu.permissions || menu.permissions.length === 0) {
        return true // 无权限要求，所有人可见
      }
      // 用户需要拥有至少一个所需权限
      return menu.permissions.some((permission: string) => 
        userPermissions.includes(permission)
      )
    }
  })
}

// API函数
export const permissionApi = {
  // 获取用户菜单配置
  async getUserMenuConfig(user: User): Promise<MenuConfig> {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const userPermissions = user.permissions || getPermissionsByRole(user.role)
    const filteredMenus = filterMenuByPermissions([...mockMenuConfig.menus], userPermissions)
    
    return {
      menus: filteredMenus,
      userPermissions
    }
  },

  // 获取所有权限
  async getAllPermissions(): Promise<Permission[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return [...mockPermissions]
  },

  // 获取所有角色
  async getAllRoles(): Promise<Role[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return [...mockRoles]
  },

  // 检查用户权限
  async checkUserPermission(userId: string, permission: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    // Mock实现
    return true
  }
}
