import api from './api'
import { mockDepartmentService } from './mock/departmentData'
import type { 
  Department, 
  DepartmentFilters, 
  CreateDepartmentRequest, 
  UpdateDepartmentRequest,
  PaginatedResponse,
  ApiResponse 
} from '@/types'

// 判断是否使用Mock数据
const shouldUseMock = () => {
  return import.meta.env.VITE_ENABLE_MOCK === 'true' || 
         import.meta.env.NODE_ENV === 'development'
}

export const departmentService = {
  // 获取部门列表（分页）
  async getDepartments(filters?: DepartmentFilters & { page?: number; pageSize?: number }) {
    if (shouldUseMock()) {
      return mockDepartmentService.getDepartments(filters, filters?.page, filters?.pageSize)
    }
    
    const params = new URLSearchParams()
    
    if (filters?.keyword) params.append('keyword', filters.keyword)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.parentId) params.append('parentId', filters.parentId)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString())

    const response = await api.get<ApiResponse<PaginatedResponse<Department>>>(`/departments?${params}`)
    return response.data
  },

  // 获取部门树形结构
  async getDepartmentTree() {
    if (shouldUseMock()) {
      return mockDepartmentService.getDepartmentTree()
    }
    
    const response = await api.get<ApiResponse<Department[]>>('/departments/tree')
    return response.data
  },

  // 获取单个部门详情
  async getDepartment(id: string) {
    if (shouldUseMock()) {
      return mockDepartmentService.getDepartment(id)
    }
    
    const response = await api.get<ApiResponse<Department>>(`/departments/${id}`)
    return response.data
  },

  // 创建部门
  async createDepartment(data: CreateDepartmentRequest) {
    if (shouldUseMock()) {
      return mockDepartmentService.createDepartment(data)
    }
    
    const response = await api.post<ApiResponse<Department>>('/departments', data)
    return response.data
  },

  // 更新部门
  async updateDepartment(data: UpdateDepartmentRequest) {
    if (shouldUseMock()) {
      return mockDepartmentService.updateDepartment(data)
    }
    
    const { id, ...updateData } = data
    const response = await api.put<ApiResponse<Department>>(`/departments/${id}`, updateData)
    return response.data
  },

  // 删除部门
  async deleteDepartment(id: string) {
    if (shouldUseMock()) {
      return mockDepartmentService.deleteDepartment(id)
    }
    
    const response = await api.delete<ApiResponse<void>>(`/departments/${id}`)
    return response.data
  },

  // 批量删除部门
  async batchDeleteDepartments(ids: string[]) {
    if (shouldUseMock()) {
      return mockDepartmentService.batchDeleteDepartments(ids)
    }
    
    const response = await api.delete<ApiResponse<void>>('/departments/batch', { data: { ids } })
    return response.data
  },

  // 移动部门到指定父级
  async moveDepartment(id: string, parentId?: string) {
    if (shouldUseMock()) {
      return { code: 200, message: 'success', data: {} as Department }
    }
    
    const response = await api.put<ApiResponse<Department>>(`/departments/${id}/move`, { parentId })
    return response.data
  },

  // 获取部门下级选项（用于下拉框）
  async getDepartmentOptions(parentId?: string) {
    if (shouldUseMock()) {
      return mockDepartmentService.getDepartmentOptions()
    }
    
    const params = parentId ? `?parentId=${parentId}` : ''
    const response = await api.get<ApiResponse<Array<{ id: string; name: string; level: number }>>>(`/departments/options${params}`)
    return response.data
  },

  // 验证部门编码是否可用
  async checkDepartmentCode(code: string, excludeId?: string) {
    if (shouldUseMock()) {
      return { code: 200, message: 'success', data: { available: true } }
    }
    
    const params = new URLSearchParams({ code })
    if (excludeId) params.append('excludeId', excludeId)
    
    const response = await api.get<ApiResponse<{ available: boolean }>>(`/departments/check-code?${params}`)
    return response.data
  },

  // 获取部门统计信息
  async getDepartmentStats() {
    if (shouldUseMock()) {
      return {
        code: 200,
        message: 'success',
        data: {
          total: 9,
          enabled: 8,
          disabled: 1,
          topLevel: 4
        }
      }
    }
    
    const response = await api.get<ApiResponse<{
      total: number
      enabled: number
      disabled: number
      topLevel: number
    }>>('/departments/stats')
    return response.data
  }
}
