/**
 * 域类型定义 - 设备相关
 */

// ========== 枚举类型 ==========

/**
 * 设备类型
 * 1: 平板设备
 * 2: 屏幕设备
 * 9: 其他设备
 */
export type DeviceType = 1 | 2 | 9

/**
 * 设备状态
 * -1: 未注册（设备挂载后自动创建，等待管理员处理）
 * 0: 离线
 * 1: 在线
 * 2: 维护中
 * 3: 已禁用
 */
export type DeviceStatus = -1 | 0 | 1 | 2 | 3

// ========== 接口定义 ==========

/**
 * 设备信息
 */
export interface Device {
  id: number
  code: string
  serialNumber: string
  type: DeviceType
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
  status: DeviceStatus
  statusName: string
  isDeleted: boolean
  authCode: string
  createdAt: string
  updatedAt: string
}

/**
 * 设备筛选参数
 */
export interface DeviceFilters {
  keyword?: string
  type?: DeviceType
  status?: DeviceStatus
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
  status: DeviceStatus
}
