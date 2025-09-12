/**
 * API基础配置
 */

export interface ApiConfig {
  baseURL: string
  timeout: number
  enableRequestLog: boolean
  retryCount: number
  retryDelay: number
}

export const apiConfig: ApiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: Number(import.meta.env.VITE_REQUEST_TIMEOUT) || 10000,
  enableRequestLog: import.meta.env.VITE_ENABLE_REQUEST_LOG === 'true',
  retryCount: 3,
  retryDelay: 1000
}

// API路径前缀配置
export const API_PATHS = {
  // 数据字典
  DICTIONARIES: '/dictionaries',
  
  // 会议管理
  MEETINGS: '/meetings',
  MEETING_DRAFTS: '/meetings/drafts',
  MEETING_FILES: '/meetings/{id}/files',
  
  // 用户管理
  USERS: '/users',
  ROLES: '/roles',
  PERMISSIONS: '/permissions',
  
  // 认证相关
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_PROFILE: '/auth/profile',
  
  // 文件上传
  FILE_UPLOAD: '/files/upload',
  FILE_DOWNLOAD: '/files/{id}/download'
} as const

// HTTP状态码配置
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const
