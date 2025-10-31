/**
 * 同步相关类型定义
 */

import type { MeetingSecurityLevel } from './meeting.types'

/**
 * 会议同步信息
 */
export interface MeetingSyncInfo {
  id: string
  name: string
  title: string
  securityLevel: MeetingSecurityLevel
  status: 'draft' | 'ready' | 'editable' | 'locked'
  meetingDate: string
  syncedDeviceCount: number
  autoSyncEnabled: boolean
  meetingType: 'standard' | 'emergency' | 'regular'
  createdBy: string
  createdAt: string
  updatedAt: string
}

/**
 * 同步设备
 */
export interface SyncDevice {
  id: string
  name: string
  usedStorage: number // MB
  totalStorage: number // MB
  syncedMeetingCount: number
  lastSyncTime?: string
}

/**
 * 已同步的会议
 */
export interface SyncedMeeting {
  id?: string
  meetingId: string
  title: string
  securityLevel: MeetingSecurityLevel
  syncTime: string
  size: number // MB
  materialCount?: number
  fileCount?: number // 文件数量
  meetingDate?: string // 会议日期
}

/**
 * 同步选项
 */
export interface SyncOptions {
  includeMaterials: boolean
  includeAgenda: boolean
  includeRecording: boolean
  overwriteExisting: boolean
}

/**
 * 同步任务状态
 */
export type SyncTaskStatus = 'pending' | 'running' | 'completed' | 'failed'

/**
 * 同步任务
 */
export interface SyncTask {
  id: string
  meetingId: string
  meetingTitle: string
  deviceIds: string[]
  deviceNames: string[]
  status: SyncTaskStatus
  completedCount: number
  totalCount: number
  createdAt: string
  completedAt?: string
  error?: string
}
