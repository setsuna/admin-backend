/**
 * 会议服务 - 重构后的简洁版本
 * 直接使用API服务，移除Mock逻辑
 */

import { meetingApiService } from './api/meeting.api'
import type { 
  Meeting, 
  MeetingFilters, 
  PaginatedResponse, 
  CreateMeetingRequest,
  MeetingAgenda,
  MeetingSecurityLevel,
  OperationResult
} from '@/types'  // ✅ 直接从 @/types 导入

/**
 * 会议服务类
 * 封装会议相关的业务逻辑
 */
class MeetingService {
  /**
   * 获取会议列表
   */
  async getMeetings(
    filters: MeetingFilters = {},
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Meeting>> {
    return meetingApiService.getMeetings(filters, page, pageSize)
  }

  /**
   * 获取我的会议列表
   */
  async getMyMeetings(
    tabType: 'hosted' | 'participated' | 'all' = 'all',
    filters: MeetingFilters = {},
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Meeting>> {
    return meetingApiService.getMyMeetings(tabType, filters, page, pageSize)
  }

  /**
   * 获取会议详情
   */
  async getMeetingById(id: string): Promise<Meeting> {
    return meetingApiService.getMeetingById(id)
  }

  /**
   * 创建会议
   */
  async createMeeting(meetingData: CreateMeetingRequest): Promise<Meeting> {
    return meetingApiService.createMeeting(meetingData)
  }

  /**
   * 从申请创建会议
   */
  async createMeetingFromRequest(request: any): Promise<Meeting> {
    return meetingApiService.createMeetingFromRequest(request)
  }

  /**
   * 更新会议
   */
  async updateMeeting(id: string, updates: Partial<CreateMeetingRequest>): Promise<Meeting> {
    return meetingApiService.updateMeeting(id, updates)
  }

  /**
   * 删除会议
   */
  async deleteMeeting(id: string): Promise<boolean> {
    const result = await meetingApiService.deleteMeeting(id)
    return result.success
  }

  /**
   * 批量更新会议
   */
  async batchUpdateMeetings(ids: string[], updates: Partial<CreateMeetingRequest>): Promise<boolean> {
    const result = await meetingApiService.batchUpdateMeetings(ids, updates)
    return result.successCount === ids.length
  }

  // 草稿会议相关
  async createDraftMeeting(): Promise<any> {
    return meetingApiService.createDraftMeeting()
  }

  async saveDraftMeeting(meetingId: string, meetingData: CreateMeetingRequest): Promise<boolean> {
    const result = await meetingApiService.saveDraftMeeting(meetingId, meetingData)
    return result.success
  }

  async submitDraftMeeting(meetingId: string, meetingData: CreateMeetingRequest): Promise<Meeting> {
    return meetingApiService.submitDraftMeeting(meetingId, meetingData)
  }

  // 文件管理相关
  async uploadMeetingFile(meetingId: string, file: File, agendaId?: string, securityLevel?: MeetingSecurityLevel): Promise<any> {
    return meetingApiService.uploadMeetingFile(meetingId, file, agendaId, securityLevel)
  }

  async getMeetingFiles(meetingId: string, filters?: { agendaId?: string; page?: number; size?: number }): Promise<any> {
    return meetingApiService.getMeetingFiles(meetingId, filters)
  }

  async deleteMeetingFile(meetingId: string, fileId: string): Promise<boolean> {
    const result = await meetingApiService.deleteMeetingFile(meetingId, fileId)
    return result.success
  }

  // 议题管理相关
  async getAgendas(meetingId: string): Promise<MeetingAgenda[]> {
    return meetingApiService.getAgendas(meetingId)
  }

  async getAgenda(meetingId: string, agendaId: string): Promise<MeetingAgenda> {
    return meetingApiService.getAgenda(meetingId, agendaId)
  }

  async createAgenda(meetingId: string, agendaData: {
    title: string
    description?: string
    duration?: number
    presenter?: string
    order_num: number
  }): Promise<MeetingAgenda> {
    return meetingApiService.createAgenda(meetingId, agendaData)
  }

  async updateAgenda(meetingId: string, agendaId: string, updates: {
    title?: string
    description?: string
    duration?: number
    presenter?: string
    order_num?: number
  }): Promise<MeetingAgenda> {
    return meetingApiService.updateAgenda(meetingId, agendaId, updates)
  }

  async deleteAgenda(meetingId: string, agendaId: string): Promise<boolean> {
    const result = await meetingApiService.deleteAgenda(meetingId, agendaId)
    return result.success
  }

  /**
   * 更新议题排序
   */
  async updateAgendaOrder(meetingId: string, agendaIds: string[]): Promise<OperationResult> {
    return meetingApiService.updateAgendaOrder(meetingId, agendaIds)
  }

  /**
   * 更新文件排序
   */
  async updateFileOrder(meetingId: string, agendaId: string, fileIds: string[]): Promise<OperationResult> {
    return meetingApiService.updateFileOrder(meetingId, agendaId, fileIds)
  }

  /**
   * 更新文件密级
   */
  async updateFileSecurityLevel(meetingId: string, fileId: string, securityLevel: MeetingSecurityLevel): Promise<any> {
    return meetingApiService.updateFileSecurityLevel(meetingId, fileId, securityLevel)
  }
}

export const meetingService = new MeetingService()

// 兼容性导出，保持原有接口不变
export const meetingApi = {
  getMeetings: meetingService.getMeetings.bind(meetingService),
  getMyMeetings: meetingService.getMyMeetings.bind(meetingService),
  getMeetingById: meetingService.getMeetingById.bind(meetingService),
  createMeeting: meetingService.createMeeting.bind(meetingService),
  createMeetingFromRequest: meetingService.createMeetingFromRequest.bind(meetingService),
  updateMeeting: meetingService.updateMeeting.bind(meetingService),
  deleteMeeting: meetingService.deleteMeeting.bind(meetingService),
  batchUpdateMeetings: meetingService.batchUpdateMeetings.bind(meetingService),
  
  // 草稿会议相关
  createDraftMeeting: meetingService.createDraftMeeting.bind(meetingService),
  saveDraftMeeting: meetingService.saveDraftMeeting.bind(meetingService),
  submitDraftMeeting: meetingService.submitDraftMeeting.bind(meetingService),
  
  // 文件管理相关
  uploadMeetingFile: meetingService.uploadMeetingFile.bind(meetingService),
  getMeetingFiles: meetingService.getMeetingFiles.bind(meetingService),
  deleteMeetingFile: meetingService.deleteMeetingFile.bind(meetingService),
  
  // 议题管理相关
  getAgendas: meetingService.getAgendas.bind(meetingService),
  getAgenda: meetingService.getAgenda.bind(meetingService),
  createAgenda: meetingService.createAgenda.bind(meetingService),
  updateAgenda: meetingService.updateAgenda.bind(meetingService),
  deleteAgenda: meetingService.deleteAgenda.bind(meetingService),
  updateAgendaOrder: meetingService.updateAgendaOrder.bind(meetingService),
  
  // 文件排序和密级管理
  updateFileOrder: meetingService.updateFileOrder.bind(meetingService),
  updateFileSecurityLevel: meetingService.updateFileSecurityLevel.bind(meetingService)
}
