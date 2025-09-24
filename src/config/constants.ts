/**
 * 应用常量配置
 * 包含所有业务相关的常量定义
 */

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
  FILE_DOWNLOAD: '/files/{id}/download',
  
  // 配置管理
  CONFIGS: '/configs',
  CONFIG_VALIDATE_YAML: '/configs/validate-yaml',
  CONFIG_EXPORT: '/configs/{id}/export',
  CONFIG_IMPORT: '/configs/import',
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
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

// JWT相关配置
export const JWT_CONFIG = {
  HEADER_PREFIX: 'Bearer',
  ALGORITHM: 'HS256',
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
  MEETING_EXPORT: 'meeting:export',
  MEETING_IMPORT: 'meeting:import',
  
  // 系统管理权限
  SYSTEM_DICT: 'system:dict',
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_LOGS: 'system:logs',
  SYSTEM_BACKUP: 'system:backup',
  
  // 用户管理权限
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE: 'user:manage',
  ROLE_MANAGE: 'role:manage',
  PERMISSION_MANAGE: 'permission:manage',
  
  // 审计权限
  AUDIT_VIEW: 'audit:view',
  AUDIT_EXPORT: 'audit:export',
  
  // 文件管理权限
  FILE_UPLOAD: 'file:upload',
  FILE_DOWNLOAD: 'file:download',
  FILE_DELETE: 'file:delete',
} as const

// 用户角色配置
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MEETING_ADMIN: 'meeting_admin',
  USER: 'user',
  AUDITOR: 'auditor',
  GUEST: 'guest',
} as const

// 会议状态配置
export const MEETING_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  POSTPONED: 'postponed',
} as const

// 文件类型配置
export const FILE_TYPES = {
  DOCUMENT: 'document',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  ARCHIVE: 'archive',
  OTHER: 'other',
} as const

// 通知类型配置
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const

// 主题配置
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
  GOV_RED: 'gov-red',
} as const

// 数据字典类型
export const DICT_TYPES = {
  MEETING_TYPE: 'meeting_type',
  MEETING_LEVEL: 'meeting_level',
  DOCUMENT_TYPE: 'document_type',
  USER_STATUS: 'user_status',
  ORGANIZATION: 'organization',
} as const

// 操作日志类型
export const LOG_TYPES = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  EXPORT: 'export',
  IMPORT: 'import',
  DOWNLOAD: 'download',
  UPLOAD: 'upload',
} as const

// 分页配置常量
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  MIN_PAGE_SIZE: 1,
  MAX_PAGE_SIZE: 500,
  DEFAULT_SIZE_OPTIONS: [10, 20, 50, 100] as const,
} as const

// 表格配置
export const TABLE = {
  DEFAULT_SORT_ORDER: 'desc' as const,
  MAX_COLUMNS: 20,
  ROW_HEIGHT: {
    COMPACT: 32,
    NORMAL: 48,
    COMFORTABLE: 64,
  },
} as const

// 表单验证配置
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 20,
  USERNAME_MIN_LENGTH: 2,
  USERNAME_MAX_LENGTH: 20,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^1[3-9]\d{9}$/,
} as const

// 缓存键配置
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  USER_PERMISSIONS: 'user_permissions',
  DICTIONARIES: 'dictionaries',
  SYSTEM_CONFIG: 'system_config',
  THEME_PREFERENCE: 'theme_preference',
} as const

// 错误码配置
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
} as const
