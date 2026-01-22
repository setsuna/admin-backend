/**
 * 域类型定义 - 设备管理相关
 * 注意：这是设备管理模块专用的类型，与 system.types.ts 中的通用 Device 不同
 */

// ========== 枚举类型 ==========

/**
 * 管理设备类型
 * 1: 平板设备
 * 2: 屏幕设备
 * 9: 其他设备
 */
export type ManagedDeviceType = 1 | 2 | 9

/**
 * 管理设备状态
 * -1: 未注册（设备挂载后自动创建，等待管理员处理）
 * 0: 离线
 * 1: 在线
 * 2: 维护中
 * 3: 已禁用
 */
export type ManagedDeviceStatus = -1 | 0 | 1 | 2 | 3

// ========== 接口定义 ==========

/**
 * 管理设备信息
 */
export interface ManagedDevice {
  id: number
  code: string
  serialNumber: string
  type: ManagedDeviceType
  typeName: string
  number?: number
  department: string
  manager: string
  remark: string
  bindId: number
  roomId: number
  lastLogin?: string
  ip: string
  mac: string
  screenPort: number
  screenWidth: number
  screenHeight: number
  screenImgExt: string
  ctrlCode: string
  status: ManagedDeviceStatus
  statusName: string
  isDeleted: boolean
  authCode: string
  createdAt: string
  updatedAt: string
}

/**
 * 管理设备筛选参数
 */
export interface ManagedDeviceFilters {
  keyword?: string
  type?: ManagedDeviceType
  status?: ManagedDeviceStatus
}

/**
 * 创建设备请求
 */
export interface CreateDeviceRequest {
  serial_number: string
  number?: number
  department?: string
  manager?: string
  remark?: string
}

/**
 * 更新设备请求
 */
export interface UpdateDeviceRequest {
  serial_number?: string
  number?: number
  department?: string
  manager?: string
  remark?: string
}

/**
 * 更新设备状态请求
 */
export interface UpdateDeviceStatusRequest {
  status: ManagedDeviceStatus
}
