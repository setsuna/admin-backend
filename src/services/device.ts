/**
 * 设备服务 - 重构后的简洁版本
 * 统一使用httpClient，移除旧的apiClient
 */

import { httpClient } from './core/http.client'
import type { Device, DeviceStats, PaginationParams, PaginatedResponse } from '@/types'

/**
 * 设备服务类
 * 封装设备相关的业务逻辑
 */
class DeviceService {
  private basePath = '/devices'

  /**
   * 获取设备列表
   */
  async getDevices(params?: PaginationParams & { search?: string; status?: string }): Promise<PaginatedResponse<Device>> {
    return await httpClient.get<PaginatedResponse<Device>>(this.basePath, params)
  }

  /**
   * 获取设备详情
   */
  async getDevice(id: string): Promise<Device> {
    return await httpClient.get<Device>(`${this.basePath}/${id}`)
  }

  /**
   * 创建设备
   */
  async createDevice(data: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>): Promise<Device> {
    return await httpClient.post<Device>(this.basePath, data)
  }

  /**
   * 更新设备
   */
  async updateDevice(id: string, data: Partial<Device>): Promise<Device> {
    return await httpClient.put<Device>(`${this.basePath}/${id}`, data)
  }

  /**
   * 删除设备
   */
  async deleteDevice(id: string): Promise<boolean> {
    const response = await httpClient.delete<{ success: boolean }>(`${this.basePath}/${id}`)
    return response.data.success
  }

  /**
   * 批量删除设备
   */
  async batchDeleteDevices(ids: string[]): Promise<boolean> {
    const response = await httpClient.post<{ successCount: number }>(`${this.basePath}/batch-delete`, { ids })
    return response.data.successCount === ids.length
  }

  /**
   * 获取设备统计
   */
  async getDeviceStats(): Promise<DeviceStats> {
    return await httpClient.get<DeviceStats>(`${this.basePath}/stats`)
  }

  /**
   * 重启设备
   */
  async restartDevice(id: string): Promise<boolean> {
    const response = await httpClient.post<{ success: boolean }>(`${this.basePath}/${id}/restart`)
    return response.data.success
  }

  /**
   * 更新设备配置
   */
  async updateDeviceConfig(id: string, config: Record<string, any>): Promise<boolean> {
    return await httpClient.put<{ success: boolean }>(`${this.basePath}/${id}/config`, config)
    return response.data.success
  }
}

export const deviceService = new DeviceService()
