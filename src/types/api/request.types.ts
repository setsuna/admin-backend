/**
 * API请求相关类型定义
 * 包含所有API请求的参数类型
 */

import type { 
  BaseFilters, 
  PaginationParams, 
  SortParams, 
  TimeRange, 
  UserSecurityLevel, 
  MeetingSecurityLevel,
  EntityStatus,
  ActiveStatus
} from '../common'

// 通用查询参数
export interface QueryParams extends PaginationParams, SortParams, BaseFilters {}

// 批量操作请求
export interface BatchRequest<T = string> {
  ids: T[]
  action: string
  data?: Record<string, any>
}

// 导出请求参数
export interface ExportRequest extends BaseFilters {
  format?: 'excel' | 'csv' | 'pdf' | 'json'
  fields?: string[]
  fileName?: string
  template?: string
}

// 导入请求参数
export interface ImportRequest {
  file: File
  template?: string
  skipErrors?: boolean
  dryRun?: boolean
}

// 用户相关请求
export interface CreateUserRequest {
  username: string
  email: string
  password: string
  role: 'admin' | 'user' | 'meeting_admin' | 'auditor' | 'security_admin'
  realName?: string
  department?: string
  position?: string
  phone?: string
  status: ActiveStatus
  securityLevel: UserSecurityLevel
  permissions?: string[]
}

export interface UpdateUserRequest extends Partial<Omit<CreateUserRequest, 'password'>> {
  id: string
}

export interface UserFilters extends BaseFilters {
  department?: string
  role?: 'admin' | 'user' | 'meeting_admin' | 'auditor' | 'security_admin'
  status?: ActiveStatus
  securityLevel?: UserSecurityLevel
}

export interface ResetPasswordRequest {
  userId: string
  newPassword?: string
  sendEmail?: boolean
}

export interface UpdatePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UpdateUserStatusRequest {
  status: ActiveStatus
  reason?: string
}

// 部门相关请求
export interface CreateDepartmentRequest {
  name: string
  code: string
  description?: string
  parentId?: string
  managerId?: string
  sort: number
  status: EntityStatus
  phone?: string
  email?: string
  address?: string
}

export interface UpdateDepartmentRequest extends Partial<CreateDepartmentRequest> {
  id: string
}

export interface DepartmentFilters extends BaseFilters {
  status?: EntityStatus
  parentId?: string
  managerId?: string
}

// 角色相关请求
export interface CreateRoleRequest {
  name: string
  code: string
  description?: string
  permissions: string[]
  status: EntityStatus
}

export interface UpdateRoleRequest extends Partial<CreateRoleRequest> {
  id: string
}

export interface RoleFilters extends BaseFilters {
  status?: EntityStatus
  hasPermission?: string
}

// 权限相关请求
export interface PermissionFilters extends BaseFilters {
  category?: string
  resource?: string
  action?: string
}

// 会议相关请求
export type MeetingType = 'standard' | 'tablet'
export type MeetingStatus = 'preparation' | 'distributable' | 'in_progress' | 'closed'

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

export interface UpdateMeetingRequest extends Partial<CreateMeetingRequest> {
  id: string
}

export interface MeetingFilters extends BaseFilters {
  type?: MeetingType
  status?: MeetingStatus
  securityLevel?: MeetingSecurityLevel
  hostId?: string
  category?: string
  tags?: string[]
  participants?: string[]
}

export interface UpdateMeetingStatusRequest {
  status: MeetingStatus
  reason?: string
}

export interface MeetingFileUploadRequest {
  meetingId: string
  agendaId?: string
  files: File[]
  securityLevel: MeetingSecurityLevel
}

// 设备相关请求
export interface CreateDeviceRequest {
  name: string
  type: string
  ip: string
  port: number
  description?: string
  location?: string
  config?: Record<string, any>
}

export interface UpdateDeviceRequest extends Partial<CreateDeviceRequest> {
  id: string
  status?: 'online' | 'offline' | 'warning' | 'error'
}

export interface DeviceFilters extends BaseFilters {
  type?: string
  status?: 'online' | 'offline' | 'warning' | 'error'
  location?: string
}

// 数据字典相关请求
export interface CreateDictRequest {
  dictCode: string
  dictName: string
  dictType: string
  status: EntityStatus
  remark?: string
  items: Array<{
    code: string
    name: string
    value: string | number
    status: EntityStatus
    sort: number
    remark?: string
  }>
}

export interface UpdateDictRequest extends Partial<CreateDictRequest> {
  id: string
}

export interface DictFilters extends BaseFilters {
  dictType?: string
  status?: EntityStatus
}

// 文件相关请求
export interface FileUploadRequest {
  file: File
  category?: string
  securityLevel?: MeetingSecurityLevel
  metadata?: Record<string, any>
}

export interface FileQueryRequest extends QueryParams {
  category?: string
  securityLevel?: MeetingSecurityLevel
  uploadedBy?: string
  mimeType?: string
}
