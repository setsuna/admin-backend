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
  async createMeeting(meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meeting> {
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
    agendaId?: string
  ): Promise<FileUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    if (agendaId) {
      formData.append('agendaId', agendaId)
    }

    return await httpClient.upload<FileUploadResponse>(
      `${this.basePath}/${meetingId}/files`,
      formData
    )
  }

  /**
   * 获取会议文件列表
   */
  async getMeetingFiles(meetingId: string): Promise<FileUploadResponse[]> {
    return await httpClient.get<FileUploadResponse[]>(`${this.basePath}/${meetingId}/files`)
  }

  /**
   * 删除会议文件
   */
  async deleteMeetingFile(meetingId: string, fileId: string): Promise<OperationResult> {
    return await httpClient.delete<OperationResult>(`${this.basePath}/${meetingId}/files/${fileId}`)
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
