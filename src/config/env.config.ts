/**
 * 环境变量管理
 */

export interface EnvConfig {
  NODE_ENV: string
  DEV: boolean
  PROD: boolean
  API_BASE_URL: string
  REQUEST_TIMEOUT: number
  ENABLE_REQUEST_LOG: boolean
}

export const envConfig: EnvConfig = {
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  REQUEST_TIMEOUT: Number(import.meta.env.VITE_REQUEST_TIMEOUT) || 10000,
  ENABLE_REQUEST_LOG: import.meta.env.VITE_ENABLE_REQUEST_LOG === 'true'
}

// 应用配置
export const appConfig = {
  name: 'Admin Backend',
  version: '1.0.0',
  description: '涉密会议文档综合管控系统',
  
  // 分页默认配置
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100]
  },
  
  // 文件上传配置
  upload: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'video/mp4',
      'audio/mpeg',
      'audio/wav',
      'application/zip'
    ]
  },
  
  // 主题配置
  theme: {
    default: 'light' as const,
    available: ['light', 'dark', 'system', 'gov-red'] as const
  }
}

// 开发环境配置
export const devConfig = {
  enableDevtools: envConfig.DEV,
  debugMode: envConfig.DEV && envConfig.ENABLE_REQUEST_LOG
}
