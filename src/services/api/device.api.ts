/**
 * 设备管理 API 服务
 */

import { httpClient } from '@/services/core/http.client'
import { API_PATHS } from '@/config'
import type {
  ManagedDevice,
  ManagedDeviceFilters,
  CreateDeviceRequest,
  UpdateDeviceRequest,
  UpdateDeviceStatusRequest,
  PaginatedResponse,
  OperationResult,
} from '@/types'

/**
 * 后端返回的设备数据（snake_case）
 */
interface DeviceResponse {
  id: number
  code: string
  serial_number: string
  type: number
  type_name: string
  number?: number
  department: string
  manager: string
  remark: string
  bind_id: number
  room_id: number
  last_login?: string
  ip: string
  mac: string
  screen_port: number
  screen_width: number
  screen_height: number
  screen_img_ext: string
  ctrl_code: string
  status: number
  status_name: string
  is_deleted: boolean
  auth_code: string
  created_at: string
  updated_at: string
}

/**
 * 转换后端响应为前端类型
 */
function transformDevice(data: DeviceResponse): ManagedDevice {
  return {
    id: data.id,
    code: data.code,
    serialNumber: data.serial_number,
    type: data.type as ManagedDevice['type'],
    typeName: data.type_name,
    number: data.number,
    department: data.department,
    manager: data.manager,
    remark: data.remark,
    bindId: data.bind_id,
    roomId: data.room_id,
    lastLogin: data.last_login,
    ip: data.ip,
    mac: data.mac,
    screenPort: data.screen_port,
    screenWidth: data.screen_width,
    screenHeight: data.screen_height,
    screenImgExt: data.screen_img_ext,
    ctrlCode: data.ctrl_code,
    status: data.status as ManagedDevice['status'],
    statusName: data.status_name,
    isDeleted: data.is_deleted,
    authCode: data.auth_code,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export class DeviceApiService {
  private basePath = API_PATHS.DEVICES

  /**
   * 获取设备列表
   */
  async getDevices(
    filters: ManagedDeviceFilters = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<ManagedDevice>> {
    const response = await httpClient.get<PaginatedResponse<DeviceResponse>>(this.basePath, {
      keyword: filters.keyword,
      type: filters.type,
      status: filters.status,
      page,
      size: pageSize,
    })

    return {
      ...response,
      items: (response.items || []).map(transformDevice),
    }
  }

  /**
   * 获取单个设备详情
   */
  async getDevice(id: number): Promise<ManagedDevice> {
    const response = await httpClient.get<DeviceResponse>(`${this.basePath}/${id}`)
    return transformDevice(response)
  }

  /**
   * 创建设备
   */
  async createDevice(data: CreateDeviceRequest): Promise<ManagedDevice> {
    const response = await httpClient.post<DeviceResponse>(this.basePath, data)
    return transformDevice(response)
  }

  /**
   * 更新设备信息
   */
  async updateDevice(id: number, data: UpdateDeviceRequest): Promise<ManagedDevice> {
    const response = await httpClient.put<DeviceResponse>(`${this.basePath}/${id}`, data)
    return transformDevice(response)
  }

  /**
   * 更新设备状态
   */
  async updateDeviceStatus(id: number, data: UpdateDeviceStatusRequest): Promise<OperationResult> {
    return await httpClient.patch<OperationResult>(`${this.basePath}/${id}/status`, data)
  }

  /**
   * 删除设备
   */
  async deleteDevice(id: number): Promise<OperationResult> {
    return await httpClient.delete<OperationResult>(`${this.basePath}/${id}`)
  }
}

export const deviceApiService = new DeviceApiService()

// 别名导出
export const deviceApi = deviceApiService
