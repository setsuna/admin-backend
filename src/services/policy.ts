/**
 * 策略配置业务服务层
 * 封装策略相关的业务逻辑，调用 API 服务层
 */

import { policyApi } from './api/policy.api'
import type { SecurityPolicy } from '@/types'

/**
 * 策略配置业务服务类
 */
class PolicyService {
  /**
   * 获取当前策略配置
   */
  async getPolicy(): Promise<SecurityPolicy> {
    return await policyApi.getPolicy()
  }

  /**
   * 更新策略配置
   * @param config - 策略配置
   */
  async updatePolicy(config: Omit<SecurityPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<SecurityPolicy> {
    return await policyApi.updatePolicy(config)
  }

  /**
   * 验证策略配置
   * @param config - 待验证的配置
   */
  async validatePolicy(config: Omit<SecurityPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ valid: boolean }> {
    return await policyApi.validatePolicy(config)
  }

  /**
   * 获取默认策略配置
   */
  async getDefaultPolicy(): Promise<SecurityPolicy> {
    return await policyApi.getDefaultPolicy()
  }

  /**
   * 导出策略配置
   */
  async exportPolicy(): Promise<Blob> {
    return await policyApi.exportPolicy()
  }
}

export const policyService = new PolicyService()
