/**
 * 归档管理 API 服务
 */

import { httpClient } from '@/services/core/http.client'
import { API_PATHS } from '@/config'
import type {
  Archive,
  ArchiveFilters,
  ArchiveStatus,
  PaginatedResponse,
} from '@/types'

/**
 * 后端返回的归档数据（snake_case）
 */
interface ArchiveResponse {
  id: string
  meeting_id: string
  meeting_name: string
  meeting_start_time: string
  meeting_end_time: string
  security_level: string
  organizer_name: string
  status: ArchiveStatus
  signatures_count: number
  edited_files_count: number
  records_count: number
  votes_count: number
  archived_devices: string[]
  created_at: string
  updated_at: string
}

/**
 * 转换后端响应为前端类型
 */
function transformArchive(data: ArchiveResponse): Archive {
  return {
    id: data.id,
    meetingId: data.meeting_id,
    meetingName: data.meeting_name,
    meetingStartTime: data.meeting_start_time,
    meetingEndTime: data.meeting_end_time,
    securityLevel: data.security_level as Archive['securityLevel'],
    organizerName: data.organizer_name,
    status: data.status,
    signaturesCount: data.signatures_count,
    editedFilesCount: data.edited_files_count,
    recordsCount: data.records_count,
    votesCount: data.votes_count,
    archivedDevices: data.archived_devices || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

/**
 * 归档导出响应
 */
export interface ArchiveExportResult {
  password: string
  file_name: string
  download_url: string
}

export class ArchiveApiService {
  private basePath = API_PATHS.ARCHIVES

  /**
   * 获取归档列表
   */
  async getArchives(
    filters: ArchiveFilters = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<Archive>> {
    const response = await httpClient.get<PaginatedResponse<ArchiveResponse>>(this.basePath, {
      keyword: filters.keyword,
      status: filters.status,
      security_level: filters.securityLevel,
      page,
      size: pageSize,
    })

    return {
      ...response,
      items: (response.items || []).map(transformArchive),
    }
  }

  /**
   * 获取归档详情
   */
  async getArchive(id: string): Promise<Archive> {
    const response = await httpClient.get<ArchiveResponse>(`${this.basePath}/${id}`)
    return transformArchive(response)
  }

  /**
   * 导出归档（第一步：获取密码和下载链接）
   */
  async exportArchive(id: string): Promise<ArchiveExportResult> {
    return await httpClient.post<ArchiveExportResult>(`${this.basePath}/${id}/export`)
  }

  /**
   * 删除归档
   */
  async deleteArchive(id: string): Promise<{ message: string }> {
    return await httpClient.delete<{ message: string }>(`${this.basePath}/${id}`)
  }
}

export const archiveApiService = new ArchiveApiService()
export const archiveApi = archiveApiService
