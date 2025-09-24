/**
 * 统一配置管理
 * 整合所有配置项并提供验证机制
 */

import { z } from 'zod'

// 配置验证模式
const configSchema = z.object({
  // 应用基本信息
  app: z.object({
    name: z.string().min(1),
    title: z.string().min(1),
    version: z.string().min(1), // 放宽版本号验证
    description: z.string().min(1),
    company: z.string().optional(),
  }),

  // API配置
  api: z.object({
    baseURL: z.string().min(1), // 放宽验证，允许相对路径
    timeout: z.number().min(1000).max(60000),
    enableRequestLog: z.boolean(),
    retryCount: z.number().min(0).max(10),
    retryDelay: z.number().min(100).max(10000),
  }),

  // 认证配置
  auth: z.object({
    tokenKey: z.string().min(1),
    refreshTokenKey: z.string().min(1),
    tokenExpiry: z.number().min(1),
    refreshTokenExpiry: z.number().min(1),
    autoRefreshEnabled: z.boolean(),
    autoRefreshThreshold: z.number().min(1),
  }),

  // 环境相关
  env: z.object({
    nodeEnv: z.enum(['development', 'production', 'test']),
    isDevelopment: z.boolean(),
    isProduction: z.boolean(),
    enableDevtools: z.boolean(),
  }),

  // 业务功能配置
  features: z.object({
    pagination: z.object({
      defaultPageSize: z.number().min(1).max(100),
      pageSizeOptions: z.array(z.number().min(1).max(500)),
    }),
    upload: z.object({
      maxSize: z.number().min(1),
      allowedTypes: z.array(z.string()),
    }),
    theme: z.object({
      default: z.enum(['light', 'dark', 'system', 'gov-red']),
      available: z.array(z.enum(['light', 'dark', 'system', 'gov-red'])),
    }),
  }),
})

// 配置类型定义
export type AppConfig = z.infer<typeof configSchema>

// 环境变量读取函数
function getEnvValue(key: string, defaultValue?: string): string {
  const value = import.meta.env[key] ?? defaultValue
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is required but not defined`)
  }
  return value
}

function getEnvBoolean(key: string, defaultValue = false): boolean {
  const value = import.meta.env[key]
  if (value === undefined) return defaultValue
  return value === 'true'
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = import.meta.env[key]
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Environment variable ${key} is required but not defined`)
    }
    return defaultValue
  }
  const parsed = Number(value)
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number, got: ${value}`)
  }
  return parsed
}

// 创建配置对象
function createConfig(): AppConfig {
  const isDev = import.meta.env.DEV
  const isProd = import.meta.env.PROD
  // 安全地获取NODE_ENV，提供默认值
  const nodeEnv = (import.meta.env.NODE_ENV || (isDev ? 'development' : isProd ? 'production' : 'development')) as 'development' | 'production' | 'test'

  return {
    app: {
      name: 'admin-backend',
      title: getEnvValue('VITE_APP_TITLE', '涉密会议文档综合管控系统'),
      version: getEnvValue('VITE_APP_VERSION', '1.0.0'),
      description: '涉密会议文档综合管控系统',
      company: import.meta.env.VITE_COMPANY_NAME,
    },

    api: {
      baseURL: getEnvValue('VITE_API_BASE_URL', 'http://localhost:8080/api/v1'),
      timeout: getEnvNumber('VITE_REQUEST_TIMEOUT', 10000),
      enableRequestLog: getEnvBoolean('VITE_ENABLE_REQUEST_LOG', isDev),
      retryCount: 3,
      retryDelay: 1000,
    },

    auth: {
      tokenKey: 'access_token',
      refreshTokenKey: 'refresh_token',
      tokenExpiry: 2 * 60 * 60 * 1000, // 2小时
      refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7天
      autoRefreshEnabled: true,
      autoRefreshThreshold: 5 * 60 * 1000, // 5分钟前自动刷新
    },

    env: {
      nodeEnv,
      isDevelopment: isDev,
      isProduction: isProd,
      enableDevtools: getEnvBoolean('VITE_ENABLE_DEVTOOLS', isDev),
    },

    features: {
      pagination: {
        defaultPageSize: 20,
        pageSizeOptions: [10, 20, 50, 100],
      },
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
          'application/zip',
        ],
      },
      theme: {
        default: 'light' as const,
        available: ['light', 'dark', 'system', 'gov-red'] as const,
      },
    },
  }
}

// 配置验证函数
function validateConfig(config: unknown): AppConfig {
  try {
    return configSchema.parse(config)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('\n')
      throw new Error(`Configuration validation failed:\n${errors}`)
    }
    throw error
  }
}

// 创建并验证配置
let appConfig: AppConfig
try {
  const rawConfig = createConfig()
  
  // 开发环境下输出配置信息用于调试
  if (import.meta.env.DEV) {
    console.log('🔧 Raw Configuration:', rawConfig)
  }
  
  appConfig = validateConfig(rawConfig)
  
  // 开发环境下输出配置信息
  if (appConfig.env.isDevelopment) {
    console.log('🔧 Application Configuration:', appConfig)
  }
} catch (error) {
  console.error('❌ Configuration Error:', error)
  throw error
}

// 导出配置
export { appConfig }
export default appConfig

// 配置访问辅助函数
export const getConfig = () => appConfig
export const isProduction = () => appConfig.env.isProduction
export const isDevelopment = () => appConfig.env.isDevelopment
export const getApiBaseURL = () => appConfig.api.baseURL
export const getAppTitle = () => appConfig.app.title
export const getAppVersion = () => appConfig.app.version

// 导出常量
export * from './constants'
export * from './types'
