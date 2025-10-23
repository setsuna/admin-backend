/**
 * UI 组件通用类型定义
 */

import type { PaginationParams } from '../api/request.types'

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

/**
 * 选项类型
 */
export interface SelectOption<T = any> {
  label: string
  value: T
  disabled?: boolean
}

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
