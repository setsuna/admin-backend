/**
 * 授权管理 API 服务
 */

import { httpClient } from '@/services/core/http.client'
import { API_PATHS } from '@/config'
import type {
  LicenseStatus,
  ApplicationCodeData,
  ImportLicenseRequest,
  ImportLicenseResult,
  LicenseDetails,
  LicenseValidationResult,
  LicenseExportInfo,
  ResetLicenseRequest,
  ResetLicenseResult,
  RefreshLicenseResult,
} from '@/types'

/**
 * 授权 API 服务类
 */
export class LicenseApiService {
  /**
   * 获取授权状态
   */
  async getStatus(): Promise<LicenseStatus> {
    return await httpClient.get<LicenseStatus>(API_PATHS.LICENSE_STATUS)
  }

  /**
   * 获取申请码（用于生成二维码）
   */
  async getApplicationCode(): Promise<ApplicationCodeData> {
    return await httpClient.get<ApplicationCodeData>(API_PATHS.LICENSE_APPLICATION_CODE)
  }

  /**
   * 导入授权码
   */
  async import(request: ImportLicenseRequest): Promise<ImportLicenseResult> {
    return await httpClient.post<ImportLicenseResult>(API_PATHS.LICENSE_IMPORT, request)
  }

  /**
   * 验证授权
   */
  async validate(): Promise<LicenseValidationResult> {
    return await httpClient.post<LicenseValidationResult>(API_PATHS.LICENSE_VALIDATE, {})
  }

  /**
   * 刷新授权状态
   */
  async refresh(): Promise<RefreshLicenseResult> {
    return await httpClient.post<RefreshLicenseResult>(API_PATHS.LICENSE_REFRESH, {})
  }

  /**
   * 获取授权详细信息
   */
  async getDetails(): Promise<LicenseDetails> {
    return await httpClient.get<LicenseDetails>(API_PATHS.LICENSE_DETAILS)
  }

  /**
   * 导出授权信息
   */
  async export(): Promise<LicenseExportInfo> {
    return await httpClient.get<LicenseExportInfo>(API_PATHS.LICENSE_EXPORT)
  }

  /**
   * 重置授权信息
   */
  async reset(request: ResetLicenseRequest): Promise<ResetLicenseResult> {
    return await httpClient.post<ResetLicenseResult>(API_PATHS.LICENSE_RESET, request)
  }
}

// 导出单例
export const licenseApi = new LicenseApiService()
