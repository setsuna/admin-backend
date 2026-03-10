import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Search, Filter, Shield, Download, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DataTable } from '@/components/features/DataTable'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'
import { archiveApi } from '@/services/api/archive.api'
import { debounce, formatDate } from '@/utils'
import { useDialog } from '@/hooks/useModal'
import { useNotifications } from '@/hooks/useNotifications'
import { DialogComponents } from '@/components/ui/DialogComponents'
import { useArchives, useArchiveNotifications } from '@/hooks/useArchive'
import type { Archive as ArchiveType, ArchiveFilters, ArchiveStatus, SystemSecurityLevel, TableColumn } from '@/types'

// 归档状态配置
const statusConfig: Record<ArchiveStatus, { label: string; color: string; bgColor: string }> = {
  processing: { label: '归档中', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  completed: { label: '已完成', color: 'text-green-600', bgColor: 'bg-green-100' },
  failed: { label: '失败', color: 'text-red-600', bgColor: 'bg-red-100' },
}

// 密级配置
const securityLevelConfig: Record<SystemSecurityLevel, { label: string; color: string }> = {
  internal: { label: '内部', color: 'bg-green-100 text-green-800' },
  confidential: { label: '秘密', color: 'bg-yellow-100 text-yellow-800' },
  secret: { label: '机密', color: 'bg-red-100 text-red-800' },
}

const ArchiveListPage: React.FC = () => {
  const dialog = useDialog()
  const { showSuccess, showError } = useNotifications()
  const queryClient = useQueryClient()

  // 搜索和筛选状态
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<ArchiveStatus | ''>('')
  const [securityFilter, setSecurityFilter] = useState<SystemSecurityLevel | ''>('')
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
  })

  // 下载中的归档 ID
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  // 防抖搜索
  const debouncedSearch = debounce((keyword: string) => {
    setSearchText(keyword)
    setPagination(prev => ({ ...prev, page: 1 }))
  }, 500)

  // 构建筛选条件
  const filters: ArchiveFilters = {
    keyword: searchText || undefined,
    status: statusFilter || undefined,
    securityLevel: securityFilter || undefined,
  }

  // TanStack Query 获取数据
  const { archives, total, isLoading, isError, error } = useArchives(
    filters,
    pagination.page,
    pagination.pageSize
  )

  // WebSocket 实时通知
  useArchiveNotifications()

  // ==================== 事件处理 ====================

  const handleSearch = (value: string) => {
    debouncedSearch(value)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status as ArchiveStatus | '')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSecurityFilter = (level: string) => {
    setSecurityFilter(level as SystemSecurityLevel | '')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // 下载归档
  const handleDownload = async (archive: ArchiveType) => {
    setDownloadingId(archive.id)
    try {
      const blob = await archiveApi.downloadArchive(archive.id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      // 使用与后端一致的文件名格式
      const dateStr = new Date(archive.createdAt).toISOString().replace(/[-:T]/g, '').slice(0, 14)
      link.download = `归档_${archive.meetingName}_${dateStr}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      showError('下载失败', err.message)
    } finally {
      setDownloadingId(null)
    }
  }

  // 删除归档
  const handleDelete = async (archive: ArchiveType) => {
    const confirmed = await dialog.confirm({
      title: '删除归档',
      message: `确定要删除「${archive.meetingName}」的归档数据吗？`,
      content: '此操作不可恢复，归档文件将被永久删除。',
      type: 'danger',
      confirmText: '删除',
      cancelText: '取消',
    })

    if (!confirmed) return

    try {
      const result = await archiveApi.deleteArchive(archive.id)
      showSuccess('删除成功', result.message || '归档已删除')
      queryClient.invalidateQueries({ queryKey: ['archives'] })
    } catch (err: any) {
      showError('删除失败', err.message)
    }
  }

  // ==================== 渲染辅助 ====================

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const meetingDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    const timeStr = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

    if (meetingDate.getTime() === today.getTime()) {
      return `今天 ${timeStr}`
    }
    return formatDate(dateTime).replace(/:\d{2}$/, '')
  }

  const renderMeetingTime = (startTime: string, record: ArchiveType) => {
    const start = formatDateTime(startTime)
    const endTime = new Date(record.meetingEndTime).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
    return (
      <span className="text-sm text-muted-foreground">
        {start} - {endTime}
      </span>
    )
  }

  const renderSecurityLevel = (level: SystemSecurityLevel) => {
    const config = securityLevelConfig[level]
    if (!config) return <span>{level}</span>
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Shield className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    )
  }

  const renderStatus = (status: ArchiveStatus) => {
    const config = statusConfig[status]
    if (!config) return <span>{status}</span>
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.bgColor} ${config.color}`}>
        {status === 'processing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
        {config.label}
      </span>
    )
  }

  const renderDevices = (devices: string[]) => {
    if (!devices || devices.length === 0) return <span className="text-muted-foreground">-</span>

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 cursor-default">
              {devices.length} 台设备
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              {devices.map(sn => (
                <div key={sn} className="text-xs font-mono">{sn}</div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const renderCounts = (record: ArchiveType) => {
    const items = [
      { label: '签到', count: record.signaturesCount },
      { label: '文件', count: record.editedFilesCount },
      { label: '记录', count: record.recordsCount },
      { label: '投票', count: record.votesCount },
    ].filter(item => item.count > 0)

    if (items.length === 0) return <span className="text-muted-foreground">-</span>

    return (
      <div className="flex items-center gap-2">
        {items.map(item => (
          <span key={item.label} className="text-xs text-muted-foreground">
            {item.label} <span className="font-medium text-foreground">{item.count}</span>
          </span>
        ))}
      </div>
    )
  }

  // ==================== 表格列定义 ====================

  const columns: TableColumn<ArchiveType>[] = [
    {
      key: 'meetingName',
      title: '会议名称',
      width: 240,
      render: (name: string) => (
        <span className="font-medium">{name}</span>
      ),
    },
    {
      key: 'meetingStartTime',
      title: '会议时间',
      width: 180,
      render: (startTime: string, record: ArchiveType) => renderMeetingTime(startTime, record),
    },
    {
      key: 'securityLevel',
      title: '密级',
      width: 100,
      render: (level: SystemSecurityLevel) => renderSecurityLevel(level),
    },
    {
      key: 'organizerName',
      title: '组织者',
      width: 100,
    },
    {
      key: 'status',
      title: '状态',
      width: 100,
      render: (status: ArchiveStatus) => renderStatus(status),
    },
    {
      key: 'id', // 使用任意 key，实际取 record 整体
      title: '归档内容',
      width: 220,
      render: (_: any, record: ArchiveType) => renderCounts(record),
    },
    {
      key: 'archivedDevices',
      title: '设备',
      width: 100,
      render: (devices: string[]) => renderDevices(devices),
    },
    {
      key: 'createdAt',
      title: '归档时间',
      width: 150,
      render: (time: string) => (
        <span className="text-sm text-muted-foreground">{formatDateTime(time)}</span>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      width: 140,
      align: 'center',
      render: (_: any, record: ArchiveType) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload(record)}
            disabled={record.status !== 'completed' || downloadingId === record.id}
            className="text-blue-600 hover:text-blue-700"
          >
            {downloadingId === record.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-1" />
            )}
            下载
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(record)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            删除
          </Button>
        </div>
      ),
    },
  ]

  // ==================== 渲染 ====================

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索会议名称 / 组织者..."
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">归档状态</option>
              <option value="processing">归档中</option>
              <option value="completed">已完成</option>
              <option value="failed">失败</option>
            </select>

            <select
              value={securityFilter}
              onChange={(e) => handleSecurityFilter(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">密级</option>
              <option value="internal">内部</option>
              <option value="confidential">秘密</option>
              <option value="secret">机密</option>
            </select>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {isError && (
        <div className="mx-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
          <p className="font-medium">加载失败</p>
          <p className="text-sm mt-1">{error?.message || '未知错误'}</p>
        </div>
      )}

      {/* 归档列表 */}
      <div className="px-4">
        <DataTable
          data={archives}
          columns={columns}
          loading={isLoading}
          pagination={{
            page: pagination.page,
            pageSize: pagination.pageSize,
            total: total,
          }}
          onPaginationChange={(paginationParams) => {
            setPagination(prev => ({
              ...prev,
              page: paginationParams.page,
              pageSize: paginationParams.pageSize,
            }))
          }}
          bordered={true}
          compact={true}
        />
      </div>

      {/* 对话框组件 */}
      <DialogComponents dialog={dialog} />
    </div>
  )
}

export default ArchiveListPage
