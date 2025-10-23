/**
 * 会议列表查询 Hook
 * 
 * 封装会议列表的 TanStack Query 逻辑，提供简洁的 API
 */

import { useQuery } from '@tanstack/react-query'
import { meetingApi } from '@/services/api/meeting.api'
import type { Meeting, MeetingFilters } from '@/types'

/**
 * Hook 配置选项
 */
interface UseMeetingsOptions {
  /**
   * 是否启用查询（默认 true）
   * 设为 false 可以暂停查询
   */
  enabled?: boolean
}

/**
 * Hook 返回值
 */
interface UseMeetingsResult {
  /** 会议列表数据 */
  meetings: Meeting[]
  /** 总记录数 */
  total: number
  /** 是否正在加载 */
  isLoading: boolean
  /** 是否加载失败 */
  isError: boolean
  /** 错误信息 */
  error: Error | null
  /** 手动刷新方法 */
  refetch: () => void
}

/**
 * 使用会议列表查询
 * 
 * @param filters - 筛选条件
 * @param page - 当前页码（从 1 开始）
 * @param pageSize - 每页条数
 * @param options - 额外配置选项
 * @returns 会议列表数据和状态
 * 
 * @example
 * ```tsx
 * const { meetings, total, isLoading } = useMeetings(
 *   { 
 *     keyword: searchText || undefined,
 *     status: statusFilter || undefined 
 *   },
 *   pagination.page,
 *   pagination.pageSize
 * )
 * ```
 */
export function useMeetings(
  filters: MeetingFilters,
  page: number,
  pageSize: number,
  options: UseMeetingsOptions = {}
): UseMeetingsResult {
  const { enabled = true } = options

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    // queryKey 必须包含所有影响数据的参数
    // 任何参数变化都会触发重新请求
    queryKey: ['meetings', { ...filters, page, pageSize }],
    
    // 查询函数：调用 API 获取数据
    queryFn: () => meetingApi.getMeetings(filters, page, pageSize),
    
    // 是否启用查询
    enabled,
    
    // 数据保持新鲜的时间（5秒）
    // 在配置文件中已设置全局默认值，这里可以覆盖
    staleTime: 5000,
  })

  return {
    // 提取数据，提供默认值防止 undefined
    meetings: data?.items || [],
    total: data?.pagination?.total || 0,
    
    // 状态
    isLoading,
    isError,
    error: error as Error | null,
    
    // 方法
    refetch,
  }
}
