/**
 * 归档列表查询 Hook
 *
 * 封装归档列表的 TanStack Query 逻辑 + WebSocket 实时通知
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { archiveApi } from '@/services/api/archive.api'
import { useWSSubscription } from '@/services/websocket'
import { useNotifications } from '@/hooks/useNotifications'
import type { Archive, ArchiveFilters } from '@/types'
import type { WSMessage, ArchiveNotifyData } from '@/services/websocket'

// ========== 列表查询 ==========

interface UseArchivesResult {
  archives: Archive[]
  total: number
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

/**
 * 归档列表查询 Hook
 */
export function useArchives(
  filters: ArchiveFilters,
  page: number,
  pageSize: number
): UseArchivesResult {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['archives', { ...filters, page, pageSize }],
    queryFn: () => archiveApi.getArchives(filters, page, pageSize),
  })

  return {
    archives: data?.items || [],
    total: data?.pagination?.total || 0,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  }
}

// ========== WebSocket 实时通知 ==========

/**
 * 归档 WebSocket 通知 Hook
 *
 * 监听归档相关的 WS 消息，触发 toast 并自动刷新列表。
 * 在归档列表页挂载即可。
 */
export function useArchiveNotifications() {
  const queryClient = useQueryClient()
  const { showSuccess, showError, showInfo } = useNotifications()

  // 归档开始
  useWSSubscription<ArchiveNotifyData>('archive_start', (message: WSMessage<ArchiveNotifyData>) => {
    const { device_serial } = message.data
    showInfo('归档进行中', `设备 ${device_serial} 正在归档...`)
  })

  // 归档完成
  useWSSubscription<ArchiveNotifyData>('archive_complete', (message: WSMessage<ArchiveNotifyData>) => {
    const { device_serial, meeting_count, signatures_count, votes_count } = message.data
    const parts: string[] = []
    if (meeting_count) parts.push(`${meeting_count} 场会议`)
    if (signatures_count) parts.push(`${signatures_count} 条签到`)
    if (votes_count) parts.push(`${votes_count} 条投票`)
    const detail = parts.length > 0 ? `：${parts.join('，')}` : ''
    showSuccess('归档完成', `设备 ${device_serial} 归档完成${detail}`)
    // 刷新归档列表
    queryClient.invalidateQueries({ queryKey: ['archives'] })
  })

  // 归档失败
  useWSSubscription<ArchiveNotifyData>('archive_failed', (message: WSMessage<ArchiveNotifyData>) => {
    const { device_serial, error_message } = message.data
    showError('归档失败', `设备 ${device_serial}：${error_message || '未知错误'}`)
    queryClient.invalidateQueries({ queryKey: ['archives'] })
  })
}
