/**
 * 业务领域类型统一导出文件
 * 统一导出domain模块的所有类型
 */

// 用户领域类型
export * from './user.types'

// 会议领域类型
export * from './meeting.types'

// 系统管理领域类型 - 显式导出以避免DeviceType冲突
export type {
  Department,
  Role, 
  Permission,
  PermissionGroup,
  RolePermissionMatrix,
  PermissionCheckResult,
  Device,
  DeviceConfig,
  DeviceMetrics,
  DeviceStats,
  DataDict,
  DictItem,
  ConfigItem,
  ConfigHistory,
  SecurityPolicy,
  PasswordPolicy,
  TimeWindow,
  MenuItem,
  MenuConfig,
  SystemLog,
  AuditLog
} from './system.types'

// 设备相关类型需要明确命名以避免冲突
export type {
  DeviceType as SystemDeviceType,
  DeviceStatus as SystemDeviceStatus
} from './system.types'

// 常用类型别名
export type {
  User,
  UserRole,
  UserProfile,
  UserPreferences,
  UserSession
} from './user.types'

export type {
  Meeting,
  MeetingType,
  MeetingStatus,
  MeetingParticipant,
  MeetingAgenda,
  MeetingMaterial,
  ParticipantRole,
  ParticipantStatus
} from './meeting.types'

export type {
  Department,
  Role,
  Permission,
  Device,
  DeviceType,
  DeviceStatus,
  DataDict,
  DictItem,
  ConfigItem,
  SecurityPolicy
} from './system.types'
