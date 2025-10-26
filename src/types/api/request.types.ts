/**
 * API 请求类型定义
 */

import type { MeetingStatus, MeetingSecurityLevel, MeetingType } from '../domain/meeting.types'
import type { UserRole } from '../domain/user.types'
import type { UserSecurityLevel, ActiveStatus } from '../common/base.types'

// ========== 通用请求参数 ==========
// PaginationParams 和 SortParams 已在 base.types 中定义

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

// ========== 部门相关请求 ==========

/**
 * 部门筛选条件
 */
export interface DepartmentFilters {
  keyword?: string
  status?: 'enabled' | 'disabled'
  parentId?: string
}

/**
 * 创建部门请求
 */
export interface CreateDepartmentRequest {
  name: string
  code: string
  description?: string
  parentId?: string
  managerId?: string
  sort: number
  status: 'enabled' | 'disabled'
  phone?: string
  email?: string
  address?: string
}

/**
 * 更新部门请求
 */
export interface UpdateDepartmentRequest {
  id: string
  name?: string
  code?: string
  description?: string
  parentId?: string
  managerId?: string
  sort?: number
  status?: 'enabled' | 'disabled'
  phone?: string
  email?: string
  address?: string
}

// ========== 用户相关请求 ==========

/**
 * 用户筛选条件
 */
export interface UserFilters {
  keyword?: string
  role?: UserRole
  status?: ActiveStatus
  department?: string
  securityLevel?: UserSecurityLevel
}

/**
 * 创建用户请求
 */
export interface CreateUserRequest {
  username: string
  realName?: string
  name?: string
  email?: string
  password: string
  role: UserRole
  department?: string
  position?: string
  phone?: string
  status: ActiveStatus
  securityLevel: UserSecurityLevel
  ukeyId?: string
  allowedIps?: string[]
  isHide?: boolean
  permissions?: string[]
}

/**
 * 更新用户请求
 */
export interface UpdateUserRequest {
  id: string
  username?: string
  realName?: string
  name?: string
  email?: string
  role?: UserRole
  department?: string
  position?: string
  phone?: string
  status?: ActiveStatus
  securityLevel?: UserSecurityLevel
  ukeyId?: string
  allowedIps?: string[]
  isHide?: boolean
  permissions?: string[]
}

// ========== 数据字典相关请求 ==========

/**
 * 字典筛选条件
 */
export interface DictFilters {
  keyword?: string
  dictType?: string
  status?: 'enabled' | 'disabled'
}

/**
 * 创建字典请求
 */
export interface CreateDictRequest {
  dictCode: string
  dictName: string
  dictType: string
  remark?: string
  status: 'enabled' | 'disabled'
  items?: Array<{
    code: string
    name: string
    value: string | number
    sort: number
    remark?: string
    status: 'enabled' | 'disabled'
  }>
}

/**
 * 更新字典请求
 */
export interface UpdateDictRequest {
  id: string
  dictCode?: string
  dictName?: string
  dictType?: string
  remark?: string
  status?: 'enabled' | 'disabled'
  items?: Array<{
    id?: string
    code: string
    name: string
    value: string | number
    sort: number
    remark?: string
    status: 'enabled' | 'disabled'
  }>
}

// ========== 参会人员相关请求 ==========

import type { ParticipantRole, ParticipantStatus } from '../domain/meeting.types'

/**
 * 创建参会人员请求
 */
export interface CreateParticipantRequest {
  meetingId: string
  userId?: string
  name?: string
  tempDepartment?: string
  tempPosition?: string
  tempSecurityLevel?: string
  role?: ParticipantRole
  status?: ParticipantStatus
}

/**
 * 批量创建参会人员请求
 */
export interface BatchCreateParticipantRequest {
  meetingId: string
  participants: Array<{
    userId?: string
    name?: string
    tempDepartment?: string
    tempPosition?: string
    tempSecurityLevel?: string
    role?: ParticipantRole
  }>
}

/**
 * 更新参会人员请求
 */
export interface UpdateParticipantRequest {
  role?: ParticipantRole
  status?: ParticipantStatus
}

/**
 * 更新参会人员状态请求
 */
export interface UpdateParticipantStatusRequest {
  status: ParticipantStatus
}
