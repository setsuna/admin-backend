import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DataTable } from '@/components/features/DataTable'
import { meetingApi } from '@/services/meeting'
import { envConfig } from '@/config/env.config'
import { debounce, formatDate } from '@/utils'
import type { Meeting, MeetingFilters, MeetingStatus, MeetingSecurityLevel, MeetingType, TableColumn } from '@/types'

const statusConfig = {
  preparation: { label: '准备', color: 'text-gray-600' },
  distributable: { label: '可下发', color: 'text-blue-600' },
  in_progress: { label: '进行中', color: 'text-green-600' },
  closed: { label: '关闭', color: 'text-red-600' }
}

const securityLevelConfig = {
  internal: { label: '内部', color: 'bg-green-100 text-green-800' },
  confidential: { label: '秘密', color: 'bg-yellow-100 text-yellow-800' },
  secret: { label: '机密', color: 'bg-red-100 text-red-800' }
}

const typeConfig = {
  standard: { label: '标准' },
  tablet: { label: '平板' }
}

const MeetingListPage: React.FC = () => {
  // 显示当前使用的API模式
  console.log('📊 Meeting List: API Mode =', envConfig.ENABLE_MOCK ? 'Mock' : 'Real')
  const navigate = useNavigate()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(false)
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

  // 加载会议数据
  const loadMeetings = async () => {
    try {
      setLoading(true)
      const filters: MeetingFilters = {
        keyword: searchText || undefined,
        status: statusFilter || undefined,
        securityLevel: securityFilter || undefined,
        type: typeFilter || undefined
      }
      const response = await meetingApi.getMeetings(filters, pagination.page, pagination.pageSize)
      setMeetings(response.items)
      setPagination(prev => ({ ...prev, total: response.pagination.total }))
    } catch (error) {
      console.error('Failed to load meetings:', error)
      setMeetings([])
      setPagination(prev => ({ ...prev, total: 0 }))
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadMeetings()
  }, [pagination.page])

  // 筛选变化时重新加载
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
    loadMeetings()
  }, [searchText, statusFilter, securityFilter, typeFilter])

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
    // 导航到会议编辑页面
    console.log('Edit meeting:', meeting.id)
    // 这里应该导航到编辑页面
  }

  const handleCreateMeeting = () => {
    navigate('/meetings/create')
  }

  const handleDeleteMeeting = async (id: string) => {
    if (window.confirm('确定要删除这个会议吗？')) {
      try {
        const success = await meetingApi.deleteMeeting(id)
        if (success) {
          loadMeetings() // 重新加载列表
        } else {
          alert('删除失败，只有关闭状态的会议才能删除')
        }
      } catch (error) {
        console.error('Delete meeting failed:', error)
        alert('删除失败')
      }
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
    const config = statusConfig[status]
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
      key: 'startTime',
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
      key: 'securityLevel',
      title: '会议密级',
      width: 120,
      render: (level: MeetingSecurityLevel) => renderSecurityLevel(level),
    },
    {
      key: 'actions',
      title: '操作',
      width: 120,
      align: 'center',
      render: (_, record: Meeting) => (
        <div className="flex items-center justify-center gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleMeetingClick(record)}
          >
            编辑
          </Button>
          {record.status === 'closed' && (
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
      ),
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
              <option value="preparation">准备</option>
              <option value="distributable">可下发</option>
              <option value="closed">关闭</option>
            </select>
          </div>
        </div>
          
        <Button onClick={handleCreateMeeting}>
          <Plus className="mr-2 h-4 w-4" />
          新建会议
        </Button>
      </div>

      {/* 会议列表 */}
      <div className="px-4">
        <DataTable
          data={meetings}
          columns={columns}
          loading={loading}
          pagination={pagination}
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
    </div>
  )
}

export default MeetingListPage
