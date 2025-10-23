/**
 * API 请求类型定义
 */

import type { MeetingStatus, MeetingSecurityLevel, MeetingType } from '../domain/meeting.types'

// ========== 通用请求参数 ==========

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/**
 * 排序参数
 */
export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ========== 会议相关请求 ==========

/**
 * 会议筛选条件
 */
export interface MeetingFilters {
  keyword?: string
  type?: MeetingType
  status?: MeetingStatus
  securityLevel?: MeetingSecurityLevel
  hostId?: string
  startTimeFrom?: string
  startTimeTo?: string
}

/**
 * 创建会议请求
 */
export interface CreateMeetingRequest {
  title: string
  description?: string
  type: MeetingType
  securityLevel: MeetingSecurityLevel
  startTime: string
  endTime: string
  location?: string
  hostId?: string
}

/**
 * 更新会议请求
 */
export interface UpdateMeetingRequest {
  title?: string
  description?: string
  type?: MeetingType
  securityLevel?: MeetingSecurityLevel
  startTime?: string
  endTime?: string
  location?: string
}

/**
 * 更新会议状态请求
 */
export interface UpdateMeetingStatusRequest {
  status: MeetingStatus
  reason?: string
}
