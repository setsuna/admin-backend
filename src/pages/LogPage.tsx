import React, { useState } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  X,
  Calendar,
  User,
  Activity,
  AlertCircle,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { DataTable } from '@/components/features/DataTable'
import type { 
  ApplicationLog,
  ThreeAdminLog,
  ApplicationLogFilters,
  ThreeAdminLogFilters,
  ActionCategory,
  OperationModule,
  LogOperationResult,
  TableColumn
} from '@/types'

// 模式配置
type LogMode = 'application' | 'three-admin'

interface LogPageConfig {
  title: string
  description?: string
  icon?: React.ReactNode
  showOperatorFilter: boolean
  showRoleFilter: boolean
  renderOperatorCell: (operator: string, record: ApplicationLog | ThreeAdminLog) => React.ReactNode
}

const logModeConfig: Record<LogMode, LogPageConfig> = {
  'application': {
    title: '应用日志',
    description: '查看系统所有操作记录',
    showOperatorFilter: true,
    showRoleFilter: false,
    renderOperatorCell: (operator: string) => (
      <span className="font-medium">{operator}</span>
    )
  },
  'three-admin': {
    title: '操作日志',
    icon: <Shield className="h-6 w-6 text-orange-600" />,
    showOperatorFilter: false,
    showRoleFilter: true,
    renderOperatorCell: (operator: string, record: ThreeAdminLog) => (
      <div>
        <div className="font-medium">{operator}</div>
        <div className={`text-xs ${threeAdminRoleConfig[record.operatorRole]?.color}`}>
          {threeAdminRoleConfig[record.operatorRole]?.icon} {threeAdminRoleConfig[record.operatorRole]?.label}
        </div>
      </div>
    )
  }
}

// 三员角色配置
const threeAdminRoleConfig = {
  SYSTEM_ADMIN: { 
    label: '系统管理员', 
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: '⚙️'
  },
  SECURITY_ADMIN: { 
    label: '安全管理员', 
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: '🛡️'
  },
  AUDITOR: { 
    label: '审计员', 
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: '🔍'
  }
}

// 结果配置
const resultConfig = {
  success: { 
    label: '成功', 
    color: 'text-green-600', 
    bgColor: 'bg-green-100' 
  },
  failure: { 
    label: '失败', 
    color: 'text-red-600', 
    bgColor: 'bg-red-100' 
  }
}

// 行为类别配置
const actionConfig = {
  CREATE: { label: '创建', color: 'text-blue-600' },
  UPDATE: { label: '修改', color: 'text-orange-600' },
  DELETE: { label: '删除', color: 'text-red-600' },
  VIEW: { label: '查看', color: 'text-gray-600' },
  LOGIN: { label: '登录', color: 'text-green-600' },
  LOGOUT: { label: '登出', color: 'text-gray-600' },
  EXPORT: { label: '导出', color: 'text-purple-600' },
  IMPORT: { label: '导入', color: 'text-indigo-600' },
  CONFIG: { label: '配置', color: 'text-yellow-600' },
  SYNC: { label: '同步', color: 'text-cyan-600' }
}

// 模块配置
const moduleConfig = {
  USER: { label: '用户管理' },
  DEPARTMENT: { label: '部门管理' },
  MEETING: { label: '会议管理' },
  DICT: { label: '数据字典' },
  PERMISSION: { label: '权限管理' },
  SECURITY: { label: '安全管理' },
  SYSTEM: { label: '系统管理' },
  AUTH: { label: '认证' },
  CONFIG: { label: '配置管理' },
  SYNC: { label: '同步管理' }
}

// 应用日志模拟数据
const mockApplicationLogs: ApplicationLog[] = [
  {
    id: '1',
    timestamp: '2024-11-01 10:30:25',
    operator: '张三',
    operatorId: 'user_001',
    operatorRole: 'Security Admin',
    ipAddress: '192.168.1.100',
    module: 'USER' as OperationModule,
    actionCategory: 'UPDATE' as ActionCategory,
    actionDescription: '修改用户状态：将用户"李四"的状态从"启用"改为"禁用"',
    operationResult: 'success' as LogOperationResult,
    beforeData: { status: 'enabled', username: '李四' },
    afterData: { status: 'disabled', username: '李四' },
    changeDetails: '将用户"李四"的状态从"启用"改为"禁用"',
    createdAt: '2024-11-01 10:30:25',
    updatedAt: '2024-11-01 10:30:25'
  },
  {
    id: '2',
    timestamp: '2024-11-01 10:25:18',
    operator: '王五',
    operatorId: 'user_002',
    operatorRole: 'Auditor',
    ipAddress: '192.168.1.101',
    module: 'AUTH' as OperationModule,
    actionCategory: 'LOGIN' as ActionCategory,
    actionDescription: '用户登录系统',
    operationResult: 'success' as LogOperationResult,
    createdAt: '2024-11-01 10:25:18',
    updatedAt: '2024-11-01 10:25:18'
  },
  {
    id: '3',
    timestamp: '2024-11-01 10:20:45',
    operator: '赵六',
    operatorId: 'user_003',
    operatorRole: 'System Admin',
    ipAddress: '192.168.1.102',
    module: 'MEETING' as OperationModule,
    actionCategory: 'CREATE' as ActionCategory,
    actionDescription: '创建会议：标题为"项目评审会"，状态为草稿',
    operationResult: 'success' as LogOperationResult,
    afterData: { title: '项目评审会', status: 'draft' },
    createdAt: '2024-11-01 10:20:45',
    updatedAt: '2024-11-01 10:20:45'
  },
  {
    id: '4',
    timestamp: '2024-11-01 10:15:30',
    operator: '孙七',
    operatorId: 'user_004',
    operatorRole: 'User',
    ipAddress: '192.168.1.103',
    module: 'AUTH' as OperationModule,
    actionCategory: 'LOGIN' as ActionCategory,
    actionDescription: '用户登录失败：密码错误',
    operationResult: 'failure' as LogOperationResult,
    createdAt: '2024-11-01 10:15:30',
    updatedAt: '2024-11-01 10:15:30'
  },
  {
    id: '5',
    timestamp: '2024-11-01 10:10:12',
    operator: '张三',
    operatorId: 'user_001',
    operatorRole: 'Security Admin',
    ipAddress: '192.168.1.100',
    module: 'PERMISSION' as OperationModule,
    actionCategory: 'UPDATE' as ActionCategory,
    actionDescription: '修改角色权限：为角色"管理员"添加了"删除用户"权限',
    operationResult: 'success' as LogOperationResult,
    beforeData: { permissions: ['user:read', 'user:write'] },
    afterData: { permissions: ['user:read', 'user:write', 'user:delete'] },
    changeDetails: '为角色"管理员"添加了"删除用户"权限',
    createdAt: '2024-11-01 10:10:12',
    updatedAt: '2024-11-01 10:10:12'
  }
]

// 三员日志模拟数据
const mockThreeAdminLogs: ThreeAdminLog[] = [
  {
    id: '1',
    timestamp: '2024-11-01 10:30:25',
    operator: '安全管理员',
    operatorId: 'security_admin',
    operatorRole: 'SECURITY_ADMIN',
    ipAddress: '192.168.1.100',
    module: 'USER' as OperationModule,
    actionCategory: 'UPDATE' as ActionCategory,
    actionDescription: '修改用户状态：将用户"李四"的状态从"启用"改为"禁用"',
    operationResult: 'success' as LogOperationResult,
    beforeData: { status: 'enabled', username: '李四' },
    afterData: { status: 'disabled', username: '李四' },
    changeDetails: '将用户"李四"的状态从"启用"改为"禁用"',
    createdAt: '2024-11-01 10:30:25',
    updatedAt: '2024-11-01 10:30:25'
  },
  {
    id: '2',
    timestamp: '2024-11-01 10:20:45',
    operator: '系统管理员',
    operatorId: 'system_admin',
    operatorRole: 'SYSTEM_ADMIN',
    ipAddress: '192.168.1.102',
    module: 'SYSTEM' as OperationModule,
    actionCategory: 'CONFIG' as ActionCategory,
    actionDescription: '修改系统配置：将最大登录尝试次数从3次修改为5次',
    operationResult: 'success' as LogOperationResult,
    beforeData: { maxLoginAttempts: 3 },
    afterData: { maxLoginAttempts: 5 },
    changeDetails: '将最大登录尝试次数从3次修改为5次',
    createdAt: '2024-11-01 10:20:45',
    updatedAt: '2024-11-01 10:20:45'
  },
  {
    id: '3',
    timestamp: '2024-11-01 10:15:30',
    operator: '安全管理员',
    operatorId: 'security_admin',
    operatorRole: 'SECURITY_ADMIN',
    ipAddress: '192.168.1.100',
    module: 'PERMISSION' as OperationModule,
    actionCategory: 'UPDATE' as ActionCategory,
    actionDescription: '修改角色权限：为角色"管理员"添加了"删除用户"权限',
    operationResult: 'success' as LogOperationResult,
    beforeData: { permissions: ['user:read', 'user:write'] },
    afterData: { permissions: ['user:read', 'user:write', 'user:delete'] },
    changeDetails: '为角色"管理员"添加了"删除用户"权限',
    createdAt: '2024-11-01 10:15:30',
    updatedAt: '2024-11-01 10:15:30'
  },
  {
    id: '4',
    timestamp: '2024-11-01 10:05:00',
    operator: '系统管理员',
    operatorId: 'system_admin',
    operatorRole: 'SYSTEM_ADMIN',
    ipAddress: '192.168.1.102',
    module: 'SECURITY' as OperationModule,
    actionCategory: 'UPDATE' as ActionCategory,
    actionDescription: '修改安全策略：将密码过期天数从90天修改为60天',
    operationResult: 'success' as LogOperationResult,
    beforeData: { passwordExpireDays: 90 },
    afterData: { passwordExpireDays: 60 },
    changeDetails: '将密码过期天数从90天修改为60天',
    createdAt: '2024-11-01 10:05:00',
    updatedAt: '2024-11-01 10:05:00'
  },
  {
    id: '5',
    timestamp: '2024-11-01 09:50:00',
    operator: '安全管理员',
    operatorId: 'security_admin',
    operatorRole: 'SECURITY_ADMIN',
    ipAddress: '192.168.1.100',
    module: 'USER' as OperationModule,
    actionCategory: 'CREATE' as ActionCategory,
    actionDescription: '创建用户：新建用户"王五"，角色为"普通用户"',
    operationResult: 'success' as LogOperationResult,
    afterData: { username: '王五', role: 'user' },
    createdAt: '2024-11-01 09:50:00',
    updatedAt: '2024-11-01 09:50:00'
  },
  {
    id: '6',
    timestamp: '2024-11-01 09:30:00',
    operator: '系统管理员',
    operatorId: 'system_admin',
    operatorRole: 'SYSTEM_ADMIN',
    ipAddress: '192.168.1.102',
    module: 'SYSTEM' as OperationModule,
    actionCategory: 'CONFIG' as ActionCategory,
    actionDescription: '修改数据库备份策略：将备份频率从每天一次修改为每12小时一次',
    operationResult: 'success' as LogOperationResult,
    beforeData: { backupFrequency: '24h' },
    afterData: { backupFrequency: '12h' },
    changeDetails: '将备份频率从每天一次修改为每12小时一次',
    createdAt: '2024-11-01 09:30:00',
    updatedAt: '2024-11-01 09:30:00'
  }
]

interface LogPageProps {
  mode: LogMode
}

const LogPage: React.FC<LogPageProps> = ({ mode }) => {
  // 根据模式获取配置
  const config = logModeConfig[mode]
  
  // 根据模式获取数据
  const mockData = mode === 'application' ? mockApplicationLogs : mockThreeAdminLogs
  
  // 状态
  const [logs] = useState<(ApplicationLog | ThreeAdminLog)[]>(mockData)
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const [isLoading] = useState(false)
  
  // 筛选条件
  const [filters, setFilters] = useState<ApplicationLogFilters | ThreeAdminLogFilters>({})
  const [searchKeyword, setSearchKeyword] = useState('')
  
  // 分页状态
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: mockData.length
  })

  // 处理分页变化
  const handlePaginationChange = (newPagination: { page: number; pageSize: number }) => {
    setPagination(prev => ({
      ...prev,
      ...newPagination
    }))
  }

  // 处理导出
  const handleExport = () => {
    console.log('导出日志')
    // TODO: 实现导出功能
  }

  // 处理刷新
  const handleRefresh = () => {
    console.log('刷新日志')
    // TODO: 实现刷新功能
  }

  // 重置筛选
  const handleResetFilters = () => {
    setFilters({})
    setSearchKeyword('')
  }
  
  // 表格列定义
  const columns: TableColumn<ApplicationLog | ThreeAdminLog>[] = [
    {
      key: 'module',
      title: '模块',
      width: 120,
      render: (module: OperationModule) => (
        <span className="font-medium">
          {moduleConfig[module]?.label || module}
        </span>
      )
    },
    {
      key: 'actionDescription',
      title: '操作描述',
      render: (description: string) => (
        <div className="max-w-md">
          {description}
        </div>
      )
    },
    {
      key: 'operationResult',
      title: '结果',
      width: 100,
      render: (result: LogOperationResult) => (
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${resultConfig[result]?.bgColor} ${resultConfig[result]?.color}`}>
          {resultConfig[result]?.label || result}
        </div>
      )
    },
    {
      key: 'actionCategory',
      title: '行为',
      width: 100,
      render: (action: ActionCategory) => (
        <span className={`font-medium ${actionConfig[action]?.color}`}>
          {actionConfig[action]?.label || action}
        </span>
      )
    },
    {
      key: 'timestamp',
      title: '时间',
      width: 180,
      render: (timestamp: string) => (
        <span className="whitespace-nowrap">
          {timestamp}
        </span>
      )
    },
    {
      key: 'operator',
      title: '操作人',
      width: mode === 'application' ? 120 : 140,
      render: (operator: string, record: ApplicationLog | ThreeAdminLog) => 
        config.renderOperatorCell(operator, record)
    },
    {
      key: 'ipAddress',
      title: 'IP地址',
      width: 140,
      render: (ip: string) => (
        <span className="text-muted-foreground font-mono text-sm">
          {ip}
        </span>
      )
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            {config.icon}
            <h1 className="text-2xl font-bold">{config.title}</h1>
          </div>
          {config.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {config.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
        </div>
      </div>

      {/* 筛选区域 */}
      <Card>
        <CardContent className="pt-6">
          {/* 基础搜索栏 */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索操作描述..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant={isFilterExpanded ? "default" : "outline"}
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            >
              <Filter className="h-4 w-4 mr-2" />
              高级筛选
            </Button>
          </div>

          {/* 高级筛选 */}
          {isFilterExpanded && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 时间范围 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    开始时间
                  </label>
                  <Input
                    type="datetime-local"
                    value={filters.startTime || ''}
                    onChange={(e) => setFilters({ ...filters, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    结束时间
                  </label>
                  <Input
                    type="datetime-local"
                    value={filters.endTime || ''}
                    onChange={(e) => setFilters({ ...filters, endTime: e.target.value })}
                  />
                </div>

                {/* 操作人筛选 - 仅应用日志模式 */}
                {config.showOperatorFilter && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      操作人
                    </label>
                    <Input
                      placeholder="输入操作人姓名"
                      value={(filters as ApplicationLogFilters).operator || ''}
                      onChange={(e) => setFilters({ ...filters, operator: e.target.value })}
                    />
                  </div>
                )}

                {/* 三员角色筛选 - 仅三员日志模式 */}
                {config.showRoleFilter && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      管理员角色
                    </label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      value={(filters as ThreeAdminLogFilters).operatorRole || ''}
                      onChange={(e) => setFilters({ 
                        ...filters, 
                        operatorRole: e.target.value as 'SYSTEM_ADMIN' | 'SECURITY_ADMIN' | 'AUDITOR'
                      })}
                    >
                      <option value="">全部角色</option>
                      {Object.entries(threeAdminRoleConfig).map(([key, roleConfig]) => (
                        <option key={key} value={key}>
                          {roleConfig.icon} {roleConfig.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 操作模块 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    操作模块
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={filters.module || ''}
                    onChange={(e) => setFilters({ ...filters, module: e.target.value as OperationModule })}
                  >
                    <option value="">全部模块</option>
                    {Object.entries(moduleConfig).map(([key, moduleConf]) => (
                      <option key={key} value={key}>
                        {moduleConf.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 行为类别 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    行为类别
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={filters.actionCategory || ''}
                    onChange={(e) => setFilters({ ...filters, actionCategory: e.target.value as ActionCategory })}
                  >
                    <option value="">全部类别</option>
                    {Object.entries(actionConfig).map(([key, actionConf]) => (
                      <option key={key} value={key}>
                        {actionConf.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 操作结果 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    操作结果
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={filters.operationResult || ''}
                    onChange={(e) => setFilters({ ...filters, operationResult: e.target.value as LogOperationResult })}
                  >
                    <option value="">全部结果</option>
                    <option value="success">成功</option>
                    <option value="failure">失败</option>
                  </select>
                </div>
              </div>

              {/* 筛选操作 */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleResetFilters}>
                  <X className="h-4 w-4 mr-2" />
                  重置
                </Button>
                <Button onClick={() => console.log('应用筛选', filters)}>
                  应用筛选
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 日志表格 */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={logs}
            columns={columns}
            loading={isLoading}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            rowKey="id"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default LogPage
