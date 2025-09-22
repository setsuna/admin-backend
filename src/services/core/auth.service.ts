/**
 * 认证服务 - 统一架构版本
 */

import { api } from '../api'
import { authConfig } from '@/config/auth.config'
import { API_PATHS } from '@/config/api.config'
import type { User, ApiResponse } from '@/types'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: User
  expiresIn?: number
}

class AuthService {
  private tokenKey = authConfig.tokenKey
  private refreshTokenKey = authConfig.refreshTokenKey
  private currentUser: User | null = null

  /**
   * 用户登录
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post(API_PATHS.AUTH_LOGIN, credentials)
      const apiResponse = response.data as ApiResponse<any>
      
      if (apiResponse.code === 200 && apiResponse.data) {
        const { token, refresh_token, expiresIn, userInfo } = apiResponse.data
        
        // 映射后端数据结构到前端格式
        const user: User = {
          id: userInfo.id,
          username: userInfo.username,
          email: userInfo.email,
          role: userInfo.roles[0] || 'user',
          avatar: '',
          department: '',
          position: '',
          status: 'active',
          securityLevel: 'internal',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          permissions: userInfo.permissions
        }
        
        const loginResult: LoginResponse = {
          token,
          refreshToken: refresh_token,
          user,
          expiresIn
        }
        
        this.setToken(token)
        this.setRefreshToken(refresh_token)
        this.currentUser = user
        
        localStorage.setItem('user', JSON.stringify(user))
        
        // 更新权限store
        try {
          const { usePermissionStore } = await import('@/store')
          const { setPermissions } = usePermissionStore.getState()
          setPermissions(userInfo.permissions || [])
        } catch (error) {
          console.warn('Failed to update permissions store:', error)
        }
        
        return loginResult
      } else {
        throw new Error(apiResponse.message || '登录失败')
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    try {
      await api.post(API_PATHS.AUTH_LOGOUT)
    } catch (error) {
      console.warn('Logout API warning:', error)
    } finally {
      this.clearStorage()
      
      try {
        const { usePermissionStore } = await import('@/store')
        const { clearPermissions } = usePermissionStore.getState()
        clearPermissions()
      } catch (error) {
        console.warn('Failed to clear permissions store:', error)
      }
    }
  }

  /**
   * 刷新Token
   */
  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await api.post(API_PATHS.AUTH_REFRESH, { refreshToken })
      const apiResponse = response.data as ApiResponse<{ token: string; refreshToken: string }>

      if (apiResponse.code === 200 && apiResponse.data) {
        this.setToken(apiResponse.data.token)
        this.setRefreshToken(apiResponse.data.refreshToken)
        return apiResponse.data.token
      }

      throw new Error('Failed to refresh token')
    } catch (error) {
      console.error('Refresh token failed:', error)
      this.clearStorage()
      throw error
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      if (this.currentUser) {
        return this.currentUser
      }

      const userStr = localStorage.getItem('user')
      if (userStr) {
        this.currentUser = JSON.parse(userStr)
        return this.currentUser!
      }

      const response = await api.get(API_PATHS.AUTH_PROFILE)
      const apiResponse = response.data as ApiResponse<User>
      
      if (apiResponse.code === 200 && apiResponse.data) {
        this.currentUser = apiResponse.data
        localStorage.setItem('user', JSON.stringify(apiResponse.data))
        return apiResponse.data
      }
      
      return null
    } catch (error) {
      console.error('Get current user failed:', error)
      return null
    }
  }

  /**
   * 权限检查
   */
  hasPermission(permission: string): boolean {
    return this.currentUser?.permissions?.includes(permission) || false
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission))
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission))
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role
  }

  /**
   * Token管理
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey)
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token)
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey)
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.refreshTokenKey, token)
  }

  /**
   * 状态检查
   */
  isAuthenticated(): boolean {
    const token = this.getToken()
    return !!token && !this.isTokenExpired(token)
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated()
  }

  canRefreshToken(): boolean {
    const refreshToken = this.getRefreshToken()
    return !!refreshToken && !this.isTokenExpired(refreshToken)
  }

  shouldRefreshToken(): boolean {
    const token = this.getToken()
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      const timeUntilExpiry = payload.exp - currentTime
      
      return timeUntilExpiry < authConfig.autoRefreshThreshold / 1000
    } catch {
      return false
    }
  }

  /**
   * 私有方法
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch {
      return true
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.refreshTokenKey)
    localStorage.removeItem('user')
    this.currentUser = null
  }
}

export const authService = new AuthService()

// 兼容性导出
export const auth = {
  async login(credentials: LoginRequest) {
    const result = await authService.login(credentials)
    return {
      user: result.user,
      token: result.token,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn || 86400
    }
  },
  
  async logout() {
    return authService.logout()
  },
  
  async getCurrentUser() {
    return authService.getCurrentUser()
  },
  
  async refreshToken() {
    try {
      const newToken = await authService.refreshToken()
      return !!newToken
    } catch {
      return false
    }
  },
  
  isLoggedIn() {
    return authService.isLoggedIn()
  },
  
  getToken() {
    return authService.getToken()
  }
}
