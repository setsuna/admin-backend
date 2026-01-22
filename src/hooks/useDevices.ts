/**
 * 设备列表查询 Hook
 * 
 * 封装设备列表的 TanStack Query 逻辑，提供简洁的 API
 */

import { useQuery } from '@tanstack/react-query'
import { deviceApi } from '@/services/api/device.api'
import type { ManagedDevice, ManagedDeviceFilters } from '@/types'

/**
 * Hook 配置选项
 */
interface UseDevicesOptions {
  /**
   * 是否启用查询（默认 true）
   */
  enabled?: boolean
}

/**
 * Hook 返回值
 */
interface UseDevicesResult {
  /** 设备列表数据 */
  devices: ManagedDevice[]
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
 * 使用设备列表查询
 * 
 * @param filters - 筛选条件
 * @param page - 当前页码（从 1 开始）
 * @param pageSize - 每页条数
 * @param options - 额外配置选项
 * @returns 设备列表数据和状态
 * 
 * @example
 * ```tsx
 * const { devices, total, isLoading } = useDevices(
 *   { 
 *     keyword: searchText || undefined,
 *     status: statusFilter 
 *   },
 *   pagination.page,
 *   pagination.pageSize
 * )
 * ```
 */
export function useDevices(
  filters: ManagedDeviceFilters,
  page: number,
  pageSize: number,
  options: UseDevicesOptions = {}
): UseDevicesResult {
  const { enabled = true } = options

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['devices', { ...filters, page, pageSize }],
    queryFn: () => deviceApi.getDevices(filters, page, pageSize),
    enabled,
  })

  return {
    devices: data?.items || [],
    total: data?.pagination?.total || 0,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  }
}
