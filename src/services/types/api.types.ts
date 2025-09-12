/**
 * 通用API类型定义
 */

// 标准API响应格式
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
  requestId: string
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

// 分页请求参数
export interface PaginationParams {
  page?: number
  pageSize?: number
}

// 排序参数
export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 通用筛选参数
export interface FilterParams {
  keyword?: string
  status?: string
  dateRange?: [string, string]
  [key: string]: any
}

// 通用查询参数
export interface QueryParams extends PaginationParams, SortParams, FilterParams {}

// 批量操作请求
export interface BatchRequest<T = string> {
  ids: T[]
  action: string
  data?: any
}

// 批量操作响应
export interface BatchResponse<T = any> {
  success: T[]
  failed: Array<{
    id: string
    error: string
  }>
  total: number
  successCount: number
  failedCount: number
}

// 操作结果
export interface OperationResult {
  success: boolean
  message?: string
  data?: any
}

// 文件上传响应
export interface FileUploadResponse {
  id: string
  name: string
  originalName: string
  size: number
  type: string
  url: string
  thumbnailUrl?: string
  uploadedAt: string
  hash?: string
}

// 导出请求参数
export interface ExportParams {
  format?: 'excel' | 'csv' | 'pdf' | 'json'
  filters?: FilterParams
  fields?: string[]
  fileName?: string
}

// 导入结果
export interface ImportResult<T = any> {
  total: number
  success: number
  failed: number
  errors: Array<{
    row: number
    field?: string
    message: string
  }>
  data?: T[]
}

// API错误响应
export interface ApiError {
  code: number
  message: string
  details?: any
  timestamp: number
  requestId?: string
  path?: string
}

// 状态枚举
export type EntityStatus = 'enabled' | 'disabled'
export type OperationStatus = 'pending' | 'processing' | 'completed' | 'failed'

// 通用实体基础字段
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

// 带状态的实体
export interface StatusEntity extends BaseEntity {
  status: EntityStatus
}

// 软删除实体
export interface SoftDeleteEntity extends BaseEntity {
  deletedAt?: string
  deletedBy?: string
}

// 树形结构节点
export interface TreeNode<T = any> {
  id: string
  parentId?: string
  children?: TreeNode<T>[]
  data: T
}

// 字典项接口
export interface DictOption {
  label: string
  value: string | number
  disabled?: boolean
  extra?: any
}

// 验证规则
export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  message: string
}

// 表单字段配置
export interface FormField {
  name: string
  label: string
  type: 'input' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'upload'
  placeholder?: string
  options?: DictOption[]
  rules?: ValidationRule[]
  disabled?: boolean
  hidden?: boolean
  [key: string]: any
}
