// 通用API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 分页相关
export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// 设备相关类型
export interface Device {
  id: string
  name: string
  type: string
  status: 'online' | 'offline' | 'warning' | 'error'
  ip: string
  port: number
  lastSeen: string
  createdAt: string
  updatedAt: string
  config?: Record<string, any>
}

export interface DeviceStats {
  total: number
  online: number
  offline: number
  warning: number
  error: number
}

// 配置相关类型
export interface ConfigItem {
  id: string
  name: string
  description?: string
  content: string
  type: 'yaml' | 'json' | 'text'
  createdAt: string
  updatedAt: string
}

// 用户相关类型
export type UserSecurityLevel = 'unknown' | 'internal' | 'confidential' | 'secret'

export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'user' | 'meeting_admin' | 'auditor' | 'security_admin' | 'security_admin'
  avatar?: string
  department?: string
  departmentName?: string
  position?: string
  phone?: string
  status: 'active' | 'inactive' | 'suspended'
  securityLevel: UserSecurityLevel
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  permissions?: string[]
}

export interface UserFilters {
  keyword?: string
  department?: string
  role?: 'admin' | 'user' | 'meeting_admin' | 'auditor' | 'security_admin'
  status?: 'active' | 'inactive' | 'suspended'
  securityLevel?: UserSecurityLevel
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  role: 'admin' | 'user' | 'meeting_admin' | 'auditor' | 'security_admin'
  department?: string
  position?: string
  phone?: string
  status: 'active' | 'inactive' | 'suspended'
  securityLevel: UserSecurityLevel
  permissions?: string[]
}

export interface UpdateUserRequest extends Partial<Omit<CreateUserRequest, 'password'>> {
  id: string
}

// 权限相关类型
export interface Permission {
  id: string
  name: string
  code: string
  category: string // 权限分类
  resource: string // 资源标识
  action: 'read' | 'write' | 'delete' | 'manage' // 操作类型
  description?: string
}

export interface PermissionGroup {
  key: string
  name: string
  permissions: Permission[]
  description?: string
}

export interface Role {
  id: string
  name: string
  code: string
  permissions: string[]
  description?: string
  status: 'enabled' | 'disabled'
  createdAt: string
  updatedAt: string
}

// 角色权限矩阵
export interface RolePermissionMatrix {
  roleId: string
  roleName: string
  permissions: Record<string, boolean> // permissionCode -> hasPermission
}

// 权限验证结果
export interface PermissionCheckResult {
  hasAccess: boolean
  missingPermissions?: string[]
  reason?: string
}

// 表格相关类型
export interface TableColumn<T = any> {
  key: keyof T | string
  title: string
  width?: number | string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (value: any, record: T, index: number) => React.ReactNode
}

export interface TableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: PaginationParams
  onPaginationChange?: (pagination: PaginationParams) => void
  rowKey?: keyof T | ((record: T) => string)
  className?: string
}

// 表单相关类型
export interface FormField {
  name: string
  label: string
  type: 'text' | 'password' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'switch'
  placeholder?: string
  required?: boolean
  options?: { label: string; value: any }[]
  validation?: any
}

// 通知相关类型
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  timestamp: number
}

// 主题相关类型
export type Theme = 'light' | 'dark' | 'system' | 'gov-red'

// WebSocket消息类型
export interface WebSocketMessage {
  type: string
  data: any
  timestamp: number
}

// 路由相关类型
export interface RouteItem {
  path: string
  name: string
  icon?: string
  component?: React.ComponentType
  children?: RouteItem[]
  roles?: string[]
}

// 菜单相关类型
export interface MenuItem {
  key: string
  label: string
  icon?: React.ReactNode | string
  path?: string
  children?: MenuItem[]
  type?: 'group' | 'item'
  permissions?: string[] // 需要的权限码
  visible?: boolean // 是否可见
  group?: string // 所属分组
}

export interface MenuConfig {
  menus: MenuItem[]
  userPermissions: string[]
}

// 菜单字典相关类型
export interface MenuItemConfig {
  key: string
  label: string
  icon: string
  path: string
  permissions: string[]
  group: string
}

export interface MenuGroupConfig {
  key: string
  label: string
  value: string
  status: 'enabled' | 'disabled'
  sort: number
}

export interface MenuIconConfig {
  key: string
  label: string
  value: string
  status: 'enabled' | 'disabled'
  sort: number
}

// 通用状态类型
export interface LoadingState {
  loading: boolean
  error: string | null
}

export interface AsyncState<T> extends LoadingState {
  data: T | null
}

// 会议相关类型
export type MeetingSecurityLevel = 'internal' | 'confidential' | 'secret'
export type MeetingType = 'standard' | 'tablet'
export type MeetingStatus = 'preparation' | 'distributable' | 'in_progress' | 'closed'

export interface Meeting {
  id: string
  name: string
  startTime: string
  endTime: string
  status: MeetingStatus
  securityLevel: MeetingSecurityLevel
  type: MeetingType
  hostId: string
  hostName: string
  location?: string
  description?: string
  participantCount?: number
  agendaCount?: number
  materialCount?: number
  isRecorded: boolean
  recordingUrl?: string
  createdAt: string
  updatedAt: string
}

export interface MeetingFilters {
  keyword?: string
  type?: MeetingType
  status?: MeetingStatus
  securityLevel?: MeetingSecurityLevel
  dateRange?: [string, string]
}

export interface MyMeetingTab {
  key: 'hosted' | 'participated' | 'all'
  label: string
  count?: number
}

// 新建会议相关类型
export interface MeetingParticipant {
  id: string
  name: string
  email?: string
  department?: string
  userId: string
  role: 'host' | 'participant' | 'observer'
}

export interface MeetingMaterial {
  id: string
  name: string
  size: number
  type: string
  securityLevel: MeetingSecurityLevel
  uploadedAt: string
}

export interface MeetingAgenda {
  id: string
  name: string
  description?: string
  materials: MeetingMaterial[]
  order: number
}

export interface CreateMeetingRequest {
  name: string
  securityLevel: MeetingSecurityLevel
  type: MeetingType
  startTime: string
  endTime: string
  description?: string
  location?: string
  isRecorded?: boolean
  participants: Array<{
    userId: string
    role: 'participant' | 'observer'
  }>
  agendas: MeetingAgenda[]
}

// 数据字典相关类型
export type DictStatus = 'enabled' | 'disabled'

export interface DictItem {
  id: string
  code: string
  name: string
  value: string | number
  status: DictStatus
  sort: number
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface DataDict {
  id: string
  dictCode: string
  dictName: string
  dictType: string
  status: DictStatus
  itemCount: number
  remark?: string
  items?: DictItem[] // 使 items 变为可选的，以防止 undefined 错误
  createdAt: string
  updatedAt: string
}

export interface DictFilters {
  keyword?: string
  dictType?: string
  status?: DictStatus
}

export interface CreateDictRequest {
  dictCode: string
  dictName: string
  dictType: string
  status: DictStatus
  remark?: string
  items: Omit<DictItem, 'id' | 'createdAt' | 'updatedAt'>[]
}

export interface UpdateDictRequest extends Partial<CreateDictRequest> {
  id: string
}

// 部门相关类型
export interface Department {
  id: string
  name: string
  code: string
  description?: string
  parentId?: string
  managerId?: string
  managerName?: string
  level: number
  path: string
  sort: number
  status: 'enabled' | 'disabled'
  phone?: string
  email?: string
  address?: string
  employeeCount?: number
  children?: Department[]
  createdAt: string
  updatedAt: string
}

export interface DepartmentFilters {
  keyword?: string
  status?: 'enabled' | 'disabled'
  parentId?: string
}

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

export interface UpdateDepartmentRequest extends Partial<CreateDepartmentRequest> {
  id: string
}

export interface DepartmentTreeNode extends Department {
  children?: DepartmentTreeNode[]
  expanded?: boolean
}
