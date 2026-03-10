/**
 * 终端日志（设备审计日志）领域类型定义
 */

// ==================== 操作类型 ====================

/**
 * 设备操作类型
 * 注意：平板端日志是持续扩展的，此列表不是完整列表
 */
export type DeviceAction =
  | 'app_start'
  | 'user_login'
  | 'user_logout'
  | 'meeting_open'
  | 'meeting_close'
  | 'unpack_success'
  | 'unpack_fail'
  | 'file_open'
  | 'file_save'
  | 'sign_in'
  | 'vote_submit'

// ==================== 日志实体 ====================

/**
 * 设备审计日志
 */
export interface DeviceAuditLog {
  /** 自增ID */
  id: number
  /** 设备序列号 */
  deviceSerial: string
  /** 操作发生时间（平板端记录） */
  timestamp: string
  /** 操作类型 */
  action: string
  /** 关联会议ID（部分操作没有） */
  meetingId: string | null
  /** 操作用户ID（部分操作没有） */
  userId: string | null
  /** 操作用户名 */
  userName: string | null
  /** JSON 字符串，额外信息 */
  extra: string | null
  /** 日志文件日期 */
  logDate: string
  /** 数据导入到服务器的时间 */
  importedAt: string
}

// ==================== 筛选条件 ====================

/**
 * 终端日志筛选条件
 */
export interface DeviceAuditLogFilters {
  /** 设备序列号 */
  deviceSerial?: string
  /** 操作类型 */
  action?: string
  /** 会议ID */
  meetingId?: string
  /** 用户ID */
  userId?: string
  /** 关键词搜索（用户名、操作类型、设备序列号） */
  keyword?: string
  /** 开始时间 */
  startTime?: string
  /** 结束时间 */
  endTime?: string
}

// ==================== 统计数据 ====================

/**
 * 操作类型统计项
 */
export interface DeviceActionCount {
  action: string
  count: number
}

/**
 * 终端日志统计
 */
export interface DeviceLogStats {
  /** 总日志数 */
  totalCount: number
  /** 设备数 */
  deviceCount: number
  /** 各操作类型分布 */
  actionCounts: DeviceActionCount[]
}

// ==================== 常量配置 ====================

/**
 * 设备操作类型配置
 * 用于前端显示中文标签和颜色
 */
export const DEVICE_ACTION_CONFIG: Record<string, { label: string; color: string }> = {
  app_start:      { label: '应用启动',  color: 'text-gray-600'   },
  user_login:     { label: '用户登录',  color: 'text-green-600'  },
  user_logout:    { label: '用户登出',  color: 'text-gray-500'   },
  meeting_open:   { label: '打开会议',  color: 'text-blue-600'   },
  meeting_close:  { label: '关闭会议',  color: 'text-blue-400'   },
  unpack_success: { label: '解包成功',  color: 'text-green-500'  },
  unpack_fail:    { label: '解包失败',  color: 'text-red-600'    },
  file_open:      { label: '打开文件',  color: 'text-purple-600' },
  file_save:      { label: '保存文件',  color: 'text-purple-400' },
  sign_in:        { label: '签到',      color: 'text-orange-600' },
  vote_submit:    { label: '提交投票',  color: 'text-cyan-600'   },
}
