import { apiClient } from './api'
import type { ConfigItem, PaginationParams, PaginatedResponse } from '@/types'

export const configService = {
  // 获取配置列表
  getConfigs: (params?: PaginationParams & { search?: string; type?: string }) =>
    apiClient.get<PaginatedResponse<ConfigItem>>('/configs', params),

  // 获取配置详情
  getConfig: (id: string) =>
    apiClient.get<ConfigItem>(`/configs/${id}`),

  // 创建配置
  createConfig: (data: Omit<ConfigItem, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<ConfigItem>('/configs', data),

  // 更新配置
  updateConfig: (id: string, data: Partial<ConfigItem>) =>
    apiClient.put<ConfigItem>(`/configs/${id}`, data),

  // 删除配置
  deleteConfig: (id: string) =>
    apiClient.delete(`/configs/${id}`),

  // 验证YAML格式
  validateYaml: (content: string) =>
    apiClient.post<{ valid: boolean; error?: string }>('/configs/validate-yaml', { content }),

  // 导出配置
  exportConfig: (id: string) =>
    apiClient.get(`/configs/${id}/export`, { responseType: 'blob' }),

  // 导入配置
  importConfig: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post<ConfigItem>('/configs/import', formData)
  },
}
