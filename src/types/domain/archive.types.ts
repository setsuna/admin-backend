/**
 * 归档相关类型定义
 */

import type { ISODateString, SystemSecurityLevel } from '../common/base.types'

/**
 * 归档状态
 */
export type ArchiveStatus = 'processing' | 'completed' | 'failed'

/**
 * 归档记录
 */
export interface Archive {
  id: string
  meetingId: string
  meetingName: string
  meetingStartTime: ISODateString
  meetingEndTime: ISODateString
  securityLevel: SystemSecurityLevel
  organizerName: string
  status: ArchiveStatus
  signaturesCount: number
  editedFilesCount: number
  recordsCount: number
  votesCount: number
  archivedDevices: string[]
  createdAt: ISODateString
  updatedAt: ISODateString
}

/**
 * 归档列表筛选参数
 */
export interface ArchiveFilters {
  keyword?: string
  status?: ArchiveStatus
  securityLevel?: SystemSecurityLevel
}
