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
 * 设备状态
 */
export type DeviceStatus = -1 | 0 | 1 | 2 | 3
// -1: 未注册, 0: 离线, 1: 在线, 2: 维护中, 3: 已禁用

/**
 * 设备类型
 */
export type DeviceType = 1 | 2 | 9
// 1: 平板设备, 2: 屏幕设备, 9: 其他设备

/**
 * 设备信息（来自后端API）
 */
export interface Device {
  id?: number
  code?: string
  serialNumber: string // 设备序列号
  type?: DeviceType
  number?: number
  bindId?: number
  roomId?: number
  lastLogin?: string
  ip?: string
  mac?: string
  screenPort?: number
  screenWidth?: number
  screenHeight?: number
  screenImgExt?: string
  ctrlCode?: string
  status: DeviceStatus
  statusName: string // 状态名称
  isDeleted?: boolean
  authCode?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * 同步设备（兼容旧代码）
 */
export interface SyncDevice {
  id: string
  name: string
  usedStorage: number // MB
  totalStorage: number // MB
  syncedMeetingCount: number
  lastSyncTime?: string
  // 新增字段用于兼容Device
  serialNumber?: string
  status?: DeviceStatus
  statusName?: string
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
