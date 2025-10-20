/**
 * 会议领域类型定义
 * 包含会议相关的业务实体和值对象
 */

import type { 
  BaseEntity, 
  MeetingSecurityLevel, 
  ISODateString, 
  FileInfo 
} from '../common'

// 会议类型枚举
export type MeetingType = 'standard' | 'tablet'

// 会议状态枚举
export type MeetingStatus = 'preparation' | 'distributable' | 'in_progress' | 'closed'

// 参与者角色枚举
export type ParticipantRole = 'host' | 'participant' | 'observer'

// 参与者状态枚举
export type ParticipantStatus = 'invited' | 'accepted' | 'declined' | 'attended' | 'absent'

// 会议实体
export interface Meeting extends BaseEntity {
  name: string
  startTime: ISODateString
  endTime: ISODateString
  status: MeetingStatus
  securityLevel: MeetingSecurityLevel
  type: MeetingType
  hostId: string
  hostName: string
  location?: string
  description?: string
  category?: string
  tags?: string[]
  maxParticipants?: number
  isRecorded: boolean
  recordingUrl?: string
  participants?: MeetingParticipant[]
  agendas?: MeetingAgenda[]
  materials?: MeetingMaterial[]
  participantCount: number
  agendaCount: number
  materialCount: number
  settings?: MeetingSettings
  stats?: MeetingStats
}

// 会议参与者
export interface MeetingParticipant extends BaseEntity {
  meetingId: string
  userId: string
  userName: string
  email?: string
  department?: string
  departmentName?: string
  role: ParticipantRole
  status: ParticipantStatus
  invitedAt: ISODateString
  respondedAt?: ISODateString
  joinedAt?: ISODateString
  leftAt?: ISODateString
  duration?: number
  deviceInfo?: {
    type: 'desktop' | 'mobile' | 'tablet'
    os: string
    browser: string
    ip: string
  }
  permissions?: string[]
}

// 会议议程
export interface MeetingAgenda extends BaseEntity {
  meetingId: string
  title: string
  description?: string
  duration?: number
  presenter?: string
  presenterName?: string
  materials: MeetingMaterial[]
  order: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  startedAt?: ISODateString
  completedAt?: ISODateString
  actualDuration?: number
  notes?: string
  attachments?: FileInfo[]
}

// 会议材料
export interface MeetingMaterial extends BaseEntity {
  agendaId?: string
  meetingId: string
  name: string
  originalName: string
  size: number
  type: string
  url: string
  thumbnailUrl?: string
  securityLevel: MeetingSecurityLevel
  uploadedBy: string
  uploadedByName: string
  downloadCount: number
  lastDownloadAt?: ISODateString
  version: number
  isPublic: boolean
  permissions?: {
    canDownload: boolean
    canView: boolean
    canEdit: boolean
    allowedUsers?: string[]
  }
  metadata?: {
    pages?: number
    duration?: number
    resolution?: string
    encoding?: string
  }
}

// 草稿会议
export interface DraftMeeting extends BaseEntity {
  status: 'draft'
  name?: string
  data?: Partial<Meeting>
  lastSavedAt?: ISODateString
  autoSaveEnabled?: boolean
  saveInterval?: number
}

// 会议模板
export interface MeetingTemplate extends BaseEntity {
  name: string
  description?: string
  type: MeetingType
  securityLevel: MeetingSecurityLevel
  category?: string
  defaultDuration: number
  defaultLocation?: string
  agendaTemplates: Array<{
    title: string
    description?: string
    duration?: number
    order: number
    materials?: string[]
  }>
  participantRoles?: ParticipantRole[]
  isPublic: boolean
  useCount: number
  rating?: number
  reviews?: Array<{
    userId: string
    rating: number
    comment: string
    createdAt: ISODateString
  }>
}

// 会议设置
export interface MeetingSettings {
  recording: {
    enabled: boolean
    autoStart: boolean
    includeScreenShare: boolean
    quality: 'low' | 'medium' | 'high'
    retentionDays: number
  }
  security: {
    requirePassword: boolean
    password?: string
    waitingRoom: boolean
    lockMeeting: boolean
    restrictScreenShare: boolean
    disableFileDownload: boolean
    watermark: boolean
  }
  notifications: {
    reminderMinutes: number[]
    emailReminders: boolean
    smsReminders: boolean
    pushNotifications: boolean
  }
  features: {
    allowChat: boolean
    allowFileSharing: boolean
    allowAnnotation: boolean
    allowBreakoutRooms: boolean
    allowPolling: boolean
  }
  access: {
    joinBeforeHost: boolean
    guestAccess: boolean
    requireRegistration: boolean
    approvalRequired: boolean
    maxEarlyJoinMinutes: number
  }
}

// 会议统计
export interface MeetingStats {
  duration: number
  attendanceRate: number
  joinTime: {
    onTime: number
    early: number
    late: number
  }
  participation: {
    active: number
    passive: number
    left: number
  }
  engagement: {
    chatMessages: number
    fileShares: number
    screenShares: number
    annotations: number
  }
  technical: {
    avgConnectionQuality: number
    disconnections: number
    reconnections: number
  }
}

// 会议邀请
export interface MeetingInvitation extends BaseEntity {
  meetingId: string
  meetingName: string
  inviteeId: string
  inviteeName: string
  inviteeEmail?: string
  invitedBy: string
  invitedByName: string
  status: 'pending' | 'accepted' | 'declined' | 'cancelled'
  respondedAt?: ISODateString
  response?: {
    message?: string
    willAttend: boolean
    delegatedTo?: string
  }
  reminders: {
    sent: number
    scheduled: ISODateString[]
    methods: ('email' | 'sms' | 'push')[]
  }
  customMessage?: string
}

// 会议申请
export interface MeetingApplication extends BaseEntity {
  applicantId: string
  applicantName: string
  type: MeetingType
  securityLevel: MeetingSecurityLevel
  startTime: ISODateString
  endTime: ISODateString
  duration: number
  location?: string
  description?: string
  participantCount: number
  equipmentRequirements?: string[]
  specialRequirements?: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  reviewedBy?: string
  reviewedAt?: ISODateString
  reviewNotes?: string
  approvalCode?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  costCenter?: string
  budget?: number
}

// 会议室/设备
export interface MeetingRoom extends BaseEntity {
  name: string
  code: string
  location: string
  capacity: number
  type: 'conference' | 'training' | 'boardroom' | 'huddle' | 'virtual'
  floor?: string
  building?: string
  features: string[]
  equipment: Array<{
    name: string
    model: string
    quantity: number
    status: 'available' | 'maintenance' | 'broken'
  }>
  booking: {
    isBookable: boolean
    advanceBookingDays: number
    minBookingDuration: number
    maxBookingDuration: number
    requireApproval: boolean
  }
  availability: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
    timezone: string
  }>
  contacts: Array<{
    name: string
    role: string
    phone?: string
    email?: string
  }>
}

// 会议预约
export interface MeetingBooking extends BaseEntity {
  roomId: string
  roomName: string
  meetingId?: string
  bookedBy: string
  bookedByName: string
  startTime: ISODateString
  endTime: ISODateString
  purpose: string
  participantCount: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  approvedBy?: string
  approvedAt?: ISODateString
  cancelledReason?: string
  equipmentRequests?: string[]
  setupInstructions?: string
  contactInfo: {
    name: string
    phone: string
    email: string
  }
}

// 我的会议标签页配置
export interface MyMeetingTab {
  key: 'hosted' | 'participated' | 'all'
  label: string
  count?: number
  badge?: {
    count: number
    type: 'info' | 'warning' | 'error'
  }
}

// 会议日历事件
export interface MeetingCalendarEvent {
  id: string
  meetingId: string
  title: string
  start: ISODateString
  end: ISODateString
  allDay: boolean
  location?: string
  description?: string
  color?: string
  textColor?: string
  borderColor?: string
  className?: string[]
  editable: boolean
  startEditable: boolean
  durationEditable: boolean
  resourceEditable: boolean
  extendedProps: {
    meeting: Meeting
    userRole: ParticipantRole
    userStatus: ParticipantStatus
  }
}

// 会议工作流
export interface MeetingWorkflow extends BaseEntity {
  meetingId: string
  name: string
  steps: Array<{
    id: string
    name: string
    type: 'approval' | 'notification' | 'automation' | 'review'
    status: 'pending' | 'completed' | 'skipped' | 'failed'
    assignee?: string
    dueDate?: ISODateString
    completedAt?: ISODateString
    data?: Record<string, any>
  }>
  currentStep: number
  status: 'active' | 'completed' | 'cancelled' | 'failed'
  triggeredBy: string
  completedAt?: ISODateString
  metadata?: Record<string, any>
}

// 会议表单数据（用于创建会议页面）
export interface MeetingFormData {
  name: string
  securityLevel: MeetingSecurityLevel
  category: string
  startTime: string
  endTime: string
  type: MeetingType
  description: string
  participants: MeetingParticipant[]
  agendas: MeetingAgenda[]
  password: string
  expiryType: 'none' | 'today' | 'custom'
  expiryDate: string
  signInType: 'none' | 'manual' | 'password'
  location: string
  organizer: string
  host: string
}

// 会议报告
export interface MeetingReport extends BaseEntity {
  meetingId: string
  type: 'summary' | 'attendance' | 'engagement' | 'technical' | 'custom'
  title: string
  content: string
  format: 'html' | 'markdown' | 'pdf' | 'docx'
  sections: Array<{
    name: string
    content: string
    charts?: Array<{
      type: string
      data: any
      config?: any
    }>
  }>
  generatedBy: string
  isPublic: boolean
  shareableLink?: string
  downloadUrl?: string
  expiresAt?: ISODateString
}
