import { useState } from 'react'
import { Plus, Edit, Trash2, Search, RefreshCw, Shield, Users, UserCheck, UserX, AlertTriangle, Key, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'
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

interface UserManagePageProps {
  mode: 'admin' | 'security' | 'security_level'
}

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

const UserManagePage: React.FC<UserManagePageProps> = ({ mode }) => {
  const { showConfirm } = useGlobalDialog()
  
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
    setSelectedIds,
    createUser,
    updateUser,
    deleteUser,
    batchDeleteUsers,
    resetPassword,
    updateUserStatus,
    updateUserSecurityLevel,
    batchUpdateSecurityLevel,
    isCreating,
    isUpdating,
    isDeleting,
    isBatchDeleting,
    isResettingPassword,
    isUpdatingStatus,
    isUpdatingSecurityLevel,
    isBatchUpdatingSecurityLevel,
    resetFilters,
    refreshData,
    getPermissionsByRole
  } = useUser()
  
  // 表单状态
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showSecurityLevelModal, setShowSecurityLevelModal] = useState(false)
  const [showBatchUpdateModal, setShowBatchUpdateModal] = useState(false)
  
  // 搜索关键词状态
  const [searchKeyword, setSearchKeyword] = useState(filters.keyword || '')
  
  // 配置选项
  const roleOptions = [
    { label: '管理员', value: 'admin' },
    { label: '普通用户', value: 'user' },
    { label: '会议管理员', value: 'meeting_admin' },
    { label: '审计员', value: 'auditor' },
    { label: '安全管理员', value: 'security_admin' }
  ]
  
  const statusOptions = [
    { label: '正常', value: 'active' },
    { label: '禁用', value: 'inactive' },
    { label: '停用', value: 'suspended' }
  ]
  
  const securityLevelOptions = [
    { label: '密级未知', value: 'unknown' },
    { label: '内部', value: 'internal' },
    { label: '机密', value: 'confidential' },
    { label: '绝密', value: 'secret' }
  ]
  
  // 根据模式获取页面配置
  const getPageConfig = () => {
    switch (mode) {
      case 'admin':
        return {
          title: '用户管理',
          showCreateButton: true,
          showEditButton: true,
          showDeleteButton: true,
          showSecurityOperations: false,
          showSecurityLevelOperations: false
        }
      case 'security':
        return {
          title: '用户管理（安全管理员）',
          showCreateButton: false,
          showEditButton: false,
          showDeleteButton: false,
          showSecurityOperations: true,
          showSecurityLevelOperations: false
        }
      case 'security_level':
        return {
          title: '人员密级管理',
          showCreateButton: false,
          showEditButton: false,
          showDeleteButton: false,
          showSecurityOperations: false,
          showSecurityLevelOperations: true
        }
    }
  }
  
  const pageConfig = getPageConfig()
  
  // 搜索处理
  const handleSearch = () => {
    setFilters({ ...filters, keyword: searchKeyword })
    setPagination({ page: 1, pageSize: pagination?.pageSize || 20 })
  }
  
  // ========== Admin 模式操作 ==========
  const handleCreateUser = () => {
    setEditingUser(null)
    setIsFormModalOpen(true)
  }
  
  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsFormModalOpen(true)
  }
  
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
  
  const handleFormSubmit = (formData: UserFormData) => {
    const allowedIpsArray = formData.allowedIps 
      ? formData.allowedIps.split(',').map(ip => ip.trim()).filter(ip => ip)
      : undefined
    
    if (editingUser) {
      const { password, ...updateData } = formData
      updateUser({
        id: editingUser.id,
        ...updateData,
        allowedIps: allowedIpsArray,
        permissions: getPermissionsByRole(formData.role)
      } as UpdateUserRequest)
    } else {
      createUser({
        ...formData,
        password: formData.password || '123456',
        status: 'active',
        securityLevel: 'unknown',
        allowedIps: allowedIpsArray,
        permissions: getPermissionsByRole(formData.role)
      } as CreateUserRequest)
    }
    setIsFormModalOpen(false)
  }
  
  // ========== Security 模式操作 ==========
  const handleResetPassword = async (user: User) => {
    const confirmed = await showConfirm({
      title: '重置密码',
      content: `确定要重置用户"${user.username}"的密码吗？密码将重置为默认密码。`,
      confirmText: '重置',
      cancelText: '取消'
    })
    
    if (confirmed) {
      resetPassword(user.id)
    }
  }
  
  const handleUpdateStatus = async (user: User, newStatus: 'active' | 'inactive' | 'suspended') => {
    const statusMap = { active: '启用', inactive: '禁用', suspended: '停用' }
    const confirmed = await showConfirm({
      title: '更新状态',
      content: `确定要${statusMap[newStatus]}用户"${user.username}"吗？`,
      confirmText: '确定',
      cancelText: '取消'
    })
    
    if (confirmed) {
      updateUserStatus(user.id, newStatus)
    }
  }
  
  const handleBatchResetPassword = async () => {
    const confirmed = await showConfirm({
      title: '批量重置密码',
      content: `确定要重置选中的 ${selectedIds.length} 个用户的密码吗？密码将重置为默认密码。`,
      confirmText: '重置',
      cancelText: '取消'
    })
    
    if (confirmed) {
      for (const userId of selectedIds) {
        resetPassword(userId)
      }
      setSelectedIds([])
    }
  }
  
  const handleBatchUpdateStatus = async (status: 'active' | 'inactive' | 'suspended') => {
    const statusMap = { active: '启用', inactive: '禁用', suspended: '停用' }
    const confirmed = await showConfirm({
      title: `批量${statusMap[status]}`,
      content: `确定要${statusMap[status]}选中的 ${selectedIds.length} 个用户吗？`,
      confirmText: '确定',
      cancelText: '取消'
    })
    
    if (confirmed) {
      for (const userId of selectedIds) {
        updateUserStatus(userId, status)
      }
      setSelectedIds([])
    }
  }
  
  // ========== Security Level 模式操作 ==========
  const handleUpdateSecurityLevel = (user: User) => {
    setEditingUser(user)
    setShowSecurityLevelModal(true)
  }
  
  const handleBatchUpdateSecurityLevel = () => {
    if (selectedIds.length === 0) return
    setShowBatchUpdateModal(true)
  }
  
  const handleSecurityLevelSubmit = async (formData: { securityLevel: UserSecurityLevel; reason?: string }) => {
    if (!editingUser) return
    
    const levelMap = { unknown: '未知', internal: '内部', confidential: '机密', secret: '绝密' }
    const confirmed = await showConfirm({
      title: '调整用户密级',
      content: `确定要将用户"${editingUser.username}"的密级调整为"${levelMap[formData.securityLevel]}"吗？`,
      confirmText: '确定',
      cancelText: '取消'
    })
    
    if (confirmed) {
      updateUserSecurityLevel(editingUser.id, formData.securityLevel)
      setShowSecurityLevelModal(false)
      setEditingUser(null)
    }
  }
  
  const handleBatchUpdateSubmit = async (formData: { securityLevel: UserSecurityLevel; reason?: string }) => {
    const levelMap = { unknown: '未知', internal: '内部', confidential: '机密', secret: '绝密' }
    const confirmed = await showConfirm({
      title: '批量调整密级',
      content: `确定要将选中的 ${selectedIds.length} 个用户的密级调整为"${levelMap[formData.securityLevel]}"吗？`,
      confirmText: '确定',
      cancelText: '取消'
    })
    
    if (confirmed) {
      batchUpdateSecurityLevel(selectedIds, formData.securityLevel)
      setShowBatchUpdateModal(false)
    }
  }
  
  // 表格列定义
  const getColumns = () => {
    const baseColumns = [
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
            user: UserCheck
          }
          const Icon = roleIconMap[user.role] || UserCheck
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
        title: mode === 'security_level' ? '用户信息' : '用户名',
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
        title: mode === 'security_level' ? '当前密级' : '密级',
        render: (securityLevel: UserSecurityLevel) => {
          const levelMap: Record<UserSecurityLevel, { label: string; color: string; icon: any }> = {
            unknown: { label: '未知', color: 'gray', icon: ShieldX },
            internal: { label: '内部', color: 'green', icon: Shield },
            confidential: { label: '机密', color: 'yellow', icon: ShieldAlert },
            secret: { label: '绝密', color: 'red', icon: ShieldCheck }
          }
          const levelInfo = levelMap[securityLevel] || levelMap.unknown
          const IconComponent = levelInfo.icon
          return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${levelInfo.color}-100 text-${levelInfo.color}-800`}>
              <IconComponent className="w-3 h-3 mr-1" />
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
        key: mode === 'security_level' ? 'updatedAt' : 'lastLoginAt',
        title: mode === 'security_level' ? '最后更新' : '最后登录',
        render: (timestamp?: string) => {
          if (!timestamp) return '-'
          return new Date(timestamp).toLocaleString()
        }
      }
    ]
    
    // 根据模式添加操作列
    if (mode === 'admin') {
      baseColumns.push({
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
      })
    } else if (mode === 'security') {
      baseColumns.push({
        key: 'actions',
        title: '安全操作',
        width: 180,
        render: (_: any, user: User) => (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleResetPassword(user)}
              disabled={isResettingPassword}
              title="重置密码"
            >
              <Key className="w-4 h-4" />
            </Button>
            {user.status === 'active' ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUpdateStatus(user, 'inactive')}
                disabled={isUpdatingStatus}
                title="禁用用户"
              >
                <UserX className="w-4 h-4 text-orange-500" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUpdateStatus(user, 'active')}
                disabled={isUpdatingStatus}
                title="启用用户"
              >
                <UserCheck className="w-4 h-4 text-green-500" />
              </Button>
            )}
            {user.status !== 'suspended' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUpdateStatus(user, 'suspended')}
                disabled={isUpdatingStatus}
                title="停用用户"
              >
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </div>
        )
      })
    } else if (mode === 'security_level') {
      baseColumns.push({
        key: 'actions',
        title: '操作',
        width: 120,
        render: (_: any, user: User) => (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUpdateSecurityLevel(user)}
              disabled={isUpdatingSecurityLevel}
              title="调整密级"
            >
              <Key className="w-4 h-4" />
            </Button>
          </div>
        )
      })
    }
    
    return baseColumns
  }
  
  // 表单字段定义
  const formFields = [
    {
      name: 'username',
      label: '用户名',
      type: 'text',
      required: true,
      placeholder: '请输入用户名'
    },
    {
      name: 'email',
      label: '邮箱',
      type: 'text',
      required: false,
      placeholder: '请输入邮箱地址（可选）'
    },
    ...(editingUser ? [] : [{
      name: 'password',
      label: '密码',
      type: 'text',
      required: true,
      placeholder: '请输入密码（默认123456）'
    }]),
    {
      name: 'role',
      label: '角色',
      type: 'select',
      required: true,
      options: roleOptions
    },
    {
      name: 'department',
      label: '部门',
      type: 'select',
      options: departmentOptions.map(dept => ({ label: dept.name, value: dept.id }))
    },
    {
      name: 'position',
      label: '职位',
      type: 'text',
      placeholder: '请输入职位'
    },
    {
      name: 'phone',
      label: '手机号',
      type: 'text',
      placeholder: '请输入手机号'
    },
    {
      name: 'ukeyId',
      label: 'UKey ID',
      type: 'text',
      placeholder: '如果绑定UKey，只能用此Key登录'
    },
    {
      name: 'allowedIps',
      label: '允许登录的IP',
      type: 'text',
      placeholder: '多个IP用逗号分隔，例如：192.168.1.1,192.168.1.2'
    },
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
  
  // 密级调整表单字段
  const securityLevelFormFields = [
    {
      name: 'securityLevel',
      label: mode === 'security_level' && !editingUser ? '统一密级' : '新密级',
      type: 'select',
      required: true,
      options: securityLevelOptions
    },
    {
      name: 'reason',
      label: '调整原因',
      type: 'textarea',
      placeholder: '请输入调整原因（可选）'
    }
  ]
  
  // 统计卡片配置
  const getStatsCards = () => {
    if (!userStats) return null
    
    if (mode === 'security_level') {
      return (
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
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">内部级别</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.bySecurityLevel?.internal || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ShieldAlert className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">机密级别</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.bySecurityLevel?.confidential || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <ShieldCheck className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">绝密级别</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.bySecurityLevel?.secret || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
    
    // admin 和 security 模式的统计卡片
    return (
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
                <UserCheck className="w-6 h-6 text-green-600" />
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
                <UserX className="w-6 h-6 text-yellow-600" />
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
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">停用用户</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.suspended}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (isLoading && !users.length) {
    return <Loading />
  }
  
  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      {getStatsCards()}
      
      {/* 筛选和搜索区域 */}
      <Card>
        <CardHeader>
          <CardTitle>{pageConfig.title}</CardTitle>
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
          {/* Admin 模式操作 */}
          {pageConfig.showCreateButton && (
            <Button onClick={handleCreateUser} disabled={isCreating}>
              <Plus className="w-4 h-4 mr-2" />
              新增用户
            </Button>
          )}
          
          {selectedIds.length > 0 && (
            <>
              {/* Admin 模式批量操作 */}
              {pageConfig.showDeleteButton && (
                <Button
                  variant="destructive"
                  onClick={handleBatchDelete}
                  disabled={isBatchDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  批量删除 ({selectedIds.length})
                </Button>
              )}
              
              {/* Security 模式批量操作 */}
              {pageConfig.showSecurityOperations && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleBatchResetPassword}
                    disabled={isResettingPassword}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    批量重置密码 ({selectedIds.length})
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleBatchUpdateStatus('active')}
                    disabled={isUpdatingStatus}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    批量启用 ({selectedIds.length})
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleBatchUpdateStatus('inactive')}
                    disabled={isUpdatingStatus}
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    批量禁用 ({selectedIds.length})
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={() => handleBatchUpdateStatus('suspended')}
                    disabled={isUpdatingStatus}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    批量停用 ({selectedIds.length})
                  </Button>
                </>
              )}
              
              {/* Security Level 模式批量操作 */}
              {pageConfig.showSecurityLevelOperations && (
                <Button
                  variant="outline"
                  onClick={handleBatchUpdateSecurityLevel}
                  disabled={isBatchUpdatingSecurityLevel}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  批量调整密级 ({selectedIds.length})
                </Button>
              )}
            </>
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
            columns={getColumns()}
            loading={isLoading}
            pagination={pagination}
            onPaginationChange={setPagination}
            rowKey="id"
            selectable={mode !== 'admin'}
            selectedRowKeys={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </CardContent>
      </Card>
      
      {/* Admin 模式表单弹窗 */}
      {pageConfig.showCreateButton && (
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
          }}
          onSubmit={handleFormSubmit}
          loading={isCreating || isUpdating}
          submitText={editingUser ? '更新' : '创建'}
        />
      )}
      
      {/* Security Level 模式表单弹窗 */}
      {pageConfig.showSecurityLevelOperations && (
        <>
          <FormModal
            open={showSecurityLevelModal}
            onOpenChange={setShowSecurityLevelModal}
            title={`调整用户密级 - ${editingUser?.username}`}
            fields={securityLevelFormFields}
            initialData={{ 
              securityLevel: editingUser?.securityLevel,
              reason: ''
            }}
            onSubmit={handleSecurityLevelSubmit}
            loading={isUpdatingSecurityLevel}
            submitText="调整"
            cancelText="取消"
          />
          
          <FormModal
            open={showBatchUpdateModal}
            onOpenChange={setShowBatchUpdateModal}
            title={`批量调整密级 (${selectedIds.length} 个用户)`}
            fields={securityLevelFormFields}
            initialData={{ 
              securityLevel: 'unknown',
              reason: ''
            }}
            onSubmit={handleBatchUpdateSubmit}
            loading={isBatchUpdatingSecurityLevel}
            submitText="批量调整"
            cancelText="取消"
          />
        </>
      )}
    </div>
  )
}

export default UserManagePage
