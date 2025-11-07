/**
 * WebSocket 消息类型
 */
export type WSMessageType = 
  | 'device_online'
  | 'device_offline'
  | 'system_notify'
  | 'heartbeat'
  | 'meeting_create'
  | 'meeting_update'
  | 'meeting_delete'
  | 'sync_progress'

/**
 * WebSocket 消息基础结构
 */
export interface WSMessage<T = any> {
  type: WSMessageType
  data: T
  timestamp: number
  requestId?: string
}

/**
 * 设备上线消息数据
 */
export interface DeviceOnlineData {
  serialNumber: string
  deviceName: string
  mountPath: string
  isRegistered: boolean
}

/**
 * 设备下线消息数据
 */
export interface DeviceOfflineData {
  serialNumber: string
  deviceName: string
}

/**
 * 系统通知消息数据
 */
export interface SystemNotifyData {
  title: string
  content: string
  level: 'info' | 'warning' | 'error'
}

/**
 * 心跳消息数据
 */
export interface HeartbeatData {
  serverTime: number
}

/**
 * 同步进度消息数据（后端实际返回）
 */
export interface SyncProgressData {
  task_id: string
  progress: number
  speed: string
  eta: string
  current_file?: string
}

/**
 * WebSocket 连接状态
 */
export type WSConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error'

/**
 * WebSocket 配置
 */
export interface WSConfig {
  url: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
}
