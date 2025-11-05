/**
 * 设备API服务
 */

import { httpClient } from '@/services/core/http.client'
import { API_PATHS } from '@/config'
import type { Device, PaginatedResponse } from '@/types'

/**
 * 设备查询过滤器
 */
export interface DeviceFilters {
  page?: number
  size?: number
  status?: number
  serialNumber?: string
}

export class DeviceApiService {
  private basePath = API_PATHS.DEVICES

  /**
   * 获取在线设备列表
   */
  async getOnlineDevices(
    filters: DeviceFilters = {}
  ): Promise<PaginatedResponse<Device>> {
    // 设置默认值
    const params = {
      page: filters.page || 1,
      size: filters.size || 20,
      ...filters
    }
    
    return await httpClient.get<PaginatedResponse<Device>>(this.basePath, params)
  }
}

export const deviceApi = new DeviceApiService()
