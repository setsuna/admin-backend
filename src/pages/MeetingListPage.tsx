import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Filter, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DataTable } from '@/components/features/DataTable'
import { meetingApiService } from '@/services/api/meeting.api'
import { debounce, formatDate } from '@/utils'
import { useAuth } from '@/store'
import { useDialog } from '@/hooks/useModal'
import { useNotifications } from '@/hooks/useNotifications'
import { DialogComponents } from '@/components/ui/DialogComponents'
// ✅ 使用 TanStack Query Hook
import { useMeetings } from '@/hooks/useMeetings'
import type { Meeting, MeetingFilters, MeetingStatus, MeetingSecurityLevel, MeetingType, TableColumn } from '@/types'

// 新的状态配置
const statusConfig: Record<string, { label: string; color: string }> = {
  editable: { label: '可编辑', color: 'text-blue-600' },
  ready: { label: '就绪', color: 'text-green-600' },
  closed: { label: '关闭', color: 'text-red-600' }
}

// 旧状态到新状态的映射（用于兼容后端可能返回的旧状态）
const mapLegacyStatus = (status: string): MeetingStatus => {
  const statusMap: Record<string, MeetingStatus> = {
    'preparation': 'editable',
    'distributable': 'ready',
    'in_progress': 'editable',
    'closed': 'closed',
    // 新状态直接返回
    'editable': 'editable',
    'ready': 'ready'
  }
  return statusMap[status] || 'editable'
}

const securityLevelConfig: Record<string, { label: string; color: string }> = {
  internal: { label: '内部', color: 'bg-green-100 text-green-800' },
  confidential: { label: '秘密', color: 'bg-yellow-100 text-yellow-800' },
  secret: { label: '机密', color: 'bg-red-100 text-red-800' }
}

const typeConfig: Record<string, { label: string }> = {
  standard: { label: '标准' },
  tablet: { label: '平板' }
}

const MeetingListPage: React.FC = () => {
  const navigate = useNavigate()
  const { user: _user } = useAuth()
  const dialog = useDialog()
  const { showSuccess, showError } = useNotifications()
  // ✅ 用于手动刷新
  const queryClient = useQueryClient()
  
  // ❌ 删除：不再需要 meetings 和 loading 状态
  // const [meetings, setMeetings] = useState<Meeting[]>([])
  // const [loading, setLoading] = useState(false)
  
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | ''>('')
  const [securityFilter, setSecurityFilter] = useState<MeetingSecurityLevel | ''>('')
  const [typeFilter, setTypeFilter] = useState<MeetingType | ''>('')
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0
  })

  // 防抖搜索
  const debouncedSearch = debounce((keyword: string) => {
    setSearchText(keyword)
    setPagination(prev => ({ ...prev, page: 1 }))
  }, 500)

  // ✅ 使用 TanStack Query 获取数据（替代 loadMeetings + useEffect）
  const filters: MeetingFilters = {
    keyword: searchText || undefined,
    status: statusFilter || undefined,
    securityLevel: securityFilter || undefined,
    type: typeFilter || undefined
  }
  
  const { meetings, total, isLoading: loading, isError, error } = useMeetings(
    filters,
    pagination.page,
    pagination.pageSize
  )

  const handleSearch = (value: string) => {
    debouncedSearch(value)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status as MeetingStatus | '')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSecurityFilter = (level: string) => {
    setSecurityFilter(level as MeetingSecurityLevel | '')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type as MeetingType | '')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleMeetingClick = (meeting: Meeting) => {
    const mappedStatus = mapLegacyStatus(meeting.status)
    // 根据状态决定是编辑还是查看
    if (mappedStatus === 'editable') {
      navigate(`/meetings/edit/${meeting.id}`)
    } else {
      navigate(`/meetings/view/${meeting.id}`)
    }
  }

  const handleCreateMeeting = () => {
    navigate('/meetings/create')
  }

  const handleDeleteMeeting = async (id: string) => {
    const confirmed = await dialog.confirm({
      title: '删除会议',
      message: '确定要删除这个会议吗？此操作不可恢复。',
      type: 'danger',
      confirmText: '删除',
      cancelText: '取消'
    })
    
    if (!confirmed) return
    
    try {
      const result = await meetingApiService.deleteMeeting(id)
      showSuccess('删除成功', result.message)
      // ✅ 刷新列表
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    } catch (error: any) {
      showError('删除失败', error.message)
    }
  }

  // 打包会议 (editable → ready)
  const handlePackageMeeting = async (id: string) => {
    const confirmed = await dialog.confirm({
      title: '打包会议',
      message: '确定要打包这个会议吗？',
      content: '打包后会议将进入就绪状态，无法编辑。',
      type: 'warning',
      confirmText: '确定打包',
      cancelText: '取消'
    })
    
    if (!confirmed) return
    
    try {
      const result = await meetingApiService.packageMeeting(id)
      showSuccess('打包成功', result.message)
      // ✅ 刷新列表
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    } catch (error: any) {
      showError('打包失败', error.message)
      // ✅ 刷新列表（后端会把状态改回 editable）
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    }
  }

  // 取消下发 (ready → editable)
  const handleCancelReady = async (id: string) => {
    const confirmed = await dialog.confirm({
      title: '取消下发',
      message: '确定要取消下发吗？',
      content: '这将删除已打包的文件，会议恢复为可编辑状态。',
      type: 'warning',
      confirmText: '确定取消',
      cancelText: '保持就绪'
    })
    
    if (!confirmed) return
    
    try {
      const result = await meetingApiService.cancelReady(id)
      showSuccess('取消成功', result.message)
      // ✅ 刷新列表
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    } catch (error: any) {
      showError('取消失败', error.message)
    }
  }

  // 关闭会议 (任意状态 → closed)
  const handleCloseMeeting = async (id: string) => {
    const confirmed = await dialog.confirm({
      title: '关闭会议',
      message: '确定要关闭这个会议吗？',
      content: '关闭后将无法恢复，且只有关闭状态的会议才能被删除。',
      type: 'warning',
      confirmText: '确定关闭',
      cancelText: '取消'
    })
    
    if (!confirmed) return
    
    try {
      const result = await meetingApiService.closeMeeting(id)
      showSuccess('关闭成功', result.message)
      // ✅ 刷新列表
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    } catch (error: any) {
      showError('关闭失败', error.message)
    }
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const meetingDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    const timeStr = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    
    if (meetingDate.getTime() === today.getTime()) {
      return `今天 ${timeStr}`
    } else if (meetingDate.getTime() === tomorrow.getTime()) {
      return `明天 ${timeStr}`
    } else {
      return formatDate(dateTime).replace(/:\d{2}$/, '')
    }
  }

  const renderSecurityLevel = (level: MeetingSecurityLevel) => {
    const config = securityLevelConfig[level]
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Shield className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    )
  }

  const renderStatus = (status: MeetingStatus) => {
    // 映射旧状态到新状态
    const mappedStatus = mapLegacyStatus(status)
    const config = statusConfig[mappedStatus]
    return (
      <span className={`font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const columns: TableColumn<Meeting>[] = [
    {
      key: 'name',
      title: '会议名称',
      width: 300,
      render: (name: string, record: Meeting) => (
        <button
          className="text-left hover:text-blue-600 hover:underline font-medium"
          onClick={() => handleMeetingClick(record)}
        >
          {name}
        </button>
      ),
    },
    {
      key: 'start_time',
      title: '会议时间',
      width: 150,
      render: (startTime: string) => formatDateTime(startTime),
    },
    {
      key: 'type',
      title: '类型',
      width: 100,
      render: (type: MeetingType) => (
        <span className="text-sm text-muted-foreground">
          {typeConfig[type].label}
        </span>
      ),
    },
    {
      key: 'status',
      title: '会议状态',
      width: 100,
      render: (status: MeetingStatus) => renderStatus(status),
    },
    {
      key: 'security_level',
      title: '会议密级',
      width: 120,
      render: (level: MeetingSecurityLevel) => renderSecurityLevel(level),
    },
    {
      key: 'actions',
      title: '操作',
      width: 200,
      align: 'center',
      render: (_, record: Meeting) => {
        const mappedStatus = mapLegacyStatus(record.status)
        
        return (
          <div className="flex items-center justify-center gap-1">
            {/* 编辑/查看按钮 */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleMeetingClick(record)}
            >
              {mappedStatus === 'ready' || mappedStatus === 'closed' ? '查看' : '编辑'}
            </Button>
            
            {/* 状态切换按钮 */}
            {mappedStatus === 'editable' && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handlePackageMeeting(record.id)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  打包
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleCloseMeeting(record.id)}
                  className="text-orange-600 hover:text-orange-700"
                >
                  关闭
                </Button>
              </>
            )}
            
            {mappedStatus === 'ready' && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleCancelReady(record.id)}
                  className="text-yellow-600 hover:text-yellow-700"
                >
                  取消下发
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleCloseMeeting(record.id)}
                  className="text-orange-600 hover:text-orange-700"
                >
                  关闭
                </Button>
              </>
            )}
            
            {mappedStatus === 'closed' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleDeleteMeeting(record.id)}
                className="text-red-600 hover:text-red-700"
              >
                删除
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索会议名称..."
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={typeFilter}
              onChange={(e) => handleTypeFilter(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">会议类型</option>
              <option value="standard">标准</option>
              <option value="tablet">平板</option>
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

            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">状态</option>
              <option value="editable">可编辑</option>
              <option value="ready">就绪</option>
              <option value="closed">关闭</option>
            </select>
          </div>
        </div>
          
        <Button onClick={handleCreateMeeting}>
          <Plus className="mr-2 h-4 w-4" />
          新建会议
        </Button>
      </div>

      {/* 错误提示 */}
      {isError && (
        <div className="mx-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
          <p className="font-medium">加载失败</p>
          <p className="text-sm mt-1">{error?.message || '未知错误'}</p>
        </div>
      )}

      {/* 会议列表 */}
      <div className="px-4">
        <DataTable
          data={meetings}
          columns={columns}
          loading={loading}
          pagination={{
            page: pagination.page,
            pageSize: pagination.pageSize,
            total: total
          }}
          onPaginationChange={(paginationParams) => {
            setPagination(prev => ({
              ...prev,
              page: paginationParams.page,
              pageSize: paginationParams.pageSize
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

export default MeetingListPage
