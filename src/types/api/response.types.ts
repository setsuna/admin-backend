/**
 * API响应相关类型定义 (重构后支持新错误码系统)
 * 包含所有API响应的数据类型，适配1xxx-9xxx错误码分类体系
 */

import type { BaseEntity, ErrorCode, ISODateString } from '../common'

// 🆕 表单验证错误详情
export interface ValidationError {
  field: string
  message: string
  code?: number
}

// 🔄 更新：标准API响应格式 - 支持新错误码系统
export interface ApiResponse<T = any> {
  code: number           // 新错误码：200成功，1xxx-9xxx错误分类
  message: string
  data: T | null        // 错误时为null
  errors?: ValidationError[]  // 🆕 表单验证错误列表 (错误码1004时使用)
  timestamp: number
  requestId?: string
}

// 分页响应格式
export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 批量操作响应
export interface BatchResponse<T = any> {
  success: T[]
  failed: Array<{
    id: string
    error: string
    code?: ErrorCode
  }>
  total: number
  successCount: number
  failedCount: number
}

// 操作结果响应
export interface OperationResult {
  success: boolean
  message?: string
  data?: any
  code?: ErrorCode
}

// 导入结果响应
export interface ImportResult<T = any> {
  total: number
  success: number
  failed: number
  skipped: number
  errors: Array<{
    row: number
    field?: string
    message: string
    code?: ErrorCode
  }>
  data?: T[]
  reportUrl?: string
}

// 导出结果响应
export interface ExportResult {
  fileName: string
  fileUrl: string
  fileSize: number
  recordCount: number
  exportedAt: ISODateString
  expiresAt?: ISODateString
}

// 🔄 更新：文件上传响应 - 适配文件操作错误码 (3xxx)
export interface FileUploadResponse {
  id: string
  name: string
  originalName: string
  size: number
  type: string
  url: string
  thumbnailUrl?: string
  uploadedAt: ISODateString
  hash?: string
  securityLevel?: string
  maxSize?: number      // 🆕 最大文件大小限制 (用于3003错误)
  allowedTypes?: string[] // 🆕 允许的文件类型 (用于3004错误)
}

// 🔄 更新：错误响应格式 - 支持新错误码系统
export interface ApiErrorResponse {
  code: number          // 新错误码分类：1xxx-9xxx
  message: string
  data: null | AuthErrorData
  errors?: ValidationError[]  // 🔄 使用新的ValidationError类型
  timestamp: number
  requestId?: string
  path?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'  // 🆕 错误严重级别
}

// 🆕 错误分类信息
export interface ErrorClassification {
  category: 'general' | 'auth' | 'file' | 'database' | 'business' | 'authorization' | 'system'
  needsRetry: boolean
  autoRedirect?: string
  userAction?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// 授权错误的特殊数据结构
export interface AuthErrorData {
  device_fingerprint?: string
  error_code?: string
  error_message?: string
  hardware_summary?: string
  need_license?: boolean
  [key: string]: any
}

// 错误信息提取结果
export interface ErrorInfo {
  message: string
  isAuthError: boolean
  authData?: AuthErrorData
  code?: ErrorCode
}

// 授权错误弹窗的参数
export interface AuthErrorDialogData {
  message: string
  deviceFingerprint?: string
  hardwareSummary?: string
  errorCode?: string
  mode: 'error' | 'info'
  allowClose?: boolean
  showCurrentStatus?: boolean
}

// 登录响应
export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: {
    id: string
    username: string
    email: string
    role: string
    status: string
    avatar?: string
    lastLoginAt?: ISODateString
  }
}

// 刷新令牌响应
export interface RefreshTokenResponse {
  token: string
  expiresIn: number
}

// 重置密码响应
export interface ResetPasswordResponse {
  tempPassword: string
  expiresIn: number
  requireChange: boolean
}

// 统计数据响应
export interface StatsResponse {
  data: Array<{
    name: string
    value: number
    change?: number
    changeType?: 'increase' | 'decrease' | 'stable'
  }>
  summary: {
    total: number
    period: string
    updatedAt: ISODateString
  }
}

// 图表数据响应
export interface ChartDataResponse {
  categories: string[]
  series: Array<{
    name: string
    data: number[]
    color?: string
  }>
  config?: {
    unit?: string
    format?: string
    theme?: 'light' | 'dark'
  }
}

// 系统信息响应
export interface SystemInfoResponse {
  version: string
  buildTime: ISODateString
  environment: 'development' | 'staging' | 'production'
  uptime: number
  resources: {
    cpu: {
      usage: number
      cores: number
    }
    memory: {
      usage: number
      total: number
      available: number
    }
    disk: {
      usage: number
      total: number
      available: number
    }
    network: {
      inbound: number
      outbound: number
    }
  }
  services: Array<{
    name: string
    status: 'healthy' | 'unhealthy' | 'degraded'
    lastCheck: ISODateString
    responseTime?: number
  }>
}

// 健康检查响应
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: ISODateString
  checks: Array<{
    name: string
    status: 'healthy' | 'unhealthy' | 'degraded'
    message?: string
    duration: number
  }>
  uptime: number
  version: string
}

// 验证响应
export interface ValidationResponse {
  valid: boolean
  errors?: Array<{
    field: string
    message: string
    code?: ErrorCode
  }>
  suggestions?: Array<{
    field: string
    suggestion: string
  }>
}

// 搜索建议响应
export interface SearchSuggestionResponse {
  suggestions: Array<{
    text: string
    type: 'keyword' | 'user' | 'department' | 'meeting' | 'tag'
    count?: number
    highlight?: string
  }>
  total: number
}

// 权限检查响应
export interface PermissionCheckResponse {
  hasPermission: boolean
  permissions: Record<string, boolean>
  missingPermissions?: string[]
  reason?: string
}

// 配置验证响应
export interface ConfigValidationResponse {
  valid: boolean
  errors?: Array<{
    path: string
    message: string
    severity: 'error' | 'warning'
  }>
  warnings?: Array<{
    path: string
    message: string
  }>
}

// 数据同步状态响应
export interface SyncStatusResponse {
  status: 'idle' | 'syncing' | 'error' | 'completed'
  progress: number
  message?: string
  startedAt?: ISODateString
  completedAt?: ISODateString
  error?: string
  stats?: {
    total: number
    processed: number
    success: number
    failed: number
  }
}

// WebSocket消息响应
export interface WebSocketMessage<T = any> {
  type: string
  data: T
  timestamp: number
  id?: string
  userId?: string
}

// 通知响应
export interface NotificationResponse {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  content: string
  recipient: string
  read: boolean
  createdAt: ISODateString
  readAt?: ISODateString
  data?: Record<string, any>
}

// 审计日志响应
export interface AuditLogResponse extends BaseEntity {
  userId: string
  userName: string
  action: string
  resource: string
  resourceId?: string
  ip: string
  userAgent: string
  status: 'success' | 'failed'
  details?: Record<string, any>
  duration?: number
}

// 安全事件响应
export interface SecurityEventResponse extends BaseEntity {
  type: 'login_failed' | 'permission_denied' | 'suspicious_activity' | 'data_breach'
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: string
  userId?: string
  ip: string
  userAgent?: string
  description: string
  handled: boolean
  handledAt?: ISODateString
  handledBy?: string
  metadata?: Record<string, any>
}

// 备份状态响应
export interface BackupStatusResponse {
  id: string
  type: 'full' | 'incremental' | 'differential'
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  size?: number
  startedAt: ISODateString
  completedAt?: ISODateString
  filePath?: string
  error?: string
  metadata?: {
    tablesCount?: number
    recordsCount?: number
    compression?: string
    encryption?: boolean
  }
}
