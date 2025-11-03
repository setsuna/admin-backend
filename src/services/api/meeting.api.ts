/**
 * 会议管理API服务
 */

import { httpClient } from '@/services/core/http.client'
import { API_PATHS } from '@/config'
import type {
  Meeting,
  MeetingFilters,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  UpdateMeetingStatusRequest,
  DraftMeeting,
  MeetingStats,
  MeetingTemplate,
  MeetingSettings,
  MeetingAgenda,
  MeetingSecurityLevel,
  MeetingType,
  PackagedMeeting,
  PaginatedResponse,
  OperationResult,
  FileUploadResponse,
  BatchResponse
} from '@/types'

export class MeetingApiService {
  private basePath = API_PATHS.MEETINGS
  private draftPath = API_PATHS.MEETING_DRAFTS

  /**
   * 获取会议列表
   */
  async getMeetings(
    filters: MeetingFilters = {},
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Meeting>> {
    return await httpClient.get<PaginatedResponse<Meeting>>(this.basePath, {
      ...filters,
      page,
      pageSize
    })
  }

  /**
   * 获取我的会议
   */
  async getMyMeetings(
    tabType: 'hosted' | 'participated' | 'all' = 'all',
    filters: MeetingFilters = {},
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Meeting>> {
    return await httpClient.get<PaginatedResponse<Meeting>>(`${this.basePath}/my`, {
      tabType,
      ...filters,
      page,
      pageSize
    })
  }

  /**
   * 获取单个会议详情
   */
  async getMeetingById(id: string): Promise<Meeting> {
    return await httpClient.get<Meeting>(`${this.basePath}/${id}`)
  }

  /**
   * 创建会议
   */
  async createMeeting(meetingData: CreateMeetingRequest): Promise<Meeting> {
    return await httpClient.post<Meeting>(this.basePath, meetingData)
  }

  /**
   * 使用CreateMeetingRequest创建会议
   */
  async createMeetingFromRequest(request: CreateMeetingRequest): Promise<Meeting> {
    return await httpClient.post<Meeting>(this.basePath, request)
  }

  /**
   * 更新会议
   */
  async updateMeeting(id: string, updates: UpdateMeetingRequest): Promise<Meeting> {
    return await httpClient.put<Meeting>(`${this.basePath}/${id}`, updates)
  }

  /**
   * 更新会议状态
   */
  async updateMeetingStatus(id: string, request: UpdateMeetingStatusRequest): Promise<OperationResult> {
    return await httpClient.patch<OperationResult>(`${this.basePath}/${id}/status`, request)
  }

  /**
   * 打包会议（editable → ready）
   */
  async packageMeeting(id: string): Promise<OperationResult> {
    return await httpClient.post<OperationResult>(`${this.basePath}/${id}/package`)
  }

  /**
   * 取消下发（ready → editable）
   */
  async cancelReady(id: string): Promise<OperationResult> {
    return await httpClient.delete<OperationResult>(`${this.basePath}/${id}/package`)
  }

  /**
   * 关闭会议（任意状态 → closed）
   */
  async closeMeeting(id: string): Promise<OperationResult> {
    // ✅ 改用 updateMeeting，只更新 status 字段
    const result = await this.updateMeeting(id, { status: 'closed' })
    return {
      success: true,
      message: '会议已关闭',
      data: result
    }
  }

  /**
   * 删除会议（仅关闭状态可删除）
   */
  async deleteMeeting(id: string): Promise<OperationResult> {
    return await httpClient.delete<OperationResult>(`${this.basePath}/${id}`)
  }

  /**
   * 批量操作会议
   */
  async batchUpdateMeetings(ids: string[], updates: Partial<Meeting>): Promise<BatchResponse<Meeting>> {
    return await httpClient.post<BatchResponse<Meeting>>(`${this.basePath}/batch`, {
      ids,
      action: 'update',
      data: updates
    })
  }

  // ===== 草稿会议相关 =====

  /**
   * 创建草稿会议
   */
  async createDraftMeeting(): Promise<DraftMeeting> {
    return await httpClient.post<DraftMeeting>(this.draftPath)
  }

  /**
   * 保存草稿会议数据
   */
  async saveDraftMeeting(meetingId: string, meetingData: Partial<CreateMeetingRequest>): Promise<OperationResult> {
    return await httpClient.patch<OperationResult>(`${this.draftPath}/${meetingId}`, meetingData)
  }

  /**
   * 提交草稿会议（发布）
   */
  async submitDraftMeeting(meetingId: string, meetingData: CreateMeetingRequest): Promise<Meeting> {
    return await httpClient.post<Meeting>(`${this.draftPath}/${meetingId}/submit`, meetingData)
  }

  /**
   * 删除草稿会议
   */
  async deleteDraftMeeting(meetingId: string): Promise<OperationResult> {
    return await httpClient.delete<OperationResult>(`${this.draftPath}/${meetingId}`)
  }

  // ===== 文件管理相关 =====

  /**
   * 上传会议文件
   */
  async uploadMeetingFile(
    meetingId: string, 
    file: File, 
    agendaId?: string,
    securityLevel?: MeetingSecurityLevel  // ✅ 使用正确的类型
  ): Promise<FileUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    if (agendaId) {
      formData.append('agenda_id', agendaId)  // ✅ 下划线
    }
    if (securityLevel) {
      formData.append('security_level', securityLevel)  // ✅ 添加密级
    }

    return await httpClient.upload<FileUploadResponse>(
      `${this.basePath}/${meetingId}/files`,
      formData
    )
  }

  /**
   * 获取会议文件列表
   */
  async getMeetingFiles(
    meetingId: string,
    filters?: {
      agendaId?: string  // ✅ 添加议题ID过滤
      page?: number
      size?: number
    }
  ): Promise<PaginatedResponse<FileUploadResponse>> {
    return await httpClient.get<PaginatedResponse<FileUploadResponse>>(
      `${this.basePath}/${meetingId}/files`,
      filters
    )
  }

  /**
   * 获取指定议题的所有文件（无分页）
   * 🔧 新接口：直接获取议题下的所有文件
   */
  async getAgendaFiles(
    meetingId: string,
    agendaId: string
  ): Promise<FileUploadResponse[]> {
    return await httpClient.get<FileUploadResponse[]>(
      `${this.basePath}/${meetingId}/agendas/${agendaId}/files`
    )
  }

  /**
   * 删除会议文件
   */
  async deleteMeetingFile(meetingId: string, fileId: string): Promise<OperationResult> {
    return await httpClient.delete<OperationResult>(`${this.basePath}/${meetingId}/files/${fileId}`)
  }

  // ===== 议题管理相关 =====

  /**
   * 获取会议议题列表
   */
  async getAgendas(meetingId: string): Promise<MeetingAgenda[]> {
    return await httpClient.get<MeetingAgenda[]>(`${this.basePath}/${meetingId}/agendas`)
  }

  /**
   * 获取单个议题详情
   */
  async getAgenda(meetingId: string, agendaId: string): Promise<MeetingAgenda> {
    return await httpClient.get<MeetingAgenda>(`${this.basePath}/${meetingId}/agendas/${agendaId}`)
  }

  /**
   * 创建议题
   */
  async createAgenda(meetingId: string, agendaData: {
    title: string
    description?: string
    duration?: number
    presenter?: string
    order_num: number
  }): Promise<MeetingAgenda> {
    return await httpClient.post<MeetingAgenda>(`${this.basePath}/${meetingId}/agendas`, agendaData)
  }

  /**
   * 更新议题
   */
  async updateAgenda(meetingId: string, agendaId: string, updates: {
    title?: string
    description?: string
    duration?: number
    presenter?: string
    order_num?: number
  }): Promise<MeetingAgenda> {
    return await httpClient.put<MeetingAgenda>(`${this.basePath}/${meetingId}/agendas/${agendaId}`, updates)
  }

  /**
   * 删除议题
   */
  async deleteAgenda(meetingId: string, agendaId: string): Promise<OperationResult> {
    return await httpClient.delete<OperationResult>(`${this.basePath}/${meetingId}/agendas/${agendaId}`)
  }

  /**
   * 更新议题排序
   */
  async updateAgendaOrder(meetingId: string, agendaIds: string[]): Promise<OperationResult> {
    return await httpClient.patch<OperationResult>(
      `${this.basePath}/${meetingId}/agendas/order`,
      { agenda_ids: agendaIds }
    )
  }

  // ===== 文件排序和密级管理 =====

  /**
   * 更新文件排序
   */
  async updateFileOrder(meetingId: string, agendaId: string, fileIds: string[]): Promise<OperationResult> {
    return await httpClient.patch<OperationResult>(
      `${this.basePath}/${meetingId}/files/order`,
      {
        agenda_id: agendaId,
        file_ids: fileIds
      }
    )
  }

  /**
   * 更新文件密级
   */
  async updateFileSecurityLevel(
    meetingId: string,
    fileId: string,
    securityLevel: MeetingSecurityLevel  // ✅ 使用正确的类型
  ): Promise<FileUploadResponse> {
    return await httpClient.patch<FileUploadResponse>(
      `${this.basePath}/${meetingId}/files/${fileId}`,
      { security_level: securityLevel }
    )
  }

  /**
   * 切换会议类型
   */
  async updateMeetingType(id: string, type: MeetingType): Promise<Meeting> {
    return await httpClient.patch<Meeting>(`${this.basePath}/${id}/type`, { type })
  }

  /**
   * 获取打包会议列表
   */
  async getPackagedMeetings(): Promise<PackagedMeeting[]> {
    const result = await httpClient.get<{ items: PackagedMeeting[] }>(`${this.basePath}/packaged`)
    return result.items || []
  }

  // ===== 统计和其他功能 =====

  /**
   * 获取会议统计信息
   */
  async getMeetingStats(): Promise<MeetingStats> {
    return await httpClient.get<MeetingStats>(`${this.basePath}/stats`)
  }

  /**
   * 获取会议模板
   */
  async getMeetingTemplates(): Promise<MeetingTemplate[]> {
    return await httpClient.get<MeetingTemplate[]>(`${this.basePath}/templates`)
  }

  /**
   * 根据模板创建会议
   */
  async createMeetingFromTemplate(templateId: string, data: Partial<CreateMeetingRequest>): Promise<Meeting> {
    return await httpClient.post<Meeting>(`${this.basePath}/templates/${templateId}/create`, data)
  }

  /**
   * 获取会议设置
   */
  async getMeetingSettings(): Promise<MeetingSettings> {
    return await httpClient.get<MeetingSettings>(`${this.basePath}/settings`)
  }

  /**
   * 更新会议设置
   */
  async updateMeetingSettings(settings: Partial<MeetingSettings>): Promise<OperationResult> {
    return await httpClient.put<OperationResult>(`${this.basePath}/settings`, settings)
  }
}

export const meetingApiService = new MeetingApiService()

// 别名导出，方便使用
export const meetingApi = meetingApiService
