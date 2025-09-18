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
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    await delay(800) // 模拟网络延迟

    const { username, password } = credentials
    
    // 查找用户
    const mockUser = mockUsers.find(
      user => user.username === username && user.password === password
    )
    
    if (!mockUser) {
      throw new Error('用户名或密码错误')
    }

    // 生成token
    const token = `mock_token_${Date.now()}_${Math.random().toString(36).substring(2)}`
    
    // 构造用户信息
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
      user,
      token,
      expiresIn: 24 * 60 * 60 * 1000 // 24小时
    }
  }

  async logout(): Promise<void> {
    await delay(200)
    // Mock注销逻辑
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; expiresIn: number }> {
    await delay(300)
    return {
      token: `refresh_token_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      expiresIn: 24 * 60 * 60 * 1000
    }
  }

  async getCurrentUser(): Promise<User | null> {
    await delay(200)
    const token = localStorage.getItem('token')
    if (!token || !token.startsWith('mock_token_')) {
      return null
    }

    // 从token中解析用户ID (这里简化处理)
    const userId = '1' // 默认返回admin用户
    const mockUser = mockUsers.find(user => user.id === userId)
    
    if (!mockUser) return null

    return {
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
  }
}

// 真实认证服务
class RealAuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login', credentials)
      
      console.log('Login API Response:', response)
      
      // 后端返回格式: { code: 200, message: "登录成功", data: { token, refreshToken, expiresIn, userInfo } }
      if (response.code !== 200) {
        throw new Error(response.message || '登录失败')
      }
      
      const loginData = response.data
      if (!loginData || !loginData.userInfo || !loginData.token) {
        throw new Error('登录响应数据格式错误')
      }
      
      // 将后端的userInfo转换为前端期望的User格式
      const user: User = {
        id: loginData.userInfo.id,
        username: loginData.userInfo.username,
        email: loginData.userInfo.email,
        role: loginData.userInfo.roles?.[0] || 'user', // 防御性处理
        avatar: loginData.userInfo.avatar || '', // 处理null值
        status: 'active' as const,
        securityLevel: 'internal' as const, // 默认值，后续从permissions推断
        realName: loginData.userInfo.realName || loginData.userInfo.username,
        department: loginData.userInfo.department || '',
        position: loginData.userInfo.position || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      return {
        user,
        token: loginData.token,
        refreshToken: loginData.refreshToken,
        expiresIn: loginData.expiresIn
      }
    } catch (error) {
      console.error('RealAuthService login error:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('登录失败，请检查网络连接或后端服务')
    }
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; expiresIn: number }> {
    const response = await api.post<ApiResponse<{ token: string; expiresIn: number }>>(
      '/auth/refresh', 
      { refreshToken }
    )
    return response.data.data
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me')
      return response.data.data
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
      const result = await authService.login(credentials)
      
      // 保存token到localStorage
      localStorage.setItem('token', result.token)
      if (result.refreshToken) {
        localStorage.setItem('refreshToken', result.refreshToken)
      }
      
      return result
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
      await authService.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      // 无论API调用是否成功，都清除本地token
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    }
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      return await authService.getCurrentUser()
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

      const result = await authService.refreshToken(refreshToken)
      localStorage.setItem('token', result.token)
      
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
