import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deviceService } from '@/services/device'
import { useNotifications, useApp } from '@/hooks'
import type { Device, PaginationParams } from '@/types'

/**
 * 设备列表Hook
 * 获取设备列表数据
 */
export function useDevices(params?: PaginationParams & { search?: string; status?: string }) {
  return useQuery({
    queryKey: ['devices', params],
    queryFn: () => deviceService.getDevices(params),
    staleTime: 30000, // 30秒内不重新请求
  })
}

/**
 * 设备详情Hook
 * 获取单个设备的详细信息
 */
export function useDevice(id: string) {
  return useQuery({
    queryKey: ['device', id],
    queryFn: () => deviceService.getDevice(id),
    enabled: !!id,
  })
}

/**
 * 设备统计Hook
 * 获取设备统计信息，定期更新
 */
export function useDeviceStats() {
  const { updateDeviceStats } = useApp()
  
  return useQuery({
    queryKey: ['deviceStats'],
    queryFn: () => deviceService.getDeviceStats(),
    refetchInterval: 10000, // 每10秒更新一次
    onSuccess: (data) => {
      // 同步更新到全局状态
      updateDeviceStats(data.data)
    }
  })
}

/**
 * 设备操作Hooks
 * 提供设备的增删改操作
 */
export function useDeviceOperations() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useNotifications()
  const { updateDeviceStatus } = useApp()
  
  const createDevice = useMutation({
    mutationFn: deviceService.createDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      queryClient.invalidateQueries({ queryKey: ['deviceStats'] })
      showSuccess('创建成功', '设备已成功创建')
    },
    onError: (error: any) => {
      showError('创建失败', error.message)
    },
  })
  
  const updateDevice = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Device> }) =>
      deviceService.updateDevice(id, data),
    onSuccess: (_, { id, data }) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      queryClient.invalidateQueries({ queryKey: ['device', id] })
      queryClient.invalidateQueries({ queryKey: ['deviceStats'] })
      
      // 同步更新到全局状态
      updateDeviceStatus(id, data)
      
      showSuccess('更新成功', '设备信息已更新')
    },
    onError: (error: any) => {
      showError('更新失败', error.message)
    },
  })
  
  const deleteDevice = useMutation({
    mutationFn: deviceService.deleteDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      queryClient.invalidateQueries({ queryKey: ['deviceStats'] })
      showSuccess('删除成功', '设备已删除')
    },
    onError: (error: any) => {
      showError('删除失败', error.message)
    },
  })
  
  // 批量操作
  const batchUpdateDevices = useMutation({
    mutationFn: ({ ids, data }: { ids: string[]; data: Partial<Device> }) =>
      deviceService.batchUpdateDevices(ids, data),
    onSuccess: (_, { ids }) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      queryClient.invalidateQueries({ queryKey: ['deviceStats'] })
      showSuccess('批量更新成功', `已更新 ${ids.length} 个设备`)
    },
    onError: (error: any) => {
      showError('批量更新失败', error.message)
    },
  })
  
  return {
    createDevice,
    updateDevice,
    deleteDevice,
    batchUpdateDevices,
    // 操作状态
    isCreating: createDevice.isPending,
    isUpdating: updateDevice.isPending,
    isDeleting: deleteDevice.isPending,
    isBatchUpdating: batchUpdateDevices.isPending,
  }
}

/**
 * 设备状态监控Hook
 * 处理设备状态的实时更新
 */
export function useDeviceMonitor() {
  const { devices, deviceStats } = useApp()
  const queryClient = useQueryClient()
  
  // 手动刷新设备状态
  const refreshDevices = () => {
    queryClient.invalidateQueries({ queryKey: ['devices'] })
    queryClient.invalidateQueries({ queryKey: ['deviceStats'] })
  }
  
  // 获取设备状态统计
  const getStatusCounts = () => {
    if (!deviceStats) return { online: 0, offline: 0, warning: 0, error: 0 }
    return deviceStats
  }
  
  return {
    devices,
    deviceStats,
    refreshDevices,
    getStatusCounts,
  }
}
