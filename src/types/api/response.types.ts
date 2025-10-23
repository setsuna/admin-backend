/**
 * API 响应类型定义
 */

// ========== 通用响应 ==========

/**
 * 分页信息
 */
export interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationInfo
}

/**
 * 操作结果
 */
export interface OperationResult {
  success: boolean
  message: string
  data?: any
}

/**
 * 批量操作响应
 */
export interface BatchResponse<T> {
  success: boolean
  message: string
  successCount: number
  failCount: number
  results: Array<{
    id: string
    success: boolean
    data?: T
    error?: string
  }>
}

/**
 * 文件上传响应
 */
export interface FileUploadResponse {
  id: string
  filename: string
  originalName: string
  size: number
  mimeType: string
  url: string
  uploadedAt: string
}
