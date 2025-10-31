/**
 * 域类型定义 - 会议相关
 */

// ========== 枚举类型 ==========

/**
 * 会议状态
 */
export type MeetingStatus = 
  | 'editable'        // 可编辑
  | 'ready'           // 就绪
  | 'closed'          // 已关闭
  // 兼容旧状态
  | 'draft'           // 草稿
  | 'preparation'     // 准备中
  | 'distributable'   // 可下发
  | 'in_progress'     // 进行中
  | 'completed'       // 已完成

/**
 * 会议密级
 */
export type MeetingSecurityLevel = 
  | 'public'          // 公开
  | 'internal'        // 内部
  | 'confidential'    // 秘密
  | 'secret'          // 机密
  | 'top_secret'      // 绝密

/**
 * 会议类型
 */
export type MeetingType = 
  | 'standard'        // 标准
  | 'tablet'          // 平板
  // 兼容旧类型
  | 'regular'         // 常规会议
  | 'emergency'       // 紧急会议
  | 'review'          // 评审会议

// ========== 接口定义 ==========

/**
 * 会议基础信息
 */
export interface Meeting {
  id: string
  name: string
  title: string
  description?: string
  status: MeetingStatus
  type: MeetingType
  securityLevel: MeetingSecurityLevel
  category?: string
  startTime: string
  endTime: string
  location?: string
  organizer?: string
  host?: string
  password?: string
  expiryType?: 'none' | 'today' | 'custom'
  expiryDate?: string
  signInType?: 'none' | 'manual' | 'password'
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
  materials: MeetingMaterial[]
  createdAt: string
  updatedAt: string
}

/**
 * 会议材料/文件
 */
export interface MeetingMaterial {
  id: string
  meetingId: string
  agendaId: string
  name: string
  originalName: string
  size: number
  type: string
  url: string
  securityLevel: MeetingSecurityLevel | null
  orderNum?: number  // 🔧 Bug3修复：添加排序字段
  uploadedBy: string
  uploadedByName: string
  downloadCount: number
  version: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

/**
 * 参会人员角色
 */
export type ParticipantRole = 'host' | 'participant' | 'observer'

/**
 * 参会人员状态
 */
export type ParticipantStatus = 'invited' | 'accepted' | 'declined' | 'attended'

/**
 * 参会人员类型（前端用于区分）
 */
export type ParticipantType = 'internal' | 'temporary'

/**
 * 参会人员基础信息
 */
export interface MeetingParticipant {
  id: string
  meetingId: string
  participantType?: ParticipantType  // 前端用于区分类型
  userId: string
  userName: string
  name: string                    // 姓名（后端新增）
  email?: string
  department?: string
  securityLevel?: string          // 密级（后端新增）
  password?: string               // 密码（后端新增）
  role: ParticipantRole
  status: ParticipantStatus
  joinedAt?: string
  leftAt?: string
  createdAt: string
  updatedAt?: string
}

/**
 * 临时参会人员（导入用）
 */
export interface TemporaryParticipant {
  name: string
  email?: string
  department?: string
  securityLevel?: string
  password?: string
}

/**
 * 投票类型
 */
export type VoteType = 'simple' | 'custom'

/**
 * 投票选项
 */
export interface VoteOption {
  id: string
  label: string
  orderNum: number
}

/**
 * 会议投票
 */
export interface MeetingVote {
  id: string
  meetingId: string
  agendaId: string
  title: string
  voteType: VoteType
  options: VoteOption[]
  isAnonymous: boolean
  securityLevel: MeetingSecurityLevel | null
  orderNum?: number
  createdAt: string
  updatedAt: string
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
  type: MeetingType
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
