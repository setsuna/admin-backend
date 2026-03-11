import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  X,
  Calendar,
  Tablet,
  Activity,
  Hash,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { DataTable } from '@/components/features/DataTable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/SelectNew'
import { deviceLogService } from '@/services'
import {
  DEVICE_ACTION_CONFIG,
} from '@/types/domain/device-log.types'
import type {
  DeviceAuditLog,
  DeviceAuditLogFilters,
  TableColumn
} from '@/types'

const DeviceLogPage: React.FC = () => {
  // 状态
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)

  // 筛选条件
  const [filters, setFilters] = useState<DeviceAuditLogFilters>({})
  const [searchKeyword, setSearchKeyword] = useState('')

  // 分页状态
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0
  })

  // 获取统计数据
  const { data: stats } = useQuery({
    queryKey: ['device-logs-stats'],
    queryFn: () => deviceLogService.getStats(),
    staleTime: 60000 // 1分钟缓存
  })

  // 获取日志列表
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['device-logs', pagination.page, pagination.pageSize, filters, searchKeyword],
    queryFn: async () => {
      const params = {
        ...filters,
        keyword: searchKeyword || undefined,
        page: pagination.page,
        pageSize: pagination.pageSize
      }
      return deviceLogService.getLogs(params)
    },
    staleTime: 30000
  })

  // 更新分页总数
  React.useEffect(() => {
    if (data?.pagination) {
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total
      }))
    }
  }, [data?.pagination])

  const logs = data?.items || []

  // 处理分页变化
  const handlePaginationChange = (newPagination: { page: number; pageSize: number }) => {
    setPagination(prev => ({
      ...prev,
      ...newPagination
    }))
  }

  // 处理导出
  const handleExport = () => {
    console.log('导出终端日志')
    // TODO: 实现导出功能
  }

  // 处理刷新
  const handleRefresh = () => {
    refetch()
  }

  // 重置筛选
  const handleResetFilters = () => {
    setFilters({})
    setSearchKeyword('')
  }

  // 应用筛选
  const handleApplyFilters = () => {
    setPagination(prev => ({
      ...prev,
      page: 1
    }))
  }

  // 获取操作类型显示标签
  const getActionLabel = (action: string): string => {
    return DEVICE_ACTION_CONFIG[action]?.label || action
  }

  // 获取操作类型颜色
  const getActionColor = (action: string): string => {
    return DEVICE_ACTION_CONFIG[action]?.color || 'text-gray-600'
  }

  // 表格列定义
  const columns: TableColumn<DeviceAuditLog>[] = [
    {
      key: 'timestamp',
      title: '操作时间',
      width: 120,
      render: (timestamp: string) => {
        // 去掉日期部分，只显示时分秒
        const time = timestamp.includes('T')
          ? new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          : timestamp
        return (
          <span className="whitespace-nowrap">
            {time}
          </span>
        )
      }
    },
    {
      key: 'deviceSerial',
      title: '设备序列号',
      width: 160,
      render: (serial: string) => (
        <span className="font-mono text-sm">{serial}</span>
      )
    },
    {
      key: 'action',
      title: '操作类型',
      width: 120,
      render: (action: string) => (
        <span className={`font-medium ${getActionColor(action)}`}>
          {getActionLabel(action)}
        </span>
      )
    },
    {
      key: 'userName',
      title: '用户',
      width: 120,
      render: (userName: string | null) => (
        <span className={userName ? 'font-medium' : 'text-muted-foreground'}>
          {userName || '-'}
        </span>
      )
    },
    {
      key: 'meetingId',
      title: '会议ID',
      width: 140,
      render: (meetingId: string | null) => {
        if (!meetingId) return <span className="text-muted-foreground">-</span>
        return (
          <span
            className="font-mono text-sm cursor-help"
            title={meetingId}
          >
            {meetingId.substring(0, 8)}...
          </span>
        )
      }
    },
    {
      key: 'logDate',
      title: '日志日期',
      width: 120,
      render: (logDate: string) => (
        <span className="text-muted-foreground text-sm">{logDate}</span>
      )
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Tablet className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">终端日志</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            查看平板设备的操作审计记录
          </p>
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

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">总日志数</p>
                  <p className="text-2xl font-bold">{stats.totalCount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Tablet className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">设备数</p>
                  <p className="text-2xl font-bold">{stats.deviceCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">最多操作</p>
                  <p className="text-2xl font-bold">
                    {stats.actionCounts.length > 0
                      ? getActionLabel(stats.actionCounts[0].action)
                      : '-'}
                  </p>
                  {stats.actionCounts.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {stats.actionCounts[0].count.toLocaleString()} 次
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 筛选区域 */}
      <Card>
        <CardContent className="pt-6">
          {/* 基础搜索栏 */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索用户名、操作类型、设备序列号..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleApplyFilters()
                  }
                }}
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
                {/* 设备序列号 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    设备序列号
                  </label>
                  <Input
                    placeholder="输入设备序列号"
                    value={filters.deviceSerial || ''}
                    onChange={(e) => setFilters({ ...filters, deviceSerial: e.target.value })}
                  />
                </div>

                {/* 操作类型 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    操作类型
                  </label>
                  <Select
                    value={filters.action || undefined}
                    onValueChange={(value) => setFilters({
                      ...filters,
                      action: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="全部类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DEVICE_ACTION_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 开始时间 */}
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

                {/* 结束时间 */}
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
              </div>

              {/* 筛选操作 */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleResetFilters}>
                  <X className="h-4 w-4 mr-2" />
                  重置
                </Button>
                <Button onClick={handleApplyFilters}>
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

export default DeviceLogPage
