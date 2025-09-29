/**
 * 部门服务 - 重构后的简洁版本
 * 直接使用HTTP客户端，移除Mock逻辑
 */

import { httpClient } from './core/http.client'
import type { 
  Department, 
  DepartmentFilters, 
  CreateDepartmentRequest, 
  UpdateDepartmentRequest,
  PaginatedResponse 
} from '@/types'

/**
 * 部门服务类
 * 封装部门相关的业务逻辑
 */
class DepartmentService {
  private basePath = '/departments'

  /**
   * 获取部门列表
   */
  async getDepartments(
    filters: DepartmentFilters = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<Department>> {
    return await httpClient.get<PaginatedResponse<Department>>(this.basePath, {
      ...filters,
      page,
      pageSize
    })
  }

  /**
   * 获取部门树形结构
   */
  async getDepartmentTree(): Promise<Department[]> {
    return await httpClient.get<Department[]>(`${this.basePath}/tree`)
  }

  /**
   * 获取单个部门详情
   */
  async getDepartment(id: string): Promise<Department> {
    return await httpClient.get<Department>(`${this.basePath}/${id}`)
  }

  /**
   * 创建部门
   */
  async createDepartment(departmentData: CreateDepartmentRequest): Promise<Department> {
    return await httpClient.post<Department>(this.basePath, departmentData)
  }

  /**
   * 更新部门
   */
  async updateDepartment(id: string, departmentData: UpdateDepartmentRequest): Promise<Department> {
    return await httpClient.put<Department>(`${this.basePath}/${id}`, departmentData)
  }

  /**
   * 删除部门
   */
  async deleteDepartment(id: string): Promise<boolean> {
    const response = await httpClient.delete<{ success: boolean }>(`${this.basePath}/${id}`)
    return response.success
  }

  /**
   * 批量删除部门
   */
  async deleteDepartments(ids: string[]): Promise<boolean> {
    const response = await httpClient.delete<{ successCount: number }>(`${this.basePath}/batch`, { ids })
    return response.successCount === ids.length
  }

  /**
   * 更新部门状态
   */
  async updateDepartmentStatus(id: string, status: 'active' | 'inactive'): Promise<boolean> {
    const response = await httpClient.patch<{ success: boolean }>(`${this.basePath}/${id}/status`, { status })
    return response.success
  }

  /**
   * 获取部门下的用户
   */
  async getDepartmentUsers(id: string, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<any>> {
    return await httpClient.get<PaginatedResponse<any>>(`${this.basePath}/${id}/users`, {
      page,
      pageSize
    })
  }

  /**
   * 搜索部门
   */
  async searchDepartments(keyword: string): Promise<Department[]> {
    const result = await this.getDepartments({ keyword }, 1, 100)
    return result.items
  }
}

export const departmentService = new DepartmentService()
