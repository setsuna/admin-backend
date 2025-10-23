/**
 * 会议列表页面
 * 
 * 使用 TanStack Query 管理服务器状态
 * 解决了传统 useEffect 导致的双重请求问题
 */

import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useMeetings } from '@/hooks/useMeetings'
import { useDialog } from '@/hooks/useModal'
import { useNotifications } from '@/hooks/useNotifications'
import { meetingApi } from '@/services/api/meeting.api'
import { DataTable } from '@/components/features/DataTable'
import { DialogComponents } from '@/components/ui/DialogComponents'
import type { 
  MeetingFilters, 
  Meeting, 
  MeetingStatus, 
  MeetingSecurityLevel, 
  MeetingType,
  PaginationParams 
} from '@/types'

/**
 * 会议列表页面组件
 */
const MeetingListPage: React.FC = () => {
  // ========== 筛选器状态 ==========
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | ''>('')
  const [securityFilter, setSecurityFilter] = useState<MeetingSecurityLevel | ''>('')
  const [typeFilter, setTypeFilter] = useState<MeetingType | ''>('')

  // ========== 分页状态 ==========
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: 10,
  })

  // ========== 构建筛选条件 ==========
  const filters: MeetingFilters = {
    keyword: searchText || undefined,
    status: statusFilter || undefined,
    securityLevel: securityFilter || undefined,
    type: typeFilter || undefined,
  }

  // ========== 使用 TanStack Query 获取数据 ==========
  // ✅ 替代了原来的 useEffect + useState + loadMeetings
  const { meetings, total, isLoading, isError, error } = useMeetings(
    filters,
    pagination.page,
    pagination.pageSize
  )

  // ========== Query Client (用于手动刷新) ==========
  const queryClient = useQueryClient()

  // ========== UI 交互 Hooks ==========
  const dialog = useDialog()
  const { showSuccess, showError } = useNotifications()

  // ========== 筛选器变化处理 ==========
  const handleSearch = (value: string) => {
    setSearchText(value)
    // 搜索时重置到第一页
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as MeetingStatus | '')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSecurityFilterChange = (value: string) => {
    setSecurityFilter(value as MeetingSecurityLevel | '')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value as MeetingType | '')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // ========== 分页处理 ==========
  const handlePaginationChange = (newPagination: PaginationParams) => {
    setPagination(newPagination)
  }

  // ========== 删除会议 ==========
  const handleDeleteMeeting = async (id: string) => {
    const confirmed = await dialog.confirm({
      title: '删除会议',
      message: '确定要删除这个会议吗？此操作不可恢复。',
      type: 'danger',
      confirmText: '删除',
      cancelText: '取消',
    })

    if (!confirmed) return

    try {
      const result = await meetingApi.deleteMeeting(id)
      showSuccess('删除成功', result.message)
      
      // ✅ 操作成功后刷新列表
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    } catch (error: any) {
      showError('删除失败', error.message)
    }
  }

  // ========== 打包会议 ==========
  const handlePackageMeeting = async (id: string) => {
    const confirmed = await dialog.confirm({
      title: '打包会议',
      message: '确定要打包这个会议吗？',
      content: '打包后会议将进入就绪状态，无法编辑。',
      type: 'warning',
      confirmText: '确定打包',
      cancelText: '取消',
    })

    if (!confirmed) return

    try {
      const result = await meetingApi.packageMeeting(id)
      showSuccess('打包成功', result.message)
      
      // ✅ 操作成功后刷新列表
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    } catch (error: any) {
      showError('打包失败', error.message)
    }
  }

  // ========== 取消就绪 ==========
  const handleCancelReady = async (id: string) => {
    const confirmed = await dialog.confirm({
      title: '取消就绪',
      message: '确定要取消就绪状态吗？',
      content: '取消后会议将回到草稿状态，可以继续编辑。',
      type: 'warning',
      confirmText: '确定取消',
      cancelText: '取消',
    })

    if (!confirmed) return

    try {
      const result = await meetingApi.cancelReady(id)
      showSuccess('取消成功', result.message)
      
      // ✅ 操作成功后刷新列表
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    } catch (error: any) {
      showError('取消失败', error.message)
    }
  }

  // ========== 关闭会议 ==========
  const handleCloseMeeting = async (id: string) => {
    const confirmed = await dialog.confirm({
      title: '关闭会议',
      message: '确定要关闭这个会议吗？',
      content: '关闭后会议将无法再进行任何操作。',
      type: 'danger',
      confirmText: '确定关闭',
      cancelText: '取消',
    })

    if (!confirmed) return

    try {
      const result = await meetingApi.closeMeeting(id)
      showSuccess('关闭成功', result.message)
      
      // ✅ 操作成功后刷新列表
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    } catch (error: any) {
      showError('关闭失败', error.message)
    }
  }

  // ========== 表格列定义 ==========
  const columns = [
    {
      key: 'title',
      title: '会议名称',
      width: '25%',
      render: (_: any, record: Meeting) => (
        <div className="font-medium text-gray-900">{record.title}</div>
      ),
    },
    {
      key: 'status',
      title: '状态',
      width: '12%',
      align: 'center' as const,
      render: (_: any, record: Meeting) => {
        const statusMap: Record<MeetingStatus, { label: string; color: string }> = {
          draft: { label: '草稿', color: 'bg-gray-100 text-gray-800' },
          ready: { label: '就绪', color: 'bg-blue-100 text-blue-800' },
          in_progress: { label: '进行中', color: 'bg-green-100 text-green-800' },
          completed: { label: '已完成', color: 'bg-purple-100 text-purple-800' },
          closed: { label: '已关闭', color: 'bg-red-100 text-red-800' },
        }
        const status = statusMap[record.status]
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>
            {status.label}
          </span>
        )
      },
    },
    {
      key: 'securityLevel',
      title: '密级',
      width: '10%',
      align: 'center' as const,
      render: (_: any, record: Meeting) => {
        const levelMap: Record<MeetingSecurityLevel, string> = {
          public: '公开',
          internal: '内部',
          confidential: '机密',
          secret: '秘密',
        }
        return levelMap[record.securityLevel]
      },
    },
    {
      key: 'type',
      title: '类型',
      width: '12%',
      align: 'center' as const,
      render: (_: any, record: Meeting) => {
        const typeMap: Record<MeetingType, string> = {
          regular: '常规会议',
          emergency: '紧急会议',
          review: '评审会议',
        }
        return typeMap[record.type]
      },
    },
    {
      key: 'createdAt',
      title: '创建时间',
      width: '15%',
      render: (_: any, record: Meeting) => new Date(record.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      title: '操作',
      width: '20%',
      align: 'right' as const,
      render: (_: any, record: Meeting) => (
        <div className="flex justify-end gap-2">
          {record.status === 'draft' && (
            <button
              onClick={() => handlePackageMeeting(record.id)}
              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              打包
            </button>
          )}
          {record.status === 'ready' && (
            <button
              onClick={() => handleCancelReady(record.id)}
              className="px-3 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded transition-colors"
            >
              取消就绪
            </button>
          )}
          {record.status === 'completed' && (
            <button
              onClick={() => handleCloseMeeting(record.id)}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
            >
              关闭
            </button>
          )}
          <button
            onClick={() => handleDeleteMeeting(record.id)}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            删除
          </button>
        </div>
      ),
    },
  ]

  // ========== 渲染 ==========
  return (
    <div className="p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">会议管理</h1>
        <p className="text-gray-500 mt-1">管理和查看所有会议信息</p>
      </div>

      {/* 筛选器区域 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 搜索框 */}
          <div>
            <input
              type="text"
              placeholder="搜索会议..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 状态筛选 */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">所有状态</option>
              <option value="draft">草稿</option>
              <option value="ready">就绪</option>
              <option value="in_progress">进行中</option>
              <option value="completed">已完成</option>
              <option value="closed">已关闭</option>
            </select>
          </div>

          {/* 密级筛选 */}
          <div>
            <select
              value={securityFilter}
              onChange={(e) => handleSecurityFilterChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">所有密级</option>
              <option value="public">公开</option>
              <option value="internal">内部</option>
              <option value="confidential">机密</option>
              <option value="secret">秘密</option>
            </select>
          </div>

          {/* 类型筛选 */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => handleTypeFilterChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">所有类型</option>
              <option value="regular">常规会议</option>
              <option value="emergency">紧急会议</option>
              <option value="review">评审会议</option>
            </select>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
          <p className="font-semibold">加载失败</p>
          <p className="text-sm mt-1">{error?.message || '未知错误'}</p>
        </div>
      )}

      {/* 数据表格 */}
      <div className="bg-white rounded-lg shadow">
        <DataTable<Meeting>
          data={meetings}
          columns={columns}
          loading={isLoading}
          pagination={{ ...pagination, total }}
          onPaginationChange={handlePaginationChange}
          rowKey="id"
          bordered
        />
      </div>

      {/* 对话框组件 */}
      <DialogComponents dialog={dialog} />
    </div>
  )
}

export default MeetingListPage
