/**
 * 终端日志API服务
 */

import { httpClient } from '@/services/core/http.client'
import { API_PATHS } from '@/config'
import type {
  DeviceAuditLog,
  DeviceAuditLogFilters,
  DeviceLogStats,
  PaginatedResponse
} from '@/types'

export class DeviceLogApiService {
  private basePath = API_PATHS.DEVICE_LOGS
  private statsPath = API_PATHS.DEVICE_LOGS_STATS

  /**
   * 获取终端日志列表
   */
  async getLogs(
    filters: DeviceAuditLogFilters = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<DeviceAuditLog>> {
    const params: Record<string, any> = {
      page,
      size: pageSize
    }

    // camelCase → snake_case 转换
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.deviceSerial) params.device_serial = filters.deviceSerial
    if (filters.action) params.action = filters.action
    if (filters.meetingId) params.meeting_id = filters.meetingId
    if (filters.userId) params.user_id = filters.userId
    if (filters.startTime) params.start_time = filters.startTime
    if (filters.endTime) params.end_time = filters.endTime

    const response = await httpClient.get<any>(this.basePath, params)

    // 后端返回 { items: [...], total: N }
    const rawItems = response?.items || []
    const total = response?.total || 0

    // snake_case → camelCase 字段映射
    const items: DeviceAuditLog[] = rawItems.map((item: any) => ({
      id: item.id,
      deviceSerial: item.device_serial || item.deviceSerial,
      timestamp: item.timestamp,
      action: item.action,
      meetingId: item.meeting_id ?? item.meetingId ?? null,
      userId: item.user_id ?? item.userId ?? null,
      userName: item.user_name ?? item.userName ?? null,
      extra: item.extra ?? null,
      logDate: item.log_date || item.logDate,
      importedAt: item.imported_at || item.importedAt,
    }))

    return {
      items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }

  /**
   * 获取终端日志统计
   */
  async getStats(): Promise<DeviceLogStats> {
    const response = await httpClient.get<any>(this.statsPath)

    return {
      totalCount: response?.total_count ?? response?.totalCount ?? 0,
      deviceCount: response?.device_count ?? response?.deviceCount ?? 0,
      actionCounts: (response?.action_counts || response?.actionCounts || []).map((item: any) => ({
        action: item.action,
        count: item.count,
      })),
    }
  }
}

export const deviceLogApiService = new DeviceLogApiService()
