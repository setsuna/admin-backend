import { useState } from 'react'
import { Search, RefreshCw, Users, Shield, Key, UserCheck, UserX, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { DataTable } from '@/components/features/DataTable'
import { Select } from '@/components/ui/Select'
import { StatusIndicator } from '@/components/ui/StatusIndicator'
import { Loading } from '@/components/ui/Loading'
import { useGlobalDialog } from '@/components/ui/DialogProvider'
import { useUser } from '@/hooks/useUser'
import type { User, UserSecurityLevel } from '@/types'

const SecurityUserManagePage = () => {
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
    setSelectedIds,
    resetPassword,
    updateUserStatus,
    isResettingPassword,
    isUpdatingStatus,
    resetFilters,
    refreshData
  } = useUser()
  
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
  
  // 状态选项
  const statusOptions = [
    { label: '正常', value: 'active' },
    { label: '禁用', value: 'inactive' },
    { label: '停用', value: 'suspended' }
  ]
  
  // 密级选项
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
  
  // 重置密码
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
  
  // 更新用户状态
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
  
  // 批量重置密码
  const handleBatchResetPassword = async () => {
    const confirmed = await showConfirm({
      title: '批量重置密码',
      content: `确定要重置选中的 ${selectedIds.length} 个用户的密码吗？密码将重置为默认密码。`,
      confirmText: '重置',
      cancelText: '取消'
    })
    
    if (confirmed) {
      // 逐个重置密码
      for (const userId of selectedIds) {
        resetPassword(userId)
      }
      setSelectedIds([])
    }
  }
  
  // 批量更新状态
  const handleBatchUpdateStatus = async (status: 'active' | 'inactive' | 'suspended') => {
    const statusMap = { active: '启用', inactive: '禁用', suspended: '停用' }
    const confirmed = await showConfirm({
      title: `批量${statusMap[status]}`,
      content: `确定要${statusMap[status]}选中的 ${selectedIds.length} 个用户吗？`,
      confirmText: '确定',
      cancelText: '取消'
    })
    
    if (confirmed) {
      // 逐个更新状态
      for (const userId of selectedIds) {
        updateUserStatus(userId, status)
      }
      setSelectedIds([])
    }
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
      title: '用户名',
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
      )}
      
      {/* 筛选和搜索区域 */}
      <Card>
        <CardHeader>
          <CardTitle>用户管理（安全管理员）</CardTitle>
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
      
      {/* 安全操作按钮区域 */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {selectedIds.length > 0 && (
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
    </div>
  )
}

export default SecurityUserManagePage
