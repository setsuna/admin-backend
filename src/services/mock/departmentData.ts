import type { Department, PaginatedResponse, ApiResponse } from '@/types'

// Mock部门数据
export const mockDepartments: Department[] = [
  {
    id: '1',
    name: '总办',
    code: 'ZB',
    description: '总经理办公室',
    parentId: undefined,
    managerId: 'user1',
    managerName: '张总',
    level: 0,
    path: '/1',
    sort: 1,
    status: 'enabled',
    phone: '010-12345678',
    email: 'zb@company.com',
    address: '总部大厦10楼',
    employeeCount: 5,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    children: [
      {
        id: '2',
        name: '行政部',
        code: 'XZ',
        description: '行政管理部门',
        parentId: '1',
        managerId: 'user2',
        managerName: '李经理',
        level: 1,
        path: '/1/2',
        sort: 1,
        status: 'enabled',
        phone: '010-12345679',
        email: 'xz@company.com',
        address: '总部大厦9楼',
        employeeCount: 8,
        createdAt: '2023-01-02T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z'
      },
      {
        id: '3',
        name: '人力资源部',
        code: 'HR',
        description: '人力资源管理部门',
        parentId: '1',
        managerId: 'user3',
        managerName: '王经理',
        level: 1,
        path: '/1/3',
        sort: 2,
        status: 'enabled',
        phone: '010-12345680',
        email: 'hr@company.com',
        address: '总部大厦8楼',
        employeeCount: 12,
        createdAt: '2023-01-03T00:00:00Z',
        updatedAt: '2023-01-03T00:00:00Z'
      }
    ]
  },
  {
    id: '4',
    name: '技术部',
    code: 'TECH',
    description: '技术研发部门',
    parentId: undefined,
    managerId: 'user4',
    managerName: '赵总监',
    level: 0,
    path: '/4',
    sort: 2,
    status: 'enabled',
    phone: '010-12345681',
    email: 'tech@company.com',
    address: '技术楼1-3楼',
    employeeCount: 50,
    createdAt: '2023-01-04T00:00:00Z',
    updatedAt: '2023-01-04T00:00:00Z',
    children: [
      {
        id: '5',
        name: '前端组',
        code: 'FE',
        description: '前端开发组',
        parentId: '4',
        managerId: 'user5',
        managerName: '孙组长',
        level: 1,
        path: '/4/5',
        sort: 1,
        status: 'enabled',
        phone: '010-12345682',
        email: 'fe@company.com',
        address: '技术楼1楼',
        employeeCount: 15,
        createdAt: '2023-01-05T00:00:00Z',
        updatedAt: '2023-01-05T00:00:00Z'
      },
      {
        id: '6',
        name: '后端组',
        code: 'BE',
        description: '后端开发组',
        parentId: '4',
        managerId: 'user6',
        managerName: '周组长',
        level: 1,
        path: '/4/6',
        sort: 2,
        status: 'enabled',
        phone: '010-12345683',
        email: 'be@company.com',
        address: '技术楼2楼',
        employeeCount: 20,
        createdAt: '2023-01-06T00:00:00Z',
        updatedAt: '2023-01-06T00:00:00Z'
      },
      {
        id: '7',
        name: '测试组',
        code: 'QA',
        description: '质量保证组',
        parentId: '4',
        managerId: 'user7',
        managerName: '吴组长',
        level: 1,
        path: '/4/7',
        sort: 3,
        status: 'enabled',
        phone: '010-12345684',
        email: 'qa@company.com',
        address: '技术楼3楼',
        employeeCount: 10,
        createdAt: '2023-01-07T00:00:00Z',
        updatedAt: '2023-01-07T00:00:00Z'
      }
    ]
  },
  {
    id: '8',
    name: '市场部',
    code: 'MKT',
    description: '市场营销部门',
    parentId: undefined,
    managerId: 'user8',
    managerName: '陈总监',
    level: 0,
    path: '/8',
    sort: 3,
    status: 'enabled',
    phone: '010-12345685',
    email: 'mkt@company.com',
    address: '商务楼5楼',
    employeeCount: 25,
    createdAt: '2023-01-08T00:00:00Z',
    updatedAt: '2023-01-08T00:00:00Z'
  },
  {
    id: '9',
    name: '财务部',
    code: 'FIN',
    description: '财务管理部门',
    parentId: undefined,
    managerId: 'user9',
    managerName: '刘总监',
    level: 0,
    path: '/9',
    sort: 4,
    status: 'disabled',
    phone: '010-12345686',
    email: 'fin@company.com',
    address: '总部大厦6楼',
    employeeCount: 8,
    createdAt: '2023-01-09T00:00:00Z',
    updatedAt: '2023-01-09T00:00:00Z'
  }
]

// 扁平化部门数据（用于表格显示）
export const flattenDepartments = (departments: Department[]): Department[] => {
  const result: Department[] = []
  const traverse = (depts: Department[]) => {
    depts.forEach(dept => {
      result.push(dept)
      if (dept.children) {
        traverse(dept.children)
      }
    })
  }
  traverse(departments)
  return result
}

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock部门服务
export const mockDepartmentService = {
  async getDepartments(filters: any = {}, page = 1, pageSize = 20): Promise<ApiResponse<PaginatedResponse<Department>>> {
    await delay(500)
    
    let filtered = flattenDepartments(mockDepartments)
    
    // 应用筛选
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      filtered = filtered.filter(dept => 
        dept.name.toLowerCase().includes(keyword) ||
        dept.code.toLowerCase().includes(keyword)
      )
    }
    
    if (filters.status) {
      filtered = filtered.filter(dept => dept.status === filters.status)
    }
    
    if (filters.parentId) {
      filtered = filtered.filter(dept => dept.parentId === filters.parentId)
    }
    
    // 分页
    const total = filtered.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const items = filtered.slice(start, start + pageSize)
    
    return {
      code: 200,
      message: 'success',
      data: {
        items,
        pagination: {
          page,
          pageSize,
          total,
          totalPages
        }
      }
    }
  },

  async getDepartmentTree(): Promise<ApiResponse<Department[]>> {
    await delay(300)
    return {
      code: 200,
      message: 'success',
      data: mockDepartments
    }
  },

  async getDepartment(id: string): Promise<ApiResponse<Department>> {
    await delay(200)
    const dept = flattenDepartments(mockDepartments).find(d => d.id === id)
    if (!dept) {
      throw new Error('部门不存在')
    }
    return {
      code: 200,
      message: 'success',
      data: dept
    }
  },

  async createDepartment(data: any): Promise<ApiResponse<Department>> {
    await delay(800)
    const newDept: Department = {
      id: Date.now().toString(),
      ...data,
      level: data.parentId ? 1 : 0,
      path: data.parentId ? `/parent/${Date.now()}` : `/${Date.now()}`,
      employeeCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // 这里实际应该更新mockDepartments，但为了演示简单，直接返回
    return {
      code: 200,
      message: 'success',
      data: newDept
    }
  },

  async updateDepartment(data: any): Promise<ApiResponse<Department>> {
    await delay(600)
    const dept = flattenDepartments(mockDepartments).find(d => d.id === data.id)
    if (!dept) {
      throw new Error('部门不存在')
    }
    
    const updated = {
      ...dept,
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    return {
      code: 200,
      message: 'success',
      data: updated
    }
  },

  async deleteDepartment(id: string): Promise<ApiResponse<void>> {
    await delay(400)
    const dept = flattenDepartments(mockDepartments).find(d => d.id === id)
    if (!dept) {
      throw new Error('部门不存在')
    }
    
    return {
      code: 200,
      message: 'success',
      data: undefined
    }
  },

  async batchDeleteDepartments(ids: string[]): Promise<ApiResponse<void>> {
    await delay(600)
    return {
      code: 200,
      message: 'success',
      data: undefined
    }
  },

  async getDepartmentOptions(): Promise<ApiResponse<Array<{ id: string; name: string; level: number }>>> {
    await delay(200)
    const options = flattenDepartments(mockDepartments).map(dept => ({
      id: dept.id,
      name: dept.name,
      level: dept.level
    }))
    
    return {
      code: 200,
      message: 'success',
      data: options
    }
  }
}
