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
    filters: DepartmentFilters & { page?: number; pageSize?: number } = {}
  ): Promise<PaginatedResponse<Department>> {
    const { page = 1, pageSize = 20, ...restFilters } = filters
    return await httpClient.get<PaginatedResponse<Department>>(this.basePath, {
      ...restFilters,
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
  async updateDepartment(data: UpdateDepartmentRequest): Promise<Department> {
    const { id, ...departmentData } = data
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
   * 批量删除部门 (别名)
   */
  async batchDeleteDepartments(ids: string[]): Promise<boolean> {
    return this.deleteDepartments(ids)
  }

  /**
   * 移动部门
   */
  async moveDepartment(id: string, parentId?: string): Promise<Department> {
    return await httpClient.patch<Department>(`${this.basePath}/${id}/move`, { parentId })
  }

  /**
   * 获取部门选项列表
   */
  async getDepartmentOptions(): Promise<Array<{ label: string; value: string }>> {
    const departments = await this.getDepartmentTree()
    const options: Array<{ label: string; value: string }> = []
    
    const traverse = (depts: Department[], prefix = '') => {
      depts.forEach(dept => {
        options.push({
          label: prefix + dept.name,
          value: dept.id
        })
        if (dept.children && dept.children.length > 0) {
          traverse(dept.children, prefix + dept.name + ' / ')
        }
      })
    }
    
    traverse(departments)
    return options
  }

  /**
   * 获取部门统计信息
   */
  async getDepartmentStats(): Promise<{
    total: number
    active: number
    inactive: number
    avgEmployees: number
  }> {
    return await httpClient.get<{
      total: number
      active: number
      inactive: number
      avgEmployees: number
    }>(`${this.basePath}/stats`)
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
