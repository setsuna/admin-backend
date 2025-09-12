/**
 * 认证服务
 * 处理登录、token管理、权限验证等
 */

import { httpClient } from './http.client'
import { authConfig } from '@/config/auth.config'
import { API_PATHS } from '@/config/api.config'

export interface LoginRequest {
  username: string
  password: string
  remember?: boolean
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: {
    id: string
    username: string
    email: string
    role: string
    permissions: string[]
  }
}

export interface RefreshTokenResponse {
  token: string
  refreshToken: string
}

class AuthService {
  private tokenKey = authConfig.tokenKey
  private refreshTokenKey = authConfig.refreshTokenKey
  private currentUser: LoginResponse['user'] | null = null

  /**
   * 用户登录
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>(API_PATHS.AUTH_LOGIN, credentials)
    
    if (response.data) {
      this.setToken(response.data.token)
      this.setRefreshToken(response.data.refreshToken)
      this.currentUser = response.data.user
      
      // 存储用户信息
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    
    return response.data
  }

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    try {
      await httpClient.post(API_PATHS.AUTH_LOGOUT)
    } catch (error) {
      // 忽略登出接口错误
    } finally {
      this.clearStorage()
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

    const response = await httpClient.post<RefreshTokenResponse>(API_PATHS.AUTH_REFRESH, {
      refreshToken
    })

    if (response.data) {
      this.setToken(response.data.token)
      this.setRefreshToken(response.data.refreshToken)
      return response.data.token
    }

    throw new Error('Failed to refresh token')
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<LoginResponse['user']> {
    if (this.currentUser) {
      return this.currentUser
    }

    // 从localStorage恢复
    const userStr = localStorage.getItem('user')
    if (userStr) {
      this.currentUser = JSON.parse(userStr)
      return this.currentUser!
    }

    // 从服务器获取
    const response = await httpClient.get<LoginResponse['user']>(API_PATHS.AUTH_PROFILE)
    this.currentUser = response.data
    localStorage.setItem('user', JSON.stringify(response.data))
    
    return response.data
  }

  /**
   * 检查用户权限
   */
  hasPermission(permission: string): boolean {
    if (!this.currentUser) {
      return false
    }
    return this.currentUser.permissions.includes(permission)
  }

  /**
   * 检查多个权限（需要全部拥有）
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission))
  }

  /**
   * 检查多个权限（拥有任意一个即可）
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission))
  }

  /**
   * 检查用户角色
   */
  hasRole(role: string): boolean {
    return this.currentUser?.role === role
  }

  /**
   * 获取Token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey)
  }

  /**
   * 设置Token
   */
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token)
  }

  /**
   * 获取RefreshToken
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey)
  }

  /**
   * 设置RefreshToken
   */
  setRefreshToken(token: string): void {
    localStorage.setItem(this.refreshTokenKey, token)
  }

  /**
   * 检查是否已登录
   */
  isAuthenticated(): boolean {
    const token = this.getToken()
    return !!token && !this.isTokenExpired(token)
  }

  /**
   * 检查是否可以刷新Token
   */
  canRefreshToken(): boolean {
    const refreshToken = this.getRefreshToken()
    return !!refreshToken && !this.isTokenExpired(refreshToken)
  }

  /**
   * 检查Token是否过期
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

  /**
   * 清除存储
   */
  private clearStorage(): void {
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.refreshTokenKey)
    localStorage.removeItem('user')
    this.currentUser = null
  }

  /**
   * 检查Token是否即将过期（用于自动刷新）
   */
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
}

export const authService = new AuthService()
