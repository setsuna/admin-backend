// 通用API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 分页相关
export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// 设备相关类型
export interface Device {
  id: string
  name: string
  type: string
  status: 'online' | 'offline' | 'warning' | 'error'
  ip: string
  port: number
  lastSeen: string
  createdAt: string
  updatedAt: string
  config?: Record<string, any>
}

export interface DeviceStats {
  total: number
  online: number
  offline: number
  warning: number
  error: number
}

// 配置相关类型
export interface ConfigItem {
  id: string
  name: string
  description?: string
  content: string
  type: 'yaml' | 'json' | 'text'
  createdAt: string
  updatedAt: string
}

// 用户相关类型
export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'user'
  avatar?: string
  createdAt: string
  lastLoginAt?: string
}

// 表格相关类型
export interface TableColumn<T = any> {
  key: keyof T | string
  title: string
  width?: number | string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (value: any, record: T, index: number) => React.ReactNode
}

export interface TableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: PaginationParams
  onPaginationChange?: (pagination: PaginationParams) => void
  rowKey?: keyof T | ((record: T) => string)
  className?: string
}

// 表单相关类型
export interface FormField {
  name: string
  label: string
  type: 'text' | 'password' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'switch'
  placeholder?: string
  required?: boolean
  options?: { label: string; value: any }[]
  validation?: any
}

// 通知相关类型
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  timestamp: number
}

// 主题相关类型
export type Theme = 'light' | 'dark' | 'system'

// WebSocket消息类型
export interface WebSocketMessage {
  type: string
  data: any
  timestamp: number
}

// 路由相关类型
export interface RouteItem {
  path: string
  name: string
  icon?: string
  component?: React.ComponentType
  children?: RouteItem[]
  roles?: string[]
}

// 菜单相关类型
export interface MenuItem {
  key: string
  label: string
  icon?: React.ReactNode
  path?: string
  children?: MenuItem[]
}

// 通用状态类型
export interface LoadingState {
  loading: boolean
  error: string | null
}

export interface AsyncState<T> extends LoadingState {
  data: T | null
}
