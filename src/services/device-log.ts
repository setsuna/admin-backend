/**
 * 终端日志业务服务
 */

import { deviceLogApiService } from './api/device-log.api'
import type {
  DeviceAuditLog,
  DeviceAuditLogFilters,
  DeviceLogStats,
  PaginatedResponse
} from '@/types'

class DeviceLogService {
  /**
   * 获取终端日志列表
   */
  async getLogs(
    params: DeviceAuditLogFilters & { page?: number; pageSize?: number } = {}
  ): Promise<PaginatedResponse<DeviceAuditLog>> {
    const { page = 1, pageSize = 20, ...filters } = params
    return deviceLogApiService.getLogs(filters, page, pageSize)
  }

  /**
   * 获取终端日志统计
   */
  async getStats(): Promise<DeviceLogStats> {
    return deviceLogApiService.getStats()
  }
}

export const deviceLogService = new DeviceLogService()
