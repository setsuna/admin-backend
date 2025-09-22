/**
 * 认证服务 - 统一处理登录、注册等认证相关功能
 * 支持Mock和真实API自动切换
 */

import { api } from './api'
import { envConfig } from '@/config/env.config'
import type { User, ApiResponse } from '@/types'

// 登录请求参数
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应
export interface LoginResponse {
  user: User
  token: string
  refreshToken?: string
  expiresIn: number
}

// Mock用户数据
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
    role: 'admin' as const,
    avatar: '',
    status: 'active' as const,
    securityLevel: 'internal' as const,
    realName: '系统管理员',
    department: '技术部',
    position: '系统管理员'
  },
  {
    id: '2',
    username: 'user',
    password: 'user123',
    email: 'user@example.com',
    role: 'user' as const,
    avatar: '',
    status: 'active' as const,
    securityLevel: 'internal' as const,
    realName: '普通用户',
    department: '业务部',
    position: '业务员'
  },
  {
    id: '3',
    username: 'meeting_admin',
    password: 'meeting123',
    email: 'meeting_admin@example.com',
    role: 'meeting_admin' as const,
    avatar: '',
    status: 'active' as const,
    securityLevel: 'confidential' as const,
    realName: '会议管理员',
    department: '会议室管理部',
    position: '会议管理员'
  },
  {
    id: '4',
    username: 'auditor',
    password: 'audit123',
    email: 'auditor@example.com',
    role: 'auditor' as const,
    avatar: '',
    status: 'active' as const,
    securityLevel: 'secret' as const,
    realName: '审计员',
    department: '审计部',
    position: '高级审计员'
  }
]

// 模拟网络延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock认证服务
class MockAuthService {
  async login(credentials: LoginRequest): Promise<ApiResponse<{
    token: string
    refresh_token: string
    expiresIn: number
    userInfo: {
      id: string
      username: string
      email: string
      roles: string[]
      permissions: string[]
    }
  }>> {
    await delay(800) // 模拟网络延迟

    const { username, password } = credentials
    
    // 查找用户
    const mockUser = mockUsers.find(
      user => user.username === username && user.password === password
    )
    
    if (!mockUser) {
      throw new Error('用户名或密码错误')
    }

    // 根据角色生成权限
    const getPermissionsByRole = (role: string): string[] => {
      const rolePermissions: Record<string, string[]> = {
        admin: [
          'user:create', 'user:read', 'user:update', 'user:delete',
          'department:create', 'department:read', 'department:update', 'department:delete',
          'dict:create', 'dict:read', 'dict:update', 'dict:delete',
          'security:read', 'security:update',
          'audit:read', 'audit:export',
          'file:read', 'file:delete',
          'meeting:create', 'meeting:read', 'meeting:update', 'meeting:delete'
        ],
        meeting_admin: [
          'meeting:create', 'meeting:read', 'meeting:update', 'meeting:delete',
          'file:read', 'file:delete'
        ],
        auditor: [
          'audit:read', 'audit:export',
          'meeting:read', 'file:read'
        ],
        user: [
          'meeting:read', 'file:read'
        ]
      }
      return rolePermissions[role] || rolePermissions.user
    }

    // 生成token
    const token = `mock_token_${Date.now()}_${Math.random().toString(36).substring(2)}`
    const refreshToken = `mock_refresh_${Date.now()}_${Math.random().toString(36).substring(2)}`
    
    // 返回标准格式
    return {
      code: 200,
      message: '登录成功',
      data: {
        token,
        refresh_token: refreshToken,
        expiresIn: 86400,
        userInfo: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          roles: [mockUser.role],
          permissions: getPermissionsByRole(mockUser.role)
        }
      }
    }
  }

  async logout(): Promise<ApiResponse<null>> {
    await delay(200)
    return {
      code: 200,
      message: '注销成功',
      data: null
    }
  }

  async refreshToken(_refreshToken: string): Promise<ApiResponse<{ token: string; expiresIn: number }>> {
    await delay(300)
    return {
      code: 200,
      message: '刷新成功',
      data: {
        token: `refresh_token_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        expiresIn: 86400
      }
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User> | null> {
    await delay(200)
    const token = localStorage.getItem('token')
    if (!token || !token.startsWith('mock_token_')) {
      return null
    }

    // 从token中解析用户ID (这里简化处理)
    const userId = '1' // 默认返回admin用户
    const mockUser = mockUsers.find(user => user.id === userId)
    
    if (!mockUser) return null

    const user: User = {
      id: mockUser.id,
      username: mockUser.username,
      email: mockUser.email,
      role: mockUser.role,
      avatar: mockUser.avatar,
      status: mockUser.status,
      securityLevel: mockUser.securityLevel,
      realName: mockUser.realName,
      department: mockUser.department,
      position: mockUser.position,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return {
      code: 200,
      message: '获取成功',
      data: user
    }
  }
}

// 真实认证服务
class RealAuthService {
  async login(credentials: LoginRequest): Promise<ApiResponse<{
    token: string
    refresh_token: string
    expiresIn: number
    userInfo: {
      id: string
      username: string
      email: string
      roles: string[]
      permissions: string[]
    }
  }>> {
    const response = await api.post('/auth/login', credentials)
    return response.data // 直接返回后端的标准格式
  }

  async logout(): Promise<ApiResponse<null>> {
    const response = await api.post('/auth/logout')
    return response.data
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string; expiresIn: number }>> {
    const response = await api.post('/auth/refresh', { refreshToken })
    return response.data
  }

  async getCurrentUser(): Promise<ApiResponse<User> | null> {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      return null
    }
  }
}

// 创建认证服务实例
const createAuthService = () => {
  if (envConfig.ENABLE_MOCK) {
    console.log('🔐 Auth Service: Using Mock')
    return new MockAuthService()
  } else {
    console.log('🌐 Auth Service: Using Real API')
    return new RealAuthService()
  }
}

export const authService = createAuthService()

// 便捷方法
export const auth = {
  /**
   * 用户登录
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const apiResponse = await authService.login(credentials)
      
      // 检查API响应
      if (apiResponse.code !== 200) {
        throw new Error(apiResponse.message || '登录失败')
      }
      
      const loginData = apiResponse.data
      if (!loginData || !loginData.userInfo || !loginData.token) {
        throw new Error('登录响应数据格式错误')
      }
      
      // 将userInfo转换为User类型
      const user: User = {
        id: loginData.userInfo.id,
        username: loginData.userInfo.username,
        email: loginData.userInfo.email,
        role: loginData.userInfo.roles?.[0] || 'user',
        avatar: '', // 后端暂时不返回头像
        status: 'active' as const,
        securityLevel: 'internal' as const, // 默认值
        // 后端暂时没有这些字段，使用默认值
        realName: loginData.userInfo.username,
        department: '',
        position: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // 新增权限信息
        permissions: loginData.userInfo.permissions
      }
      
      // 保存token到localStorage
      localStorage.setItem('token', loginData.token)
      if (loginData.refresh_token) {
        localStorage.setItem('refreshToken', loginData.refresh_token)
      }
      
      // 保存权限信息到权限store
      try {
        const { usePermissionStore } = await import('@/store')
        const { setPermissions } = usePermissionStore.getState()
        setPermissions(loginData.userInfo.permissions)
      } catch (error) {
        console.warn('Failed to update permissions store:', error)
      }
      
      return {
        user,
        token: loginData.token,
        refreshToken: loginData.refresh_token,
        expiresIn: loginData.expiresIn
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  },

  /**
   * 用户注销
   */
  async logout(): Promise<void> {
    try {
      const apiResponse = await authService.logout()
      if (apiResponse && apiResponse.code !== 200) {
        console.warn('Logout API warning:', apiResponse.message)
      }
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      // 无论是否成功，都清除本地数据
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      
      // 清除权限信息
      try {
        const { usePermissionStore } = await import('@/store')
        const { clearPermissions } = usePermissionStore.getState()
        clearPermissions()
      } catch (error) {
        console.warn('Failed to clear permissions store:', error)
      }
    }
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const apiResponse = await authService.getCurrentUser()
      if (!apiResponse || apiResponse.code !== 200) {
        return null
      }
      return apiResponse.data
    } catch (error) {
      console.error('Get current user failed:', error)
      return null
    }
  },

  /**
   * 刷新token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) return false

      const apiResponse = await authService.refreshToken(refreshToken)
      if (apiResponse.code !== 200) {
        return false
      }
      
      localStorage.setItem('token', apiResponse.data.token)
      return true
    } catch (error) {
      console.error('Refresh token failed:', error)
      // 刷新失败，清除所有token
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      return false
    }
  },

  /**
   * 检查是否已登录
   */
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token')
    return !!token
  },

  /**
   * 获取当前token
   */
  getToken(): string | null {
    return localStorage.getItem('token')
  }
}
