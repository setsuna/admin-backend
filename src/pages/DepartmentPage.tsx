import { useState } from 'react'
import { Plus, Edit, Trash2, Search, RefreshCw, Building2, Users, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { DataTable } from '@/components/features/DataTable'
import { Select } from '@/components/ui/Select'
import { StatusIndicator } from '@/components/ui/StatusIndicator'
import { Loading } from '@/components/ui/Loading'
import { FormModal } from '@/components/ui/FormModal'
import { useGlobalDialog } from '@/components/ui/DialogProvider'
import { DepartmentTree } from '@/components/business/department/DepartmentTree'
import { DepartmentStats } from '@/components/business/department/DepartmentStats'
import { useDepartment } from '@/hooks/useDepartment'
import type { Department, CreateDepartmentRequest, UpdateDepartmentRequest } from '@/types'

interface DepartmentFormData {
  name: string
  code: string
  description?: string
  parentId?: string
  managerId?: string
  sort: number
  status: 'enabled' | 'disabled'
  phone?: string
  email?: string
  address?: string
}

const DepartmentPage = () => {
  const { showConfirm } = useGlobalDialog()
  
  // 使用部门管理hook
  const {
    departments,
    departmentTree,
    departmentOptions,
    pagination,
    filters,
    viewMode,
    selectedIds,
    isLoading,
    setFilters,
    setPagination,
    setViewMode,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    batchDeleteDepartments,
    isCreating,
    isUpdating,
    isBatchDeleting,
    refreshData,
    countTotalDepartments
  } = useDepartment()
  
  // 表单状态
  const [showForm, setShowForm] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [parentIdForNew, setParentIdForNew] = useState<string>()
  
  // 表单字段配置
  const formFields = [
    {
      name: 'name',
      label: '部门名称',
      type: 'text' as const,
      required: true,
      placeholder: '请输入部门名称'
    },
    {
      name: 'code',
      label: '部门编码',
      type: 'text' as const,
      required: true,
      placeholder: '请输入部门编码'
    },
    {
      name: 'parentId',
      label: '上级部门',
      type: 'select' as const,
      options: [
        { label: '无上级部门', value: '' },
        ...departmentOptions.map(dept => ({
          label: '  '.repeat(dept.level) + dept.name,
          value: dept.value
        }))
      ]
    },
    {
      name: 'description',
      label: '部门描述',
      type: 'textarea' as const,
      placeholder: '请输入部门描述'
    },
    {
      name: 'sort',
      label: '排序号',
      type: 'number' as const,
      required: true,
      placeholder: '数值越小排序越靠前'
    },
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      required: true,
      options: [
        { label: '启用', value: 'enabled' },
        { label: '禁用', value: 'disabled' }
      ]
    },
    {
      name: 'phone',
      label: '联系电话',
      type: 'text' as const,
      placeholder: '请输入联系电话'
    },
    {
      name: 'email',
      label: '邮箱地址',
      type: 'email' as const,
      placeholder: '请输入邮箱地址'
    },
    {
      name: 'address',
      label: '办公地址',
      type: 'text' as const,
      placeholder: '请输入办公地址'
    }
  ]
  
  // 处理表单提交
  const handleSubmit = (data: DepartmentFormData) => {
    if (editingDepartment) {
      updateDepartment({ ...data, id: editingDepartment.id } as UpdateDepartmentRequest)
    } else {
      createDepartment(data as CreateDepartmentRequest)
    }
    setShowForm(false)
    setEditingDepartment(null)
    setParentIdForNew(undefined)
  }
  
  // 处理添加（支持指定父级）
  const handleAdd = (parentId?: string) => {
    setEditingDepartment(null)
    setParentIdForNew(parentId)
    setShowForm(true)
  }
  
  // 处理编辑
  const handleEdit = (department: Department) => {
    setEditingDepartment(department)
    setParentIdForNew(undefined)
    setShowForm(true)
  }
  
  // 处理删除
  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({
      title: '确认删除',
      content: '确定要删除这个部门吗？此操作不可撤销。'
    })
    
    if (confirmed) {
      deleteDepartment(id)
    }
  }
  
  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return
    
    const confirmed = await showConfirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedIds.length} 个部门吗？此操作不可撤销。`
    })
    
    if (confirmed) {
      batchDeleteDepartments(selectedIds)
    }
  }
  
  // 处理筛选
  const handleSearch = () => {
    setPagination({ page: 1, pageSize: pagination?.pageSize || 20 })
  }
  
  // 表格列配置
  const columns = [
    {
      key: 'name',
      title: '部门名称',
      render: (value: string, record: Department) => (
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
          {record.level > 0 && (
            <span className="text-xs text-muted-foreground">L{record.level}</span>
          )}
        </div>
      )
    },
    {
      key: 'code',
      title: '部门编码',
      render: (value: string) => (
        <code className="px-2 py-1 bg-muted rounded text-sm">{value}</code>
      )
    },
    {
      key: 'manager_name',  // 🔧 修复：使用后端实际字段名
      title: '负责人',
      render: (value: string) => value || '-'
    },
    {
      key: 'employee_count',  // 🔧 修复：使用后端实际字段名
      title: '人员数量',
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{value || 0}</span>
        </div>
      )
    },
    {
      key: 'phone',
      title: '联系方式',
      render: (_: any, record: Department) => (
        <div className="space-y-1">
          {record.phone && (
            <div className="flex items-center space-x-1 text-sm">
              <Phone className="h-3 w-3" />
              <span>{record.phone}</span>
            </div>
          )}
          {record.email && (
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span>{record.email}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: '状态',
      render: (value: string) => (
        <StatusIndicator 
          status={value === 'enabled' ? 'success' : 'error'}
          text={value === 'enabled' ? '启用' : '禁用'}
        />
      )
    },
    {
      key: 'sort',
      title: '排序',
      align: 'center' as const
    },
    {
      key: 'actions',
      title: '操作',
      align: 'center' as const,
      render: (_: any, record: Department) => (
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleEdit(record)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleDelete(record.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]
  
  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              加载失败：{(error as any)?.message || '未知错误'}
              <Button onClick={() => refreshData()} className="ml-2">
                重试
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">部门管理</h1>
          <p className="text-muted-foreground mt-1">
            管理组织架构中的部门信息，支持树形结构和层级管理
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            表格视图
          </Button>
          <Button
            variant={viewMode === 'tree' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('tree')}
          >
            树形视图
          </Button>
        </div>
      </div>
      
      {/* 统计信息 */}
      <DepartmentStats />
      
      {/* 筛选和操作区域 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="搜索部门名称或编码"
                value={filters.keyword || ''}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              
              <Select
                placeholder="选择状态"
                value={filters.status || ''}
                onValueChange={(value) => setFilters({ ...filters, status: value as any })}
                options={[
                  { label: '全部状态', value: '' },
                  { label: '启用', value: 'enabled' },
                  { label: '禁用', value: 'disabled' }
                ]}
              />
              
              <div className="flex space-x-2">
                <Button onClick={handleSearch} className="flex-1">
                  <Search className="h-4 w-4 mr-2" />
                  搜索
                </Button>
                <Button 
                  variant="outline" 
                  onClick={refreshData}  // 🔧 修复：使用刷新函数而不是重置筛选
                  title="刷新数据"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 操作按钮区域 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button onClick={() => handleAdd()}>
            <Plus className="h-4 w-4 mr-2" />
            新建部门
          </Button>
          
          {viewMode === 'table' && selectedIds.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={handleBatchDelete}
              disabled={isBatchDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              批量删除 ({selectedIds.length})
            </Button>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          {viewMode === 'table' && pagination && (
            <>共 {pagination.total} 条记录</>
          )}
          {viewMode === 'tree' && departmentTree.length > 0 && (
            <>共 {countTotalDepartments(departmentTree)} 个部门</>
          )}
        </div>
      </div>
      
      {/* 数据展示区域 */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8">
              <Loading />
            </div>
          ) : viewMode === 'table' ? (
            <DataTable
              data={departments}
              columns={columns}
              loading={isLoading}
              pagination={pagination}
              onPaginationChange={(newPagination) => {
                setPagination({ 
                  page: newPagination.page, 
                  pageSize: newPagination.pageSize 
                })
              }}
            />
          ) : (
            <div className="p-6">
              <DepartmentTree
                data={departmentTree}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={handleAdd}
                loading={isLoading}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* 表单弹窗 */}
      <FormModal
        open={showForm}
        onOpenChange={setShowForm}
        title={editingDepartment ? '编辑部门' : '新建部门'}
        fields={formFields}
        onSubmit={handleSubmit}
        loading={isCreating || isUpdating}
        initialData={editingDepartment ? {
          name: editingDepartment.name,
          code: editingDepartment.code,
          description: editingDepartment.description || '',
          parentId: (editingDepartment as any).parent_id || editingDepartment.parentId || '',  // 🔧 支持 snake_case
          managerId: (editingDepartment as any).manager_id || editingDepartment.managerId || '',  // 🔧 支持 snake_case
          sort: editingDepartment.sort,
          status: editingDepartment.status,
          phone: editingDepartment.phone || '',
          email: editingDepartment.email || '',
          address: editingDepartment.address || ''
        } : {
          name: '',
          code: '',
          description: '',
          parentId: parentIdForNew || '',
          managerId: '',
          sort: 0,
          status: 'enabled',
          phone: '',
          email: '',
          address: ''
        }}
      />
    </div>
  )
}

export default DepartmentPage
