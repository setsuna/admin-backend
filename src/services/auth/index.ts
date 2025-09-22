/**
 * 统一认证服务适配器
 * 生产环境使用 core/auth.service.ts，开发环境保持兼容
 */

import { envConfig } from '@/config/env.config'
import type { LoginRequest } from '../auth'

// 根据环境动态导入
const getAuthService = async () => {
  if (envConfig.ENABLE_MOCK) {
    // 开发环境：使用原auth.ts（包含Mock）
    const { auth } = await import('../auth')
    return auth
  } else {
    // 生产环境：使用新的AuthService
    const { authService } = await import('../core/auth.service')
    
    // 创建兼容层，解决方法名差异
    return {
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
      
      // 解决方法名不一致问题
      isLoggedIn() {
        return authService.isAuthenticated()
      },
      
      getToken() {
        return authService.getToken()
      }
    }
  }
}

// 导出统一的auth实例
export const auth = await getAuthService()

// 同时导出新服务（供需要的地方使用）
export { authService } from '../core/auth.service'
