/**
 * UI 组件通用类型定义
 */

import type { PaginationParams, SelectOption } from '../common/base.types'

// ========== 通知相关 ==========

/**
 * 通知类型
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

/**
 * 通知
 */
export interface Notification {
  id?: string
  type: NotificationType
  title?: string
  message: string
  duration?: number
  timestamp?: number
}

/**
 * 操作按钮
 */
export interface ActionButton {
  label: string
  onClick: () => void
  type?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}

/**
 * 批量操作
 */
export interface BatchAction {
  label: string
  icon?: React.ReactNode
  onClick: (selectedIds: string[]) => void
  danger?: boolean
  disabled?: boolean
}

// ========== 表格相关 ==========

/**
 * 表格列定义
 */
export interface TableColumn<T = any> {
  key: keyof T | string
  title: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  render?: (value: any, record: T, index: number) => React.ReactNode
}

/**
 * 表格属性
 */
export interface TableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: PaginationParams & { total?: number }
  onPaginationChange?: (pagination: PaginationParams) => void
  rowKey?: keyof T | ((record: T) => string)
  className?: string
}

// ========== 表单相关 ==========
// SelectOption 已在 base.types 中定义

/**
 * 表单字段
 */
export interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox'
  required?: boolean
  placeholder?: string
  options?: SelectOption[]
  rules?: any[]
}

// ========== 错误处理相关 ==========

/**
 * 错误信息
 */
export interface ErrorInfo {
  message: string
  isAuthError: boolean
  authData?: AuthErrorData
}

/**
 * 认证错误数据
 */
export interface AuthErrorData {
  device_fingerprint?: string
  hardware_summary?: string
  error_code?: string
  need_license?: boolean
}

/**
 * 认证错误对话框数据
 */
export interface AuthErrorDialogData {
  message: string
  deviceFingerprint?: string
  hardwareSummary?: string
  errorCode?: string
  mode: 'error' | 'warning' | 'info'
  allowClose: boolean
  showCurrentStatus: boolean
}

// ========== WebSocket 相关 ==========

/**
 * WebSocket 消息
 */
export interface WebSocketMessage {
  type: string
  data: any
  timestamp?: number
}
