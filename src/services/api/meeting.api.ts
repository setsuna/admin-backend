/**
 * 会议管理API服务
 */

import { httpClient } from '@/services/core/http.client'
import { API_PATHS } from '@/config/api.config'
import {
  Meeting,
  MeetingFilters,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  UpdateMeetingStatusRequest,
  DraftMeeting,
  MeetingStats,
  MeetingTemplate,
  MeetingSettings
} from '@/services/types/meeting.types'
import {
  PaginatedResponse,
  OperationResult,
  FileUploadResponse,
  BatchResponse
} from '@/services/types/api.types'

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
    const response = await httpClient.get<PaginatedResponse<Meeting>>(this.basePath, {
      ...filters,
      page,
      pageSize
    })
    return response.data
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
    const response = await httpClient.get<PaginatedResponse<Meeting>>(`${this.basePath}/my`, {
      tabType,
      ...filters,
      page,
      pageSize
    })
    return response.data
  }

  /**
   * 获取单个会议详情
   */
  async getMeetingById(id: string): Promise<Meeting> {
    const response = await httpClient.get<Meeting>(`${this.basePath}/${id}`)
    return response.data
  }

  /**
   * 创建会议
   */
  async createMeeting(meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meeting> {
    const response = await httpClient.post<Meeting>(this.basePath, meetingData)
    return response.data
  }

  /**
   * 使用CreateMeetingRequest创建会议
   */
  async createMeetingFromRequest(request: CreateMeetingRequest): Promise<Meeting> {
    const response = await httpClient.post<Meeting>(this.basePath, request)
    return response.data
  }

  /**
   * 更新会议
   */
  async updateMeeting(id: string, updates: UpdateMeetingRequest): Promise<Meeting> {
    const response = await httpClient.put<Meeting>(`${this.basePath}/${id}`, updates)
    return response.data
  }

  /**
   * 更新会议状态
   */
  async updateMeetingStatus(id: string, request: UpdateMeetingStatusRequest): Promise<OperationResult> {
    const response = await httpClient.patch<OperationResult>(`${this.basePath}/${id}/status`, request)
    return response.data
  }

  /**
   * 删除会议（仅关闭状态可删除）
   */
  async deleteMeeting(id: string): Promise<OperationResult> {
    const response = await httpClient.delete<OperationResult>(`${this.basePath}/${id}`)
    return response.data
  }

  /**
   * 批量操作会议
   */
  async batchUpdateMeetings(ids: string[], updates: Partial<Meeting>): Promise<BatchResponse<Meeting>> {
    const response = await httpClient.post<BatchResponse<Meeting>>(`${this.basePath}/batch`, {
      ids,
      action: 'update',
      data: updates
    })
    return response.data
  }

  // ===== 草稿会议相关 =====

  /**
   * 创建草稿会议
   */
  async createDraftMeeting(): Promise<DraftMeeting> {
    const response = await httpClient.post<DraftMeeting>(this.draftPath)
    return response.data
  }

  /**
   * 保存草稿会议数据
   */
  async saveDraftMeeting(meetingId: string, meetingData: Partial<CreateMeetingRequest>): Promise<OperationResult> {
    const response = await httpClient.put<OperationResult>(`${this.draftPath}/${meetingId}`, meetingData)
    return response.data
  }

  /**
   * 提交草稿会议（发布）
   */
  async submitDraftMeeting(meetingId: string, meetingData: CreateMeetingRequest): Promise<Meeting> {
    const response = await httpClient.post<Meeting>(`${this.draftPath}/${meetingId}/submit`, meetingData)
    return response.data
  }

  /**
   * 删除草稿会议
   */
  async deleteDraftMeeting(meetingId: string): Promise<OperationResult> {
    const response = await httpClient.delete<OperationResult>(`${this.draftPath}/${meetingId}`)
    return response.data
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

    const response = await httpClient.upload<FileUploadResponse>(
      `${this.basePath}/${meetingId}/files`,
      formData
    )
    return response.data
  }

  /**
   * 获取会议文件列表
   */
  async getMeetingFiles(meetingId: string): Promise<FileUploadResponse[]> {
    const response = await httpClient.get<FileUploadResponse[]>(`${this.basePath}/${meetingId}/files`)
    return response.data
  }

  /**
   * 删除会议文件
   */
  async deleteMeetingFile(meetingId: string, fileId: string): Promise<OperationResult> {
    const response = await httpClient.delete<OperationResult>(`${this.basePath}/${meetingId}/files/${fileId}`)
    return response.data
  }

  // ===== 统计和其他功能 =====

  /**
   * 获取会议统计信息
   */
  async getMeetingStats(): Promise<MeetingStats> {
    const response = await httpClient.get<MeetingStats>(`${this.basePath}/stats`)
    return response.data
  }

  /**
   * 获取会议模板
   */
  async getMeetingTemplates(): Promise<MeetingTemplate[]> {
    const response = await httpClient.get<MeetingTemplate[]>(`${this.basePath}/templates`)
    return response.data
  }

  /**
   * 根据模板创建会议
   */
  async createMeetingFromTemplate(templateId: string, data: Partial<CreateMeetingRequest>): Promise<Meeting> {
    const response = await httpClient.post<Meeting>(`${this.basePath}/templates/${templateId}/create`, data)
    return response.data
  }

  /**
   * 获取会议设置
   */
  async getMeetingSettings(): Promise<MeetingSettings> {
    const response = await httpClient.get<MeetingSettings>(`${this.basePath}/settings`)
    return response.data
  }

  /**
   * 更新会议设置
   */
  async updateMeetingSettings(settings: Partial<MeetingSettings>): Promise<OperationResult> {
    const response = await httpClient.put<OperationResult>(`${this.basePath}/settings`, settings)
    return response.data
  }
}

export const meetingApiService = new MeetingApiService()
