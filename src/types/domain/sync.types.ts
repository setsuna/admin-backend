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
export type OnlineDeviceStatus = -1 | 0 | 1 | 2 | 3
// -1: 未注册, 0: 离线, 1: 在线, 2: 维护中, 3: 已禁用

/**
 * 设备类型
 */
export type OnlineDeviceType = 1 | 2 | 9
// 1: 平板设备, 2: 屏幕设备, 9: 其他设备

/**
 * 在线设备信息（来自后端API /mount/online-devices）
 */
export interface OnlineDevice {
  id?: number
  code?: string
  serial_number: string // 设备序列号（后端字段名）
  serialNumber: string // 设备序列号（驼峰命名）
  type?: OnlineDeviceType
  type_name?: string
  typeName?: string
  number?: number
  bind_id?: number
  bindId?: number
  room_id?: number
  roomId?: number
  last_login?: string
  lastLogin?: string
  ip?: string
  mac?: string
  screen_port?: number
  screenPort?: number
  screen_width?: number
  screenWidth?: number
  screen_height?: number
  screenHeight?: number
  screen_img_ext?: string
  screenImgExt?: string
  ctrl_code?: string
  ctrlCode?: string
  status: OnlineDeviceStatus
  status_name: string // 状态名称（后端字段名）
  statusName: string // 状态名称（驼峰命名）
  is_deleted?: boolean
  isDeleted?: boolean
  auth_code?: string
  authCode?: string
  created_at?: string
  createdAt?: string
  updated_at?: string
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
  status?: OnlineDeviceStatus
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
