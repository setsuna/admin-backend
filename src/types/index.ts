/**
 * 类型定义统一导出入口
 * 提供项目中所有类型的统一导入接口
 */

// === 通用基础类型 ===
export * from './common'

// === API相关类型 ===
export * from './api'

// === 业务领域类型 ===
export * from './domain'

// === 常用类型别名重新导出 ===
// 基础类型
export type {
  ID,
  ISODateString,
  BaseEntity,
  PaginationParams,
  SelectOption,
  EntityStatus,
  ActiveStatus,
  UserSecurityLevel,
  SystemSecurityLevel,
  MeetingSecurityLevel
} from './common'

// API类型
export type {
  ApiResponse,
  PaginatedResponse,
  OperationResult,
  QueryParams,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  MeetingFilters
} from './api'

// 领域类型
export type {
  User,
  UserRole,
  Meeting,
  MeetingType,
  MeetingStatus,
  Department,
  Role,
  Permission,
  Device
} from './domain'

// 设备类型（明确区分）
export type {
  SystemDeviceType,
  SystemDeviceStatus
} from './domain'

export type {
  ClientDeviceType
} from './common'

// UI类型
export type {
  NotificationType,
  TableColumn,
  FormField,
  ActionButton,
  LoadingState,
  AsyncState
} from './common'

// === 类型工具函数 ===
export type Nullable<T> = T | null
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] }
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]
export type OmitByType<T, U> = Omit<T, KeysOfType<T, U>>
export type PickByType<T, U> = Pick<T, KeysOfType<T, U>>
