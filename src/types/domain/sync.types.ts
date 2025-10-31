/**
 * 会议同步相关类型定义
 */

import type { Meeting } from './meeting.types'

/**
 * 同步设备信息
 */
export interface SyncDevice {
  /** 设备ID */
  id: string
  /** 设备名称 */
  name: string
  /** 存储空间已使用(MB) */
  usedStorage: number
  /** 存储空间总容量(MB) */
  totalStorage: number
  /** 已同步的会议数量 */
  syncedMeetingCount: number
  /** 最后同步时间 */
  lastSyncTime?: string
}

/**
 * 已同步的会议信息
 */
export interface SyncedMeeting {
  /** 会议ID */
  meetingId: string
  /** 会议标题 */
  title: string
  /** 密级 */
  securityLevel: string
  /** 文件大小(MB) */
  size: number
  /** 文件数量 */
  fileCount: number
  /** 同步时间 */
  syncTime: string
  /** 会议日期 */
  meetingDate: string
}

/**
 * 同步任务
 */
export interface SyncTask {
  /** 任务ID */
  id: string
  /** 会议ID */
  meetingId: string
  /** 会议标题 */
  meetingTitle: string
  /** 目标设备ID列表 */
  deviceIds: string[]
  /** 目标设备名称列表 */
  deviceNames: string[]
  /** 任务状态 */
  status: 'pending' | 'running' | 'completed' | 'failed'
  /** 已完成的设备数 */
  completedCount: number
  /** 总设备数 */
  totalCount: number
  /** 创建时间 */
  createdAt: string
  /** 完成时间 */
  completedAt?: string
}

/**
 * 会议同步信息（用于列表显示）
 */
export interface MeetingSyncInfo extends Meeting {
  /** 已同步的设备数量 */
  syncedDeviceCount: number
  /** 是否启用自动同步 */
  autoSyncEnabled: boolean
}

/**
 * 同步配置
 */
export interface SyncOptions {
  /** 包含会议材料 */
  includeMaterials: boolean
  /** 包含议程 */
  includeAgenda: boolean
  /** 包含录音(如有) */
  includeRecording: boolean
  /** 覆盖已有文件 */
  overwriteExisting: boolean
}

/**
 * 同步请求参数
 */
export interface SyncRequest {
  /** 会议ID列表 */
  meetingIds: string[]
  /** 设备ID列表 */
  deviceIds: string[]
  /** 同步选项 */
  options: SyncOptions
}

/**
 * 删除同步会议请求
 */
export interface DeleteSyncRequest {
  /** 设备ID */
  deviceId: string
  /** 会议ID列表 */
  meetingIds: string[]
}
