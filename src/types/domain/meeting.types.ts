/**
 * 域类型定义 - 会议相关
 */

// ========== 枚举类型 ==========

/**
 * 会议状态
 */
export type MeetingStatus = 
  | 'draft'           // 草稿
  | 'ready'           // 就绪
  | 'in_progress'     // 进行中
  | 'completed'       // 已完成
  | 'closed'          // 已关闭

/**
 * 会议密级
 */
export type MeetingSecurityLevel = 
  | 'public'          // 公开
  | 'internal'        // 内部
  | 'confidential'    // 机密
  | 'secret'          // 秘密

/**
 * 会议类型
 */
export type MeetingType = 
  | 'regular'         // 常规会议
  | 'emergency'       // 紧急会议
  | 'review'          // 评审会议

// ========== 接口定义 ==========

/**
 * 会议基础信息
 */
export interface Meeting {
  id: string
  title: string
  description?: string
  status: MeetingStatus
  type: MeetingType
  securityLevel: MeetingSecurityLevel
  startTime: string
  endTime: string
  location?: string
  hostId: string
  hostName?: string
  createdAt: string
  updatedAt: string
}

/**
 * 草稿会议
 */
export interface DraftMeeting {
  id: string
  data: Partial<Meeting>
  createdAt: string
  updatedAt: string
}

/**
 * 会议统计
 */
export interface MeetingStats {
  total: number
  draft: number
  ready: number
  inProgress: number
  completed: number
  closed: number
}

/**
 * 会议模板
 */
export interface MeetingTemplate {
  id: string
  name: string
  description?: string
  type: MeetingType
  securityLevel: MeetingSecurityLevel
  defaultDuration: number
  createdAt: string
}

/**
 * 会议设置
 */
export interface MeetingSettings {
  autoPackageEnabled: boolean
  reminderEnabled: boolean
  reminderMinutes: number
}

/**
 * 会议议题
 */
export interface MeetingAgenda {
  id: string
  meetingId: string
  title: string
  description?: string
  duration?: number
  presenter?: string
  orderNum: number
  createdAt: string
  updatedAt: string
}

/**
 * 参会人员信息
 */
export interface MeetingParticipant {
  id: string
  userId: string
  name: string
  department?: string
  role: 'host' | 'participant' | 'observer'
}

/**
 * 会议表单数据（用于创建/编辑）
 */
export interface MeetingFormData {
  name: string
  securityLevel: MeetingSecurityLevel
  category: string
  startTime: string
  endTime: string
  type: string
  description: string
  participants: MeetingParticipant[]
  agendas: any[]
  password: string
  expiryType: 'none' | 'today' | 'custom'
  expiryDate: string
  signInType: 'none' | 'manual' | 'password'
  location: string
  organizer: string
  host: string
}
