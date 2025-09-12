/**
 * 会议相关类型定义
 */

import { BaseEntity, FilterParams } from './api.types'

// 会议密级
export type MeetingSecurityLevel = 'internal' | 'confidential' | 'secret'

// 会议类型
export type MeetingType = 'standard' | 'tablet'

// 会议状态
export type MeetingStatus = 'preparation' | 'distributable' | 'in_progress' | 'closed'

// 会议参与者
export interface MeetingParticipant extends BaseEntity {
  meetingId: string
  userId: string
  userName: string
  email?: string
  department?: string
  role: 'host' | 'participant' | 'observer'
  status: 'invited' | 'accepted' | 'declined' | 'attended'
  joinedAt?: string
  leftAt?: string
}

// 会议材料
export interface MeetingMaterial extends BaseEntity {
  agendaId: string
  name: string
  originalName: string
  size: number
  type: string
  url: string
  securityLevel: MeetingSecurityLevel
  uploadedBy: string
  downloadCount: number
  lastDownloadAt?: string
}

// 会议议程
export interface MeetingAgenda extends BaseEntity {
  meetingId: string
  title: string
  description?: string
  duration?: number
  presenter?: string
  materials: MeetingMaterial[]
  order: number
  status: 'pending' | 'in_progress' | 'completed'
  startedAt?: string
  completedAt?: string
}

// 会议基础信息
export interface Meeting extends BaseEntity {
  name: string
  startTime: string
  endTime: string
  status: MeetingStatus
  securityLevel: MeetingSecurityLevel
  type: MeetingType
  hostId: string
  hostName: string
  location?: string
  description?: string
  category?: string
  tags?: string[]
  maxParticipants?: number
  isRecorded: boolean
  recordingUrl?: string
  participants?: MeetingParticipant[]
  agendas?: MeetingAgenda[]
  participantCount: number
  agendaCount: number
  materialCount: number
}

// 草稿会议
export interface DraftMeeting extends BaseEntity {
  status: 'draft'
  name?: string
  data?: Partial<CreateMeetingRequest>
  lastSavedAt?: string
}

// 会议筛选条件
export interface MeetingFilters extends FilterParams {
  type?: MeetingType
  status?: MeetingStatus
  securityLevel?: MeetingSecurityLevel
  hostId?: string
  category?: string
  tags?: string[]
  participants?: string[]
  dateRange?: [string, string]
}

// 创建会议请求
export interface CreateMeetingRequest {
  name: string
  securityLevel: MeetingSecurityLevel
  type: MeetingType
  startTime: string
  endTime: string
  description?: string
  location?: string
  category?: string
  tags?: string[]
  maxParticipants?: number
  isRecorded?: boolean
  participants: Array<{
    userId: string
    role: 'participant' | 'observer'
  }>
  agendas: Array<{
    title: string
    description?: string
    duration?: number
    presenter?: string
    order: number
  }>
}

// 更新会议请求
export interface UpdateMeetingRequest extends Partial<CreateMeetingRequest> {
  id: string
}

// 会议状态更新请求
export interface UpdateMeetingStatusRequest {
  status: MeetingStatus
  reason?: string
}

// 会议文件上传请求
export interface UploadMeetingFileRequest {
  meetingId: string
  agendaId?: string
  files: File[]
  securityLevel: MeetingSecurityLevel
}

// 我的会议标签页
export interface MyMeetingTab {
  key: 'hosted' | 'participated' | 'all'
  label: string
  count?: number
}

// 会议统计信息
export interface MeetingStats {
  total: number
  byStatus: Record<MeetingStatus, number>
  byType: Record<MeetingType, number>
  bySecurityLevel: Record<MeetingSecurityLevel, number>
  thisMonth: number
  thisWeek: number
  today: number
  avgDuration: number
  totalParticipants: number
}

// 会议模板
export interface MeetingTemplate extends BaseEntity {
  name: string
  description?: string
  type: MeetingType
  securityLevel: MeetingSecurityLevel
  category?: string
  defaultDuration: number
  defaultLocation?: string
  agendaTemplates: Array<{
    title: string
    description?: string
    duration?: number
    order: number
  }>
  isPublic: boolean
  useCount: number
}

// 会议设置
export interface MeetingSettings {
  autoRecord: boolean
  recordingRetentionDays: number
  allowGuestJoin: boolean
  requireApproval: boolean
  maxMeetingDuration: number
  advanceNotificationMinutes: number
  reminderSettings: {
    enabled: boolean
    intervals: number[] // 提前提醒时间（分钟）
  }
  securitySettings: {
    requirePasswordForConfidential: boolean
    restrictScreenSharing: boolean
    disableFileDownload: boolean
  }
}

// 会议邀请
export interface MeetingInvitation extends BaseEntity {
  meetingId: string
  inviteeId: string
  inviteeName: string
  inviteeEmail?: string
  invitedBy: string
  status: 'pending' | 'accepted' | 'declined'
  respondedAt?: string
  message?: string
  notificationSent: boolean
  remindersSent: number
}

// 会议日志
export interface MeetingLog extends BaseEntity {
  meetingId: string
  action: string
  description: string
  performedBy: string
  performedByName: string
  metadata?: Record<string, any>
}

// 会议导出配置
export interface MeetingExportConfig {
  meetingIds?: string[]
  dateRange?: [string, string]
  includeParticipants: boolean
  includeAgendas: boolean
  includeMaterials: boolean
  format: 'excel' | 'pdf' | 'json'
}
