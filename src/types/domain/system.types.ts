/**
 * 系统管理领域类型定义
 * 包含部门、角色、权限、设备、配置等系统管理相关类型
 */

import type { 
  BaseEntity, 
  StatusEntity, 
  TreeNode, 
  ISODateString, 
  ContactInfo,
  PermissionAction
} from '../common'

// 部门管理
export interface Department extends StatusEntity, TreeNode {
  name: string
  code: string
  description?: string
  parentId?: string
  managerId?: string
  managerName?: string
  level: number
  path: string
  sort: number
  phone?: string
  email?: string
  address?: string
  employeeCount?: number
  children?: Department[]
  contacts?: ContactInfo[]
  costCenter?: string
  budget?: number
  location?: {
    building?: string
    floor?: string
    room?: string
  }
}

// 角色管理
export interface Role extends StatusEntity {
  name: string
  code: string
  description?: string
  permissions: string[]
  type: 'system' | 'business' | 'custom'
  level: number
  userCount?: number
  isBuiltIn: boolean
  parent?: string
  children?: string[]
  metadata?: {
    color?: string
    icon?: string
    category?: string
  }
}

// 权限管理
export interface Permission extends BaseEntity {
  name: string
  code: string
  category: string
  resource: string
  action: PermissionAction
  description?: string
  type: 'menu' | 'button' | 'api' | 'data'
  parent?: string
  children?: Permission[]
  level: number
  sort: number
  conditions?: Array<{
    field: string
    operator: 'eq' | 'ne' | 'in' | 'nin' | 'gt' | 'lt' | 'gte' | 'lte'
    value: any
  }>
  metadata?: {
    icon?: string
    color?: string
    group?: string
  }
}

// 权限组
export interface PermissionGroup extends BaseEntity {
  key: string
  name: string
  permissions: Permission[]
  description?: string
  type: 'system' | 'business' | 'feature'
  sort: number
  icon?: string
}

// 角色权限矩阵
export interface RolePermissionMatrix {
  roleId: string
  roleName: string
  permissions: Record<string, boolean>
  inheritedPermissions?: Record<string, string>
  effectivePermissions: string[]
}

// 权限验证结果
export interface PermissionCheckResult {
  hasAccess: boolean
  missingPermissions?: string[]
  reason?: string
  context?: {
    userId: string
    resource: string
    action: string
    conditions?: Record<string, any>
  }
}

// 设备管理
export type DeviceType = 'server' | 'workstation' | 'laptop' | 'tablet' | 'phone' | 'iot' | 'network' | 'storage'
export type DeviceStatus = 'online' | 'offline' | 'warning' | 'error' | 'maintenance'

export interface Device extends BaseEntity {
  name: string
  type: DeviceType
  status: DeviceStatus
  ip: string
  port: number
  location?: string
  description?: string
  serialNumber?: string
  manufacturer?: string
  model?: string
  osVersion?: string
  lastSeen?: ISODateString
  config?: DeviceConfig
  metrics?: DeviceMetrics
  owner?: {
    userId: string
    userName: string
    department?: string
  }
  tags?: string[]
  warranty?: {
    startDate: ISODateString
    endDate: ISODateString
    provider: string
    level: string
  }
}

// 设备配置
export interface DeviceConfig {
  network?: {
    dhcp: boolean
    dns: string[]
    gateway: string
    subnet: string
  }
  security?: {
    firewall: boolean
    antivirus: boolean
    encryption: boolean
    lastSecurityScan?: ISODateString
  }
  monitoring?: {
    enabled: boolean
    interval: number
    metrics: string[]
    alerts: boolean
  }
  maintenance?: {
    autoUpdate: boolean
    maintenanceWindow: {
      start: string
      end: string
      timezone: string
    }
    lastMaintenance?: ISODateString
  }
  custom?: Record<string, any>
}

// 设备指标
export interface DeviceMetrics {
  timestamp: ISODateString
  cpu?: {
    usage: number
    temperature?: number
    frequency?: number
  }
  memory?: {
    total: number
    used: number
    available: number
    usage: number
  }
  disk?: {
    total: number
    used: number
    available: number
    usage: number
  }
  network?: {
    bytesIn: number
    bytesOut: number
    packetsIn: number
    packetsOut: number
    errors: number
  }
  custom?: Record<string, number>
}

// 设备统计
export interface DeviceStats {
  total: number
  online: number
  offline: number
  warning: number
  error: number
  maintenance: number
  byType: Record<DeviceType, number>
  byLocation: Record<string, number>
  avgUptime: number
  totalIncidents: number
}

// 数据字典管理
export interface DataDict extends StatusEntity {
  dictCode: string
  dictName: string
  dictType: string
  itemCount: number
  remark?: string
  items?: DictItem[]
  category?: string
  isSystem: boolean
  scope: 'global' | 'module' | 'user'
  validations?: {
    required?: boolean
    minItems?: number
    maxItems?: number
    uniqueValues?: boolean
  }
}

// 字典项
export interface DictItem extends StatusEntity {
  dictId: string
  code: string
  name: string
  value: string | number
  sort: number
  remark?: string
  parent?: string
  children?: DictItem[]
  level?: number
  color?: string
  icon?: string
  extra?: Record<string, any>
}

// 配置管理
export interface ConfigItem extends BaseEntity {
  name: string
  description?: string
  content: string
  type: 'yaml' | 'json' | 'text' | 'properties' | 'xml'
  category?: string
  environment: 'development' | 'staging' | 'production' | 'all'
  version: number
  isEncrypted: boolean
  isReadonly: boolean
  validationSchema?: string
  dependencies?: string[]
  tags?: string[]
  owner?: {
    userId: string
    userName: string
    department?: string
  }
  approvals?: Array<{
    userId: string
    userName: string
    action: 'approve' | 'reject'
    comment?: string
    timestamp: ISODateString
  }>
}

// 配置历史
export interface ConfigHistory extends BaseEntity {
  configId: string
  version: number
  content: string
  changeType: 'create' | 'update' | 'delete' | 'rollback'
  changeDescription?: string
  changedBy: string
  changedByName: string
  approved: boolean
  approvedBy?: string
  approvedAt?: ISODateString
  rollbackFromVersion?: number
}

// 策略配置管理
export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  changeIntervalDays: number
  maxFailAttempts: number
  lockoutDurationMinutes: number
  preventReuse: number
  strengthRequirement: 'weak' | 'medium' | 'strong'
  customRules?: Array<{
    pattern: string
    message: string
    required: boolean
  }>
}

export interface TimeWindow {
  start: string
  end: string
  enabled: boolean
  timezone?: string
  days?: number[]
}

export interface SecurityPolicy extends BaseEntity {
  systemSecurityLevel: 'confidential' | 'secret'
  allowSecurityDowngrade: boolean
  serverFileRetentionDays: number
  clientFileExpirationHours: number
  fileUploadMaxSize: number
  allowedFileTypes: string[]
  fileEncryptionEnabled: boolean
  passwordPolicy: PasswordPolicy
  sessionTimeoutMinutes: number
  idleLockTimeoutMinutes: number
  maxConcurrentSessions: number
  rememberPasswordEnabled: boolean
  singleSignOnEnabled: boolean
  ipWhitelistEnabled: boolean
  ipWhitelist: string[]
  allowedLoginHours: TimeWindow
  deviceBindingEnabled: boolean
  geoLocationRestricted: boolean
  auditLogRetentionDays: number
  sensitiveOperationLogging: 'minimal' | 'standard' | 'detailed'
  auditLogExportEnabled: boolean
  maintenanceWindow: TimeWindow
  autoBackupEnabled: boolean
  backupRetentionDays: number
}

// 菜单管理
export interface MenuItem extends BaseEntity {
  key: string
  label: string
  icon?: string
  path?: string
  parent?: string
  children?: MenuItem[]
  type: 'group' | 'item' | 'divider'
  permissions?: string[]
  visible: boolean
  disabled: boolean
  sort: number
  level: number
  target?: '_self' | '_blank' | '_parent' | '_top'
  badge?: {
    count: number
    color: string
    dot: boolean
  }
  meta?: {
    title?: string
    description?: string
    keywords?: string[]
    cache?: boolean
    affix?: boolean
  }
}

// 菜单配置
export interface MenuConfig extends BaseEntity {
  name?: string
  type?: 'admin' | 'user' | 'mobile'
  menus: MenuItem[]
  defaultExpanded?: string[]
  theme?: 'light' | 'dark'
  mode?: 'horizontal' | 'vertical' | 'inline'
  collapsed?: boolean
  width?: number
  version?: number
  isActive?: boolean
  roles?: string[]
  environments?: string[]
  // 🆕 用户权限字段（来自 /menus/user-config API）
  userId?: string
  userPermissions?: string[]
}

// 系统日志
export interface SystemLog extends BaseEntity {
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  message: string
  module: string
  userId?: string
  userName?: string
  action?: string
  resource?: string
  resourceId?: string
  ip?: string
  userAgent?: string
  duration?: number
  status?: 'success' | 'failed'
  errorCode?: string
  errorMessage?: string
  stackTrace?: string
  metadata?: Record<string, any>
  tags?: string[]
  traceId?: string
  spanId?: string
}

// 操作审计
export interface AuditLog extends BaseEntity {
  userId: string
  userName: string
  action: string
  resource: string
  resourceId?: string
  description: string
  ip: string
  userAgent: string
  location?: string
  status: 'success' | 'failed'
  duration?: number
  oldValue?: Record<string, any>
  newValue?: Record<string, any>
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  businessImpact?: string
  complianceFlags?: string[]
  metadata?: Record<string, any>
}
