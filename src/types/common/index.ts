/**
 * 通用类型导出文件
 * 统一导出common模块的所有类型
 */

// 基础类型
export * from './base.types'

// UI类型
export * from './ui.types'

// WebSocket类型
export * from './websocket.types'

// 常用类型别名
export type { ID, ISODateString, UnixTimestamp } from './base.types'
export type { NotificationType, ActionButton, BatchAction } from './ui.types'

// 设备相关类型别名
export type { ClientDeviceType, BrowserType, OSType } from './base.types'
