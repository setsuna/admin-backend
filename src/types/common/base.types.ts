/**
 * 基础通用类型定义
 * 包含系统中最基础的类型定义
 */

// 时间相关
export type ISODateString = string
export type UnixTimestamp = number

// 状态枚举
export type EntityStatus = 'enabled' | 'disabled'
export type ActiveStatus = 'active' | 'inactive' | 'suspended'
export type OperationStatus = 'pending' | 'processing' | 'completed' | 'failed'

// 主题类型
export type Theme = 'light' | 'dark' | 'system' | 'gov-red'

// 安全等级
export type UserSecurityLevel = 'unknown' | 'internal' | 'confidential' | 'secret'
export type SystemSecurityLevel = 'internal' | 'confidential' | 'secret'
export type MeetingSecurityLevel = 'internal' | 'confidential' | 'secret'

// 通用实体基础字段
export interface BaseEntity {
  id: string
  createdAt: ISODateString
  updatedAt: ISODateString
  createdBy?: string
  updatedBy?: string
}

// 带状态的实体
export interface StatusEntity extends BaseEntity {
  status: EntityStatus
}

// 软删除实体
export interface SoftDeleteEntity extends BaseEntity {
  deletedAt?: ISODateString
  deletedBy?: string
}

// 分页参数
export interface PaginationParams {
  page: number
  pageSize: number
}

// 排序参数
export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 时间范围
export interface TimeRange {
  start: ISODateString
  end: ISODateString
}

// 通用筛选参数基础接口
export interface BaseFilters {
  keyword?: string
  dateRange?: [ISODateString, ISODateString]
  [key: string]: any
}

// 树形结构节点
export interface TreeNode<T = any> extends BaseEntity {
  parentId?: string
  level: number
  path: string
  children?: TreeNode<T>[]
  data?: T
}

// 字典选项
export interface SelectOption<T = string | number> {
  label: string
  value: T
  disabled?: boolean
  extra?: Record<string, any>
}

// ID值类型
export type ID = string | number

// 文件信息
export interface FileInfo {
  id: string
  name: string
  originalName: string
  size: number
  type: string
  url: string
  thumbnailUrl?: string
  hash?: string
  uploadedAt: ISODateString
  uploadedBy?: string
}

// 地理位置
export interface GeoLocation {
  latitude: number
  longitude: number
  address?: string
  city?: string
  country?: string
}

// 联系信息
export interface ContactInfo {
  phone?: string
  email?: string
  address?: string
  website?: string
}

// 统计数据基础结构
export interface StatsData {
  total: number
  [key: string]: number
}

// 错误码枚举
export enum ErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  
  // 认证错误
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  LOGIN_REQUIRED = 'LOGIN_REQUIRED',
  
  // 资源错误
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  RESOURCE_LOCKED = 'RESOURCE_LOCKED',
  
  // 业务错误
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  OPERATION_FAILED = 'OPERATION_FAILED'
}

// 操作类型
export type OperationType = 'create' | 'read' | 'update' | 'delete' | 'export' | 'import' | 'batch'

// 权限动作
export type PermissionAction = 'read' | 'write' | 'delete' | 'manage' | 'export' | 'import'

// 日志级别
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

// 环境类型
export type Environment = 'development' | 'staging' | 'production'

// 主题类型
export type ThemeMode = 'light' | 'dark' | 'system' | 'gov-red'

// 语言类型
export type Language = 'zh-CN' | 'en-US'

// 用户设备类型（前端设备）
export type ClientDeviceType = 'desktop' | 'tablet' | 'mobile'

// 浏览器类型
export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'ie' | 'unknown'

// 操作系统类型
export type OSType = 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'unknown'
