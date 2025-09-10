import type { MenuConfig, Permission, Role, User } from '@/types'

// Mock数据 - 后续替换为真实API
const mockMenuConfig: MenuConfig = {
  menus: [
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
          permissions: ['dashboard:view'],
        },
      ],
    },
    {
      key: 'meeting',
      label: '会议管理',
      type: 'group',
      children: [
        {
          key: 'meeting-list',
          label: '会议列表',
          icon: 'Calendar',
          path: '/meetings',
          permissions: ['meeting:view'],
        },
        {
          key: 'my-meetings',
          label: '我的会议',
          icon: 'User',
          path: '/my-meetings',
          permissions: ['meeting:view'],
        },
      ],
    },
    {
      key: 'sync',
      label: '同步管理',
      type: 'group',
      children: [
        {
          key: 'sync-status',
          label: '同步状态',
          icon: 'RefreshCw',
          path: '/sync-status',
          permissions: ['sync:view'],
        },
      ],
    },
    {
      key: 'personnel',
      label: '人员管理',
      type: 'group',
      children: [
        {
          key: 'participants',
          label: '参会人员',
          icon: 'Users',
          path: '/participants',
          permissions: ['personnel:view'],
        },
        {
          key: 'role-permissions',
          label: '角色权限',
          icon: 'Shield',
          path: '/role-permissions',
          permissions: ['role:manage'],
        },
        {
          key: 'security-levels',
          label: '人员密级',
          icon: 'Lock',
          path: '/security-levels',
          permissions: ['security:manage'],
        },
      ],
    },
    {
      key: 'organization',
      label: '组织架构',
      type: 'group',
      children: [
        {
          key: 'departments',
          label: '部门管理',
          icon: 'Building',
          path: '/departments',
          permissions: ['org:manage'],
        },
        {
          key: 'staff-management',
          label: '人员管理',
          icon: 'UserCheck',
          path: '/staff',
          permissions: ['staff:manage'],
        },
      ],
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
          permissions: ['system:dict'],
        },
        {
          key: 'basic-config',
          label: '基础配置',
          icon: 'Settings',
          path: '/basic-config',
          permissions: ['system:config'],
        },
        {
          key: 'system-logs',
          label: '系统日志',
          icon: 'FileText',
          path: '/system-logs',
          permissions: ['system:logs'],
        },
        {
          key: 'admin-logs',
          label: '操作日志（系统员）',
          icon: 'ScrollText',
          path: '/admin-logs',
          permissions: ['logs:admin'],
        },
        {
          key: 'audit-logs',
          label: '操作日志（审计员）',
          icon: 'Search',
          path: '/audit-logs',
          permissions: ['logs:audit'],
        },
      ],
    },
    {
      key: 'monitoring',
      label: '监控告警',
      type: 'group',
      children: [
        {
          key: 'anomaly-alerts',
          label: '异常行为告警',
          icon: 'AlertTriangle',
          path: '/anomaly-alerts',
          permissions: ['monitor:alerts'],
        },
      ],
    },
  ],
  userPermissions: []
}

const mockPermissions: Permission[] = [
  // 工作台权限
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
