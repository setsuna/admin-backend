import { useState } from 'react'
import { Plus, Edit, Trash2, Search, RefreshCw, User as UserIcon, Users, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { DataTable } from '@/components/features/DataTable'
import { Select } from '@/components/ui/Select'
import { StatusIndicator } from '@/components/ui/StatusIndicator'
import { Loading } from '@/components/ui/Loading'
import { FormModal } from '@/components/ui/FormModal'
import { useGlobalDialog } from '@/components/ui/DialogProvider'
import { useUser } from '@/hooks/useUser'
import type { User, CreateUserRequest, UpdateUserRequest, UserSecurityLevel } from '@/types'

interface UserFormData {
  username: string
  email?: string
  password?: string
  role: 'admin' | 'user' | 'meeting_admin' | 'auditor' | 'security_admin'
  department?: string
  position?: string
  phone?: string
  status?: 'active' | 'inactive' | 'suspended'
  securityLevel?: UserSecurityLevel
  ukeyId?: string
  allowedIps?: string
  permissions?: string[]
}

const UserPage = () => {
  const { showConfirm } = useGlobalDialog()
  
  // 使用用户管理hook
  const {
    users,
    departmentOptions,
    userStats,
    pagination,
    filters,
    selectedIds,
    isLoading,
    setFilters,
    setPagination,
    createUser,
    updateUser,
    deleteUser,
    batchDeleteUsers,
    isCreating,
    isUpdating,
    isDeleting,
    isBatchDeleting,
    resetFilters,
    refreshData,
    getPermissionsByRole
  } = useUser()
  
  // 表单状态
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  
  // 搜索关键词状态
  const [searchKeyword, setSearchKeyword] = useState(filters.keyword || '')
  
  // 角色选项
  const roleOptions = [
    { label: '管理员', value: 'admin' },
    { label: '普通用户', value: 'user' },
    { label: '会议管理员', value: 'meeting_admin' },
    { label: '审计员', value: 'auditor' },
    { label: '安全管理员', value: 'security_admin' }
  ]
  
  // 状态选项（仅编辑时使用）
  const statusOptions = [
    { label: '正常', value: 'active' },
    { label: '禁用', value: 'inactive' },
    { label: '停用', value: 'suspended' }
  ]
  
  // 密级选项（仅编辑时使用）
  const securityLevelOptions = [
    { label: '密级未知', value: 'unknown' },
    { label: '内部', value: 'internal' },
    { label: '机密', value: 'confidential' },
    { label: '绝密', value: 'secret' }
  ]
  
  // 搜索处理
  const handleSearch = () => {
    setFilters({ ...filters, keyword: searchKeyword })
    setPagination({ page: 1, pageSize: pagination?.pageSize || 20 })
  }
  
  // 新增用户
  const handleCreateUser = () => {
    setEditingUser(null)
    setIsFormModalOpen(true)
  }
  
  // 编辑用户
  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsFormModalOpen(true)
  }
  
  // 删除用户
  const handleDeleteUser = async (user: User) => {
    const confirmed = await showConfirm({
      title: '删除用户',
      content: `确定要删除用户"${user.username}"吗？此操作无法撤销。`,
      confirmText: '删除',
      cancelText: '取消'
    })
    
    if (confirmed) {
      deleteUser(user.id)
    }
  }
  
  // 批量删除用户
  const handleBatchDelete = async () => {
    const confirmed = await showConfirm({
      title: '批量删除',
      content: `确定要删除选中的 ${selectedIds.length} 个用户吗？此操作无法撤销。`,
      confirmText: '删除',
      cancelText: '取消'
    })
    
    if (confirmed) {
      batchDeleteUsers(selectedIds)
    }
  }
  
  // 表单提交处理
  const handleFormSubmit = (formData: UserFormData) => {
    // 处理 allowedIps - 从字符串转为数组
    const allowedIpsArray = formData.allowedIps 
      ? formData.allowedIps.split(',').map(ip => ip.trim()).filter(ip => ip)
      : undefined
    
    if (editingUser) {
      // 编辑用户
      const { password, ...updateData } = formData
      updateUser({
        id: editingUser.id,
        ...updateData,
        allowedIps: allowedIpsArray,
        permissions: getPermissionsByRole(formData.role)
      } as UpdateUserRequest)
    } else {
      // 新增用户 - 默认设置 status 和 securityLevel
      createUser({
        ...formData,
        password: formData.password || '123456',
        status: 'active',  // 新增用户默认正常状态
        securityLevel: 'unknown',  // 新增用户默认未知密级
        allowedIps: allowedIpsArray,
        permissions: getPermissionsByRole(formData.role)
      } as CreateUserRequest)
    }
    setIsFormModalOpen(false)
  }
  
  // 表格列定义
  const columns = [
    {
      key: 'icon',
      title: '',
      width: 60,
      render: (_: any, user: User) => {
        const roleIconMap: Record<string, any> = {
          admin: Shield,
          meeting_admin: Users,
          auditor: Search,
          security_admin: Shield,
          user: UserIcon
        }
        const Icon = roleIconMap[user.role] || UserIcon
        return (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        )
      }
    },
    {
      key: 'username',
      title: '用户名',
      sortable: true,
      render: (username: string, user: User) => (
        <div>
          <div className="font-medium">{username}</div>
          <div className="text-sm text-gray-500">{user.email || '-'}</div>
        </div>
      )
    },
    {
      key: 'departmentName',
      title: '部门',
      render: (departmentName?: string) => departmentName || '-'
    },
    {
      key: 'position',
      title: '职位',
      render: (position?: string) => position || '-'
    },
    {
      key: 'role',
      title: '角色',
      render: (role: string) => {
        const roleMap: Record<string, { label: string; color: string }> = {
          admin: { label: '管理员', color: 'red' },
          meeting_admin: { label: '会议管理员', color: 'blue' },
          auditor: { label: '审计员', color: 'yellow' },
          security_admin: { label: '安全管理员', color: 'purple' },
          user: { label: '普通用户', color: 'gray' }
        }
        const roleInfo = roleMap[role] || { label: role || '未知', color: 'gray' }
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${roleInfo.color}-100 text-${roleInfo.color}-800`}>
            {roleInfo.label}
          </span>
        )
      }
    },
    {
      key: 'securityLevel',
      title: '密级',
      render: (securityLevel: UserSecurityLevel) => {
        const levelMap: Record<UserSecurityLevel, { label: string; color: string }> = {
          unknown: { label: '未知', color: 'gray' },
          internal: { label: '内部', color: 'green' },
          confidential: { label: '机密', color: 'yellow' },
          secret: { label: '绝密', color: 'red' }
        }
        const levelInfo = levelMap[securityLevel] || { label: securityLevel || '未知', color: 'gray' }
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${levelInfo.color}-100 text-${levelInfo.color}-800`}>
            <Shield className="w-3 h-3 mr-1" />
            {levelInfo.label}
          </span>
        )
      }
    },
    {
      key: 'status',
      title: '状态',
      render: (status: string) => {
        const statusMap: Record<string, { label: string; type: 'success' | 'warning' | 'error' }> = {
          active: { label: '正常', type: 'success' },
          inactive: { label: '禁用', type: 'warning' },
          suspended: { label: '停用', type: 'error' }
        }
        const statusInfo = statusMap[status] || { label: status || '未知', type: 'warning' as const }
        return <StatusIndicator status={statusInfo.type} text={statusInfo.label} />
      }
    },
    {
      key: 'lastLoginAt',
      title: '最后登录',
      render: (lastLoginAt?: string) => {
        if (!lastLoginAt) return '-'
        return new Date(lastLoginAt).toLocaleString()
      }
    },
    {
      key: 'actions',
      title: '操作',
      width: 150,
      render: (_: any, user: User) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditUser(user)}
            disabled={isUpdating}
            title="编辑用户"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteUser(user)}
            disabled={isDeleting}
            title="删除用户"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      )
    }
  ]
  
  // 表单字段定义 - 新增和编辑时的字段不同
  const formFields = [
    {
      name: 'username',
      label: '用户名',
      type: 'text' as const,
      required: true,
      placeholder: '请输入用户名'
    },
    {
      name: 'email',
      label: '邮箱',
      type: 'email' as const,
      required: false,  // 邮箱改为非必填
      placeholder: '请输入邮箱地址（可选）'
    },
    // 新增时显示密码字段
    ...(editingUser ? [] : [{
      name: 'password',
      label: '密码',
      type: 'password' as const,
      required: true,
      placeholder: '请输入密码（默认123456）'
    }]),
    {
      name: 'role',
      label: '角色',
      type: 'select' as const,
      required: true,
      options: roleOptions
    },
    {
      name: 'department',
      label: '部门',
      type: 'select' as const,
      options: departmentOptions.map(dept => ({ label: dept.name, value: dept.id }))
    },
    {
      name: 'position',
      label: '职位',
      type: 'text' as const,
      placeholder: '请输入职位'
    },
    {
      name: 'phone',
      label: '手机号',
      type: 'text' as const,
      placeholder: '请输入手机号'
    },
    {
      name: 'ukeyId',
      label: 'UKey ID',
      type: 'text' as const,
      placeholder: '如果绑定UKey，只能用此Key登录'
    },
    {
      name: 'allowedIps',
      label: '允许登录的IP',
      type: 'text' as const,
      placeholder: '多个IP用逗号分隔，例如：192.168.1.1,192.168.1.2'
    },
    // 编辑时才显示密级和状态字段
    ...(editingUser ? [
      {
        name: 'securityLevel',
        label: '密级',
        type: 'select' as const,
        required: true,
        options: securityLevelOptions
      },
      {
        name: 'status',
        label: '状态',
        type: 'select' as const,
        required: true,
        options: statusOptions
      }
    ] : [])
  ]
  
  if (isLoading && !users.length) {
    return <Loading />
  }
  
  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">总用户数</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">正常用户</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <UserIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">禁用用户</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.inactive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">停用用户</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.suspended}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* 筛选和搜索区域 */}
      <Card>
        <CardHeader>
          <CardTitle>用户管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="flex space-x-2">
                <Input
                  placeholder="搜索用户名、邮箱、部门、职位..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isLoading}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Select
                placeholder="筛选部门"
                value={filters.department}
                onValueChange={(value) => {
                  setFilters({ ...filters, department: value })
                  setPagination({ page: 1, pageSize: pagination?.pageSize || 20 })
                }}
                options={[
                  { label: '全部部门', value: '' },
                  ...departmentOptions.map(dept => ({ label: dept.name, value: dept.id }))
                ]}
              />
              
              <Select
                placeholder="筛选角色"
                value={filters.role}
                onValueChange={(value) => {
                  setFilters({ ...filters, role: value as any })
                  setPagination({ page: 1, pageSize: pagination?.pageSize || 20 })
                }}
                options={[
                  { label: '全部角色', value: '' },
                  ...roleOptions
                ]}
              />
              
              <Select
                placeholder="筛选状态"
                value={filters.status}
                onValueChange={(value) => {
                  setFilters({ ...filters, status: value as any })
                  setPagination({ page: 1, pageSize: pagination?.pageSize || 20 })
                }}
                options={[
                  { label: '全部状态', value: '' },
                  ...statusOptions
                ]}
              />
              
              <Select
                placeholder="筛选密级"
                value={filters.securityLevel}
                onValueChange={(value) => {
                  setFilters({ ...filters, securityLevel: value as any })
                  setPagination({ page: 1, pageSize: pagination?.pageSize || 20 })
                }}
                options={[
                  { label: '全部密级', value: '' },
                  ...securityLevelOptions
                ]}
              />
              
              <Button
                variant="outline"
                onClick={resetFilters}
                disabled={isLoading}
              >
                重置
              </Button>
              
              <Button
                variant="outline"
                onClick={refreshData}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 操作按钮区域 */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button onClick={handleCreateUser} disabled={isCreating}>
            <Plus className="w-4 h-4 mr-2" />
            新增用户
          </Button>
          
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleBatchDelete}
              disabled={isBatchDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              批量删除 ({selectedIds.length})
            </Button>
          )}
        </div>
        
        <div className="text-sm text-gray-500">
          共 {pagination?.total || 0} 条记录
        </div>
      </div>
      
      {/* 用户表格 */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={users}
            columns={columns}
            loading={isLoading}
            pagination={pagination}
            onPaginationChange={setPagination}
            rowKey="id"
          />
        </CardContent>
      </Card>
      
      {/* 用户表单弹窗 */}
      <FormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        title={editingUser ? '编辑用户' : '新增用户'}
        fields={formFields}
        initialData={editingUser ? {
          username: editingUser.username,
          email: editingUser.email,
          role: editingUser.role,
          department: editingUser.department,
          position: editingUser.position,
          phone: editingUser.phone,
          ukeyId: editingUser.ukeyId,
          allowedIps: editingUser.allowedIps?.join(', '),
          securityLevel: editingUser.securityLevel,
          status: editingUser.status
        } : {
          role: 'user'
          // status 和 securityLevel 不在初始值中，提交时会自动设置
        }}
        onSubmit={handleFormSubmit}
        loading={isCreating || isUpdating}
        submitText={editingUser ? '更新' : '创建'}
      />
    </div>
  )
}

export default UserPage
