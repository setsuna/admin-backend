/**
 * 用户服务 - 重构后的简洁版本
 * 直接使用API服务，移除Mock逻辑
 */

import { userApiService } from './api/user.api'
import type { 
  User, 
  UserFilters, 
  CreateUserRequest, 
  UpdateUserRequest,
  PaginatedResponse,
  UserSecurityLevel 
} from '@/types'

/**
 * 用户服务类
 * 封装用户相关的业务逻辑
 */
class UserService {
  /**
   * 获取用户列表
   */
  async getUsers(
    filters: UserFilters = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<User>> {
    return userApiService.getUsers(filters, page, pageSize)
  }

  /**
   * 获取单个用户详情
   */
  async getUser(id: string): Promise<User> {
    return userApiService.getUser(id)
  }

  /**
   * 创建用户
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    return userApiService.createUser(userData)
  }

  /**
   * 更新用户信息
   */
  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    return userApiService.updateUser(id, userData)
  }

  /**
   * 删除用户
   */
  async deleteUser(id: string): Promise<boolean> {
    const result = await userApiService.deleteUser(id)
    return result.success
  }

  /**
   * 批量删除用户
   */
  async deleteUsers(ids: string[]): Promise<boolean> {
    const result = await userApiService.deleteUsers(ids)
    return result.successCount === ids.length
  }

  /**
   * 更新用户状态
   */
  async updateUserStatus(id: string, status: 'active' | 'inactive'): Promise<boolean> {
    const result = await userApiService.updateUserStatus(id, status)
    return result.success
  }

  /**
   * 重置用户密码
   */
  async resetUserPassword(id: string): Promise<{ tempPassword: string }> {
    return userApiService.resetUserPassword(id)
  }

  /**
   * 获取用户安全等级选项
   */
  async getUserSecurityLevels(): Promise<UserSecurityLevel[]> {
    return userApiService.getUserSecurityLevels()
  }

  /**
   * 搜索用户
   */
  async searchUsers(keyword: string): Promise<User[]> {
    const result = await this.getUsers({ keyword }, 1, 100)
    return result.items
  }
}

export const userService = new UserService()
