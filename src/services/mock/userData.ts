import type { 
  User, 
  UserFilters, 
  CreateUserRequest, 
  UpdateUserRequest,
  PaginatedResponse,
  ApiResponse,
  UserSecurityLevel
} from '@/types'

// Mock用户数据
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    department: '5',
    departmentName: '技术部',
    position: '系统管理员',
    phone: '13800138001',
    status: 'active',
    securityLevel: 'secret',
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-15T10:30:00.000Z',
    lastLoginAt: '2025-09-13T09:15:00.000Z',
    permissions: ['user:manage', 'dept:manage', 'system:manage']
  },
  {
    id: '2',
    username: 'zhangsan',
    email: 'zhangsan@example.com',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
    department: '5',
    departmentName: '技术部',
    position: '前端工程师',
    phone: '13800138002',
    status: 'active',
    securityLevel: 'confidential',
    createdAt: '2024-01-05T08:00:00.000Z',
    updatedAt: '2024-02-10T14:20:00.000Z',
    lastLoginAt: '2025-09-12T18:45:00.000Z',
    permissions: ['meeting:view']
  },
  {
    id: '3',
    username: 'lisi',
    email: 'lisi@example.com',
    role: 'meeting_admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
    department: '2',
    departmentName: '行政部',
    position: '会议管理员',
    phone: '13800138003',
    status: 'active',
    securityLevel: 'internal',
    createdAt: '2024-01-10T08:00:00.000Z',
    updatedAt: '2024-03-01T16:00:00.000Z',
    lastLoginAt: '2025-09-13T08:30:00.000Z',
    permissions: ['meeting:manage', 'meeting:create']
  },
  {
    id: '4',
    username: 'wangwu',
    email: 'wangwu@example.com',
    role: 'auditor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
    department: '4',
    departmentName: '财务部',
    position: '审计员',
    phone: '13800138004',
    status: 'inactive',
    securityLevel: 'confidential',
    createdAt: '2024-01-15T08:00:00.000Z',
    updatedAt: '2024-01-20T11:15:00.000Z',
    lastLoginAt: '2025-09-10T15:20:00.000Z',
    permissions: ['audit:view', 'report:view']
  },
  {
    id: '5',
    username: 'zhaoliu',
    email: 'zhaoliu@example.com',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu',
    department: '5',
    departmentName: '技术部',
    position: '后端工程师',
    phone: '13800138005',
    status: 'active',
    securityLevel: 'internal',
    createdAt: '2024-01-20T08:00:00.000Z',
    updatedAt: '2024-02-15T13:45:00.000Z',
    lastLoginAt: '2025-09-12T17:30:00.000Z',
    permissions: ['meeting:view']
  },
  {
    id: '6',
    username: 'qianqi',
    email: 'qianqi@example.com',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=qianqi',
    department: '6',
    departmentName: '市场部',
    position: '市场专员',
    phone: '13800138006',
    status: 'suspended',
    securityLevel: 'unknown',
    createdAt: '2024-02-01T08:00:00.000Z',
    updatedAt: '2024-02-20T09:30:00.000Z',
    lastLoginAt: '2025-09-08T12:15:00.000Z',
    permissions: []
  },
  {
    id: '7',
    username: 'sunba',
    email: 'sunba@example.com',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunba',
    department: '7',
    departmentName: '销售部',
    position: '销售经理',
    phone: '13800138007',
    status: 'active',
    securityLevel: 'confidential',
    createdAt: '2024-02-05T08:00:00.000Z',
    updatedAt: '2024-03-10T10:00:00.000Z',
    lastLoginAt: '2025-09-13T07:45:00.000Z',
    permissions: ['product:manage']
  },
  {
    id: '8',
    username: 'zhoujiu',
    email: 'zhoujiu@example.com',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhoujiu',
    department: '3',
    departmentName: '人力资源部',
    position: 'HR专员',
    phone: '13800138008',
    status: 'active',
    securityLevel: 'internal',
    createdAt: '2024-02-10T08:00:00.000Z',
    updatedAt: '2024-03-05T15:20:00.000Z',
    lastLoginAt: '2025-09-11T16:00:00.000Z',
    permissions: ['hr:view']
  },
  {
    id: '9',
    username: 'wushi',
    email: 'wushi@example.com',
    role: 'meeting_admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wushi',
    department: '5',
    departmentName: '技术部',
    position: '技术主管',
    phone: '13800138009',
    status: 'active',
    securityLevel: 'secret',
    createdAt: '2024-02-15T08:00:00.000Z',
    updatedAt: '2024-03-15T14:10:00.000Z',
    lastLoginAt: '2025-09-13T08:00:00.000Z',
    permissions: ['meeting:manage', 'tech:manage']
  },
  {
    id: '10',
    username: 'zhengshi',
    email: 'zhengshi@example.com',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhengshi',
    department: '8',
    departmentName: '客服部',
    position: '客服专员',
    phone: '13800138010',
    status: 'active',
    securityLevel: 'unknown',
    createdAt: '2024-02-20T08:00:00.000Z',
    updatedAt: '2024-03-20T11:30:00.000Z',
    lastLoginAt: '2025-09-09T14:20:00.000Z',
    permissions: ['operation:view']
  },
  {
    id: '11',
    username: 'security_admin',
    email: 'security@example.com',
    role: 'security_admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=security_admin',
    department: '2',
    departmentName: '行政部',
    position: '安全管理员',
    phone: '13800138011',
    status: 'active',
    securityLevel: 'secret',
    createdAt: '2024-03-01T08:00:00.000Z',
    updatedAt: '2024-03-25T12:00:00.000Z',
    lastLoginAt: '2025-09-13T09:00:00.000Z',
    permissions: ['security:user:manage', 'dashboard:view']
  }
]

// 模拟延迟
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// 生成新的ID
const generateId = () => Math.random().toString(36).substr(2, 9)

// 全局存储密级变更历史
interface SecurityLevelHistoryRecord {
  id: string
  userId: string
  oldLevel: UserSecurityLevel
  newLevel: UserSecurityLevel
  updatedBy: string
  updatedByName: string
  updatedAt: string
  reason?: string
}

let securityLevelHistory: SecurityLevelHistoryRecord[] = []

// 筛选用户数据
const filterUsers = (users: User[], filters?: UserFilters): User[] => {
  if (!filters) return users
  
  return users.filter(user => {
    // 关键词搜索（用户名、邮箱、部门名、职位）
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      const searchText = [
        user.username,
        user.email,
        user.departmentName,
        user.position,
        user.phone
      ].filter(Boolean).join(' ').toLowerCase()
      
      if (!searchText.includes(keyword)) return false
    }
    
    // 部门筛选
    if (filters.department && user.department !== filters.department) return false
    
    // 角色筛选
    if (filters.role && user.role !== filters.role) return false
    
    // 状态筛选
    if (filters.status && user.status !== filters.status) return false
    
    // 密级筛选
    if (filters.securityLevel && user.securityLevel !== filters.securityLevel) return false
    
    return true
  })
}

// Mock服务
export const mockUserService = {
  // 获取用户列表（分页）
  async getUsers(
    filters?: UserFilters,
    page: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<PaginatedResponse<User>>> {
    await delay()
    
    const filteredUsers = filterUsers(mockUsers, filters)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const items = filteredUsers.slice(start, end)
    
    return {
      code: 200,
      message: 'success',
      data: {
        items,
        pagination: {
          page,
          pageSize,
          total: filteredUsers.length,
          totalPages: Math.ceil(filteredUsers.length / pageSize)
        }
      }
    }
  },

  // 获取单个用户详情
  async getUser(id: string): Promise<ApiResponse<User>> {
    await delay()
    
    const user = mockUsers.find(u => u.id === id)
    if (!user) {
      throw new Error(`用户不存在: ${id}`)
    }
    
    return {
      code: 200,
      message: 'success',
      data: user
    }
  },

  // 创建用户
  async createUser(data: CreateUserRequest): Promise<ApiResponse<User>> {
    await delay()
    
    // 检查用户名重复
    if (mockUsers.some(u => u.username === data.username)) {
      throw new Error('用户名已存在')
    }
    
    // 检查邮箱重复
    if (mockUsers.some(u => u.email === data.email)) {
      throw new Error('邮箱已存在')
    }
    
    const now = new Date().toISOString()
    const newUser: User = {
      id: generateId(),
      ...data,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
      departmentName: getDepartmentName(data.department),
      createdAt: now,
      updatedAt: now,
      lastLoginAt: undefined,
      permissions: data.permissions || []
    }
    
    mockUsers.unshift(newUser)
    
    return {
      code: 200,
      message: 'success',
      data: newUser
    }
  },

  // 更新用户
  async updateUser(data: UpdateUserRequest): Promise<ApiResponse<User>> {
    await delay()
    
    const index = mockUsers.findIndex(u => u.id === data.id)
    if (index === -1) {
      throw new Error(`用户不存在: ${data.id}`)
    }
    
    const { id, ...updateData } = data
    
    // 检查用户名重复
    if (updateData.username && mockUsers.some(u => u.id !== id && u.username === updateData.username)) {
      throw new Error('用户名已存在')
    }
    
    // 检查邮箱重复
    if (updateData.email && mockUsers.some(u => u.id !== id && u.email === updateData.email)) {
      throw new Error('邮箱已存在')
    }
    
    const updatedUser = {
      ...mockUsers[index],
      ...updateData,
      departmentName: updateData.department ? getDepartmentName(updateData.department) : mockUsers[index].departmentName,
      updatedAt: new Date().toISOString()
    }
    
    mockUsers[index] = updatedUser
    
    return {
      code: 200,
      message: 'success',
      data: updatedUser
    }
  },

  // 删除用户
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    await delay()
    
    const index = mockUsers.findIndex(u => u.id === id)
    if (index === -1) {
      throw new Error(`用户不存在: ${id}`)
    }
    
    mockUsers.splice(index, 1)
    
    return {
      code: 200,
      message: 'success',
      data: undefined
    }
  },

  // 批量删除用户
  async batchDeleteUsers(ids: string[]): Promise<ApiResponse<void>> {
    await delay()
    
    ids.forEach(id => {
      const index = mockUsers.findIndex(u => u.id === id)
      if (index !== -1) {
        mockUsers.splice(index, 1)
      }
    })
    
    return {
      code: 200,
      message: 'success',
      data: undefined
    }
  },

  // 重置密码
  async resetPassword(id: string): Promise<ApiResponse<void>> {
    await delay()
    
    const user = mockUsers.find(u => u.id === id)
    if (!user) {
      throw new Error(`用户不存在: ${id}`)
    }
    
    return {
      code: 200,
      message: 'success',
      data: undefined
    }
  },

  // 更新用户状态
  async updateUserStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<ApiResponse<User>> {
    await delay()
    
    const index = mockUsers.findIndex(u => u.id === id)
    if (index === -1) {
      throw new Error(`用户不存在: ${id}`)
    }
    
    mockUsers[index] = {
      ...mockUsers[index],
      status,
      updatedAt: new Date().toISOString()
    }
    
    return {
      code: 200,
      message: 'success',
      data: mockUsers[index]
    }
  },

  // 获取用户统计信息
  async getUserStats(): Promise<ApiResponse<{
    total: number
    active: number
    inactive: number
    suspended: number
    byRole: Record<string, number>
    bySecurityLevel: Record<string, number>
  }>> {
    await delay()
    
    const stats = mockUsers.reduce((acc, user) => {
      acc.total++
      acc[user.status]++
      acc.byRole[user.role] = (acc.byRole[user.role] || 0) + 1
      acc.bySecurityLevel[user.securityLevel] = (acc.bySecurityLevel[user.securityLevel] || 0) + 1
      return acc
    }, {
      total: 0,
      active: 0,
      inactive: 0,
      suspended: 0,
      byRole: {} as Record<string, number>,
      bySecurityLevel: {} as Record<string, number>
    })
    
    return {
      code: 200,
      message: 'success',
      data: stats
    }
  },

  // 更新用户密级
  async updateUserSecurityLevel(id: string, securityLevel: UserSecurityLevel): Promise<ApiResponse<User>> {
    await delay()
    
    const index = mockUsers.findIndex(u => u.id === id)
    if (index === -1) {
      throw new Error(`用户不存在: ${id}`)
    }
    
    const oldLevel = mockUsers[index].securityLevel
    mockUsers[index] = {
      ...mockUsers[index],
      securityLevel,
      updatedAt: new Date().toISOString()
    }
    
    // 记录密级变更历史
    const historyRecord: SecurityLevelHistoryRecord = {
      id: generateId(),
      userId: id,
      oldLevel,
      newLevel: securityLevel,
      updatedBy: 'current_user_id',
      updatedByName: '当前用户',
      updatedAt: new Date().toISOString(),
      reason: '手动调整密级'
    }
    
    securityLevelHistory.push(historyRecord)
    
    return {
      code: 200,
      message: 'success',
      data: mockUsers[index]
    }
  },

  // 批量更新用户密级
  async batchUpdateSecurityLevel(ids: string[], securityLevel: UserSecurityLevel): Promise<ApiResponse<void>> {
    await delay()
    
    const now = new Date().toISOString()
    
    ids.forEach(id => {
      const index = mockUsers.findIndex(u => u.id === id)
      if (index !== -1) {
        const oldLevel = mockUsers[index].securityLevel
        mockUsers[index] = {
          ...mockUsers[index],
          securityLevel,
          updatedAt: now
        }
        
        // 记录密级变更历史
        const historyRecord: SecurityLevelHistoryRecord = {
          id: generateId(),
          userId: id,
          oldLevel,
          newLevel: securityLevel,
          updatedBy: 'current_user_id',
          updatedByName: '当前用户',
          updatedAt: now,
          reason: '批量调整密级'
        }
        
        securityLevelHistory.push(historyRecord)
      }
    })
    
    return {
      code: 200,
      message: 'success',
      data: undefined
    }
  },

  // 获取密级变更历史
  async getSecurityLevelHistory(userId: string): Promise<ApiResponse<SecurityLevelHistoryRecord[]>> {
    await delay()
    
    const history = securityLevelHistory
      .filter(record => record.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    
    return {
      code: 200,
      message: 'success',
      data: history
    }
  }
}

// 获取部门名称的辅助函数（模拟）
function getDepartmentName(departmentId?: string): string | undefined {
  const departments: Record<string, string> = {
    '1': '总办',
    '2': '行政部', 
    '3': '人力资源部',
    '4': '财务部',
    '5': '技术部',
    '6': '市场部',
    '7': '销售部',
    '8': '客服部',
    '9': '法务部'
  }
  return departmentId ? departments[departmentId] : undefined
}
