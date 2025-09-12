/**
 * 认证配置
 */

export interface AuthConfig {
  tokenKey: string
  refreshTokenKey: string
  tokenExpiry: number
  refreshTokenExpiry: number
  autoRefreshEnabled: boolean
  autoRefreshThreshold: number
}

export const authConfig: AuthConfig = {
  tokenKey: 'access_token',
  refreshTokenKey: 'refresh_token',
  tokenExpiry: 2 * 60 * 60 * 1000, // 2小时
  refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7天
  autoRefreshEnabled: true,
  autoRefreshThreshold: 5 * 60 * 1000 // 5分钟前自动刷新
}

// JWT相关配置
export const JWT_CONFIG = {
  HEADER_PREFIX: 'Bearer',
  ALGORITHM: 'HS256'
} as const

// 权限配置
export const PERMISSIONS = {
  // 工作台权限
  DASHBOARD_VIEW: 'dashboard:view',
  
  // 会议管理权限
  MEETING_VIEW: 'meeting:view',
  MEETING_CREATE: 'meeting:create',
  MEETING_UPDATE: 'meeting:update',
  MEETING_DELETE: 'meeting:delete',
  
  // 系统管理权限
  SYSTEM_DICT: 'system:dict',
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_LOGS: 'system:logs',
  
  // 用户管理权限
  USER_VIEW: 'user:view',
  USER_MANAGE: 'user:manage',
  ROLE_MANAGE: 'role:manage',
  
  // 审计权限
  AUDIT_VIEW: 'audit:view'
} as const

// 用户角色配置
export const USER_ROLES = {
  ADMIN: 'admin',
  MEETING_ADMIN: 'meeting_admin',
  USER: 'user',
  AUDITOR: 'auditor'
} as const
