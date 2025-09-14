import { api } from './api'
import { mockPolicyService } from './mock/policyData'
import type { 
  SecurityPolicy,
  PolicyConfigFilters,
  CreatePolicyRequest,
  UpdatePolicyRequest,
  ApiResponse 
} from '@/types'

// 判断是否使用Mock数据
const shouldUseMock = () => {
  return import.meta.env.VITE_ENABLE_MOCK === 'true' || 
         import.meta.env.NODE_ENV === 'development'
}

export const policyService = {
  // 获取当前策略配置
  async getPolicyConfig() {
    if (shouldUseMock()) {
      return mockPolicyService.getPolicyConfig()
    }
    
    const response = await api.get<ApiResponse<SecurityPolicy>>('/system/policy')
    return response.data
  },

  // 更新策略配置
  async updatePolicyConfig(config: SecurityPolicy) {
    if (shouldUseMock()) {
      return mockPolicyService.updatePolicyConfig(config)
    }
    
    const response = await api.put<ApiResponse<SecurityPolicy>>('/system/policy', config)
    return response.data
  },

  // 获取策略配置历史
  async getPolicyHistory(limit: number = 20) {
    if (shouldUseMock()) {
      return mockPolicyService.getPolicyHistory(limit)
    }
    
    const response = await api.get<ApiResponse<Array<{
      id: string
      version: number
      config: SecurityPolicy
      updatedBy: string
      updatedByName: string
      updatedAt: string
      reason?: string
    }>>>(`/system/policy/history?limit=${limit}`)
    return response.data
  },

  // 恢复到指定版本
  async restorePolicyVersion(versionId: string) {
    if (shouldUseMock()) {
      return mockPolicyService.restorePolicyVersion(versionId)
    }
    
    const response = await api.post<ApiResponse<SecurityPolicy>>(`/system/policy/restore/${versionId}`)
    return response.data
  },

  // 验证策略配置
  async validatePolicyConfig(config: SecurityPolicy) {
    if (shouldUseMock()) {
      return mockPolicyService.validatePolicyConfig(config)
    }
    
    const response = await api.post<ApiResponse<{
      valid: boolean
      errors: string[]
      warnings: string[]
    }>>('/system/policy/validate', config)
    return response.data
  },

  // 获取默认策略配置
  async getDefaultPolicyConfig() {
    if (shouldUseMock()) {
      return mockPolicyService.getDefaultPolicyConfig()
    }
    
    const response = await api.get<ApiResponse<SecurityPolicy>>('/system/policy/default')
    return response.data
  },

  // 导出策略配置
  async exportPolicyConfig() {
    if (shouldUseMock()) {
      return mockPolicyService.exportPolicyConfig()
    }
    
    const response = await api.get('/system/policy/export', {
      responseType: 'blob'
    })
    return response.data
  },

  // 导入策略配置
  async importPolicyConfig(file: File) {
    if (shouldUseMock()) {
      return mockPolicyService.importPolicyConfig(file)
    }
    
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post<ApiResponse<SecurityPolicy>>('/system/policy/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // 获取策略影响分析
  async getPolicyImpactAnalysis(config: SecurityPolicy) {
    if (shouldUseMock()) {
      return mockPolicyService.getPolicyImpactAnalysis(config)
    }
    
    const response = await api.post<ApiResponse<{
      affectedUsers: number
      affectedSessions: number
      systemChanges: string[]
      riskAssessment: 'low' | 'medium' | 'high'
    }>>('/system/policy/impact-analysis', config)
    return response.data
  }
}