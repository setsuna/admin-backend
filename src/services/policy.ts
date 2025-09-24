/**
 * 安全策略服务 - 重构后的简洁版本
 * 直接使用HTTP客户端，移除Mock逻辑
 */

import { httpClient } from './core/http.client'
import type { SecurityPolicy } from '@/types'

/**
 * 安全策略服务类
 * 封装安全策略相关的业务逻辑
 */
class PolicyService {
  private basePath = '/policies'

  /**
   * 获取当前策略配置
   */
  async getPolicyConfig(): Promise<SecurityPolicy> {
    const response = await httpClient.get<SecurityPolicy>(`${this.basePath}/current`)
    return response.data
  }

  /**
   * 更新策略配置
   */
  async updatePolicyConfig(config: Partial<SecurityPolicy>): Promise<SecurityPolicy> {
    const response = await httpClient.put<SecurityPolicy>(`${this.basePath}/current`, config)
    return response.data
  }

  /**
   * 重置策略配置为默认值
   */
  async resetPolicyConfig(): Promise<SecurityPolicy> {
    const response = await httpClient.post<SecurityPolicy>(`${this.basePath}/reset`)
    return response.data
  }

  /**
   * 获取策略历史记录
   */
  async getPolicyHistory(page: number = 1, pageSize: number = 20): Promise<any> {
    const response = await httpClient.get(`${this.basePath}/history`, { page, pageSize })
    return response.data
  }

  /**
   * 验证策略配置
   */
  async validatePolicyConfig(config: SecurityPolicy): Promise<{ valid: boolean; errors?: string[] }> {
    const response = await httpClient.post<{ valid: boolean; errors?: string[] }>(`${this.basePath}/validate`, config)
    return response.data
  }
}

export const policyService = new PolicyService()
