/**
 * 会议相关类型重新导向
 * 将原有的会议类型导向新的类型结构
 */

// 重新导出新类型结构中的会议相关类型
export * from '@/types/domain/meeting.types'
export * from '@/types/api/request.types'
export * from '@/types/api/response.types'

// 为了保持兼容性，重新导出常用类型
export type {
  Meeting,
  MeetingType,
  MeetingStatus,
  MeetingSecurityLevel,
  MeetingParticipant,
  MeetingAgenda,
  MeetingMaterial,
  ParticipantRole,
  ParticipantStatus,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  MeetingFilters,
  DraftMeeting,
  MeetingStats,
  OperationResult
} from '@/types'
