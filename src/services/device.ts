import { apiClient } from './api'
import type { Device, DeviceStats, PaginationParams, PaginatedResponse } from '@/types'

export const deviceService = {
  // 获取设备列表
  getDevices: (params?: PaginationParams & { search?: string; status?: string }) =>
    apiClient.get<PaginatedResponse<Device>>('/devices', params),

  // 获取设备详情
  getDevice: (id: string) =>
    apiClient.get<Device>(`/devices/${id}`),

  // 创建设备
  createDevice: (data: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<Device>('/devices', data),

  // 更新设备
  updateDevice: (id: string, data: Partial<Device>) =>
    apiClient.put<Device>(`/devices/${id}`, data),

  // 删除设备
  deleteDevice: (id: string) =>
    apiClient.delete(`/devices/${id}`),

  // 批量删除设备
  batchDeleteDevices: (ids: string[]) =>
    apiClient.post('/devices/batch-delete', { ids }),

  // 获取设备统计
  getDeviceStats: () =>
    apiClient.get<DeviceStats>('/devices/stats'),

  // 重启设备
  restartDevice: (id: string) =>
    apiClient.post(`/devices/${id}/restart`),

  // 更新设备配置
  updateDeviceConfig: (id: string, config: Record<string, any>) =>
    apiClient.put(`/devices/${id}/config`, config),
}
