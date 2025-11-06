/**
 * 授权管理相关类型定义
 */

// 授权状态响应（后端实际返回的扁平结构）
export interface LicenseStatus {
  valid: boolean
  message: string
  current_time: string
  cache_time: string
  expire_date: string
  days_remaining: number
  device_count: number
  license_type?: string
}

// 申请码数据
export interface ApplicationCodeData {
  application_code: string
  hardware_info: string
  generated_at: string
  device_fingerprint?: string
}

// 授权导入请求
export interface ImportLicenseRequest {
  license_key: string
}

// 授权导入结果
export interface ImportLicenseResult {
  success: boolean
  message: string
  license_info?: {
    expire_date?: string
    remaining_days?: number
    license_type?: string
    device_count?: number
  }
}

// 授权详细信息
export interface LicenseDetails {
  valid: boolean
  license_key?: string
  expire_date?: string
  remaining_days?: number
  hardware_info?: string
  license_type?: string
  issued_at?: string
  features?: string[]
  device_count?: number
}

// 授权验证结果
export interface LicenseValidationResult {
  valid: boolean
  message: string
  expire_date?: string
  remaining_days?: number
}

// 授权导出信息
export interface LicenseExportInfo {
  license_key: string
  exported_at: string
  hardware_info?: string
  expire_date?: string
}

// 授权重置请求
export interface ResetLicenseRequest {
  confirm: boolean
}

// 授权重置结果
export interface ResetLicenseResult {
  success: boolean
  message: string
}

// 授权刷新结果
export interface RefreshLicenseResult {
  success: boolean
  message: string
  license_info?: LicenseStatus
}
