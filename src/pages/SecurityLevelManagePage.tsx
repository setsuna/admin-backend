import { useState } from 'react'
import { Search, RefreshCw, Shield, Users, ShieldCheck, ShieldAlert, ShieldX, Key, UserCheck } from 'lucide-react'
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
import type { User, UserSecurityLevel, FormField } from '@/types'

const SecurityLevelManagePage = () => {
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
    error,
    setFilters,
    setPagination,
    setSelectedIds,
    updateUserSecurityLevel,
    batchUpdateSecurityLevel,
    isUpdatingSecurityLevel,
    isBatchUpdatingSecurityLevel,
    resetFilters,
    refreshData
  } = useUser()
  
  // 表单状态
  const [showSecurityLevelModal, setShowSecurityLevelModal] = useState(false)
  const [showBatchUpdateModal, setShowBatchUpdateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  
  // 搜索关键词状态
  const [searchKeyword, setSearchKeyword] = useState(filters.keyword || '')
  
  // 密级选项
  const securityLevelOptions = [
    { label: '密级未知', value: 'unknown' },
    { label: '内部', value: 'internal' },
    { label: '机密', value: 'confidential' },
    { label: '绝密', value: 'secret' }
  ]
  
  // 角色选项
  const roleOptions = [
    { label: '管理员', value: 'admin' },
    { label: '普通用户', value: 'user' },
    { label: '会议管理员', value: 'meeting_admin' },
    { label: '审计员', value: 'auditor' },
    { label: '安全管理员', value: 'security_admin' }
  ]
  
  // 状态选项
  const statusOptions = [
    { label: '正常', value: 'active' },
    { label: '禁用', value: 'inactive' },
    { label: '停用', value: 'suspended' }
  ]
  
  // 搜索处理
  const handleSearch = () => {
    setFilters({ ...filters, keyword: searchKeyword })
    setPagination({ page: 1, pageSize: pagination?.pageSize || 20 })
  }
  
  // 单个用户密级调整
  const handleUpdateSecurityLevel = (user: User) => {
    setEditingUser(user)
    setShowSecurityLevelModal(true)
  }
  
  // 批量密级调整
  const handleBatchUpdateSecurityLevel = () => {
    if (selectedIds.length === 0) {
      return
    }
    setShowBatchUpdateModal(true)
  }
  
  // 密级调整表单提交
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
  
  // 批量密级调整提交
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
  
  // 单个用户密级调整表单字段
  const securityLevelFormFields: FormField[] = [
    {
      name: 'securityLevel',
      label: '新密级',
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
  
  // 批量密级调整表单字段
  const batchUpdateFormFields: FormField[] = [
    {
      name: 'securityLevel',
      label: '统一密级',
      type: 'select',
      required: true,
      options: securityLevelOptions
    },
    {
      name: 'reason',
      label: '调整原因',
      type: 'textarea',
      placeholder: '请输入批量调整原因（可选）'
    }
  ]
  
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
      title: '用户信息',
      sortable: true,
      render: (username: string, user: User) => (
        <div>
          <div className="font-medium">{username}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
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
        const roleInfo = roleMap[role] || { label: role, color: 'gray' }
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${roleInfo.color}-100 text-${roleInfo.color}-800`}>
            {roleInfo.label}
          </span>
        )
      }
    },
    {
      key: 'securityLevel',
      title: '当前密级',
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
        const statusInfo = statusMap[status] || { label: status, type: 'warning' }
        return <StatusIndicator status={statusInfo.type} text={statusInfo.label} />
      }
    },
    {
      key: 'updatedAt',
      title: '最后更新',
      render: (updatedAt?: string) => {
        if (!updatedAt) return '-'
        return new Date(updatedAt).toLocaleString()
      }
    },
    {
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
    }
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
      )}
      
      {/* 筛选和搜索区域 */}
      <Card>
        <CardHeader>
          <CardTitle>人员密级管理</CardTitle>
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
      
      {/* 批量操作按钮区域 */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {selectedIds.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={handleBatchUpdateSecurityLevel}
                disabled={isBatchUpdatingSecurityLevel}
              >
                <Shield className="w-4 h-4 mr-2" />
                批量调整密级 ({selectedIds.length})
              </Button>
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
            columns={columns}
            loading={isLoading}
            pagination={pagination}
            onPaginationChange={setPagination}
            rowKey="id"
            selectable
            selectedRowKeys={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </CardContent>
      </Card>
      
      {/* 单个用户密级调整弹窗 */}
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
      
      {/* 批量密级调整弹窗 */}
      <FormModal
        open={showBatchUpdateModal}
        onOpenChange={setShowBatchUpdateModal}
        title={`批量调整密级 (${selectedIds.length} 个用户)`}
        fields={batchUpdateFormFields}
        initialData={{ 
          securityLevel: 'unknown',
          reason: ''
        }}
        onSubmit={handleBatchUpdateSubmit}
        loading={isBatchUpdatingSecurityLevel}
        submitText="批量调整"
        cancelText="取消"
      />
    </div>
  )
}

export default SecurityLevelManagePage
