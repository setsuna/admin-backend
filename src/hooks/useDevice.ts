import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deviceService } from '@/services/device'
import { useGlobalStore } from '@/store'
import type { Device, PaginationParams } from '@/types'

// 设备列表hook
export function useDevices(params?: PaginationParams & { search?: string; status?: string }) {
  return useQuery({
    queryKey: ['devices', params],
    queryFn: () => deviceService.getDevices(params),
    staleTime: 30000, // 30秒内不重新请求
  })
}

// 设备详情hook
export function useDevice(id: string) {
  return useQuery({
    queryKey: ['device', id],
    queryFn: () => deviceService.getDevice(id),
    enabled: !!id,
  })
}

// 设备统计hook
export function useDeviceStats() {
  return useQuery({
    queryKey: ['deviceStats'],
    queryFn: () => deviceService.getDeviceStats(),
    refetchInterval: 10000, // 每10秒更新一次
  })
}

// 设备操作hooks
export function useDeviceOperations() {
  const queryClient = useQueryClient()
  const { addNotification } = useGlobalStore()
  
  const createDevice = useMutation({
    mutationFn: deviceService.createDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      addNotification({
        type: 'success',
        title: '创建成功',
        message: '设备已成功创建',
      })
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: '创建失败',
        message: error.message,
      })
    },
  })
  
  const updateDevice = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Device> }) =>
      deviceService.updateDevice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      queryClient.invalidateQueries({ queryKey: ['device'] })
      addNotification({
        type: 'success',
        title: '更新成功',
        message: '设备信息已更新',
      })
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: '更新失败',
        message: error.message,
      })
    },
  })
  
  const deleteDevice = useMutation({
    mutationFn: deviceService.deleteDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      addNotification({
        type: 'success',
        title: '删除成功',
        message: '设备已删除',
      })
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: '删除失败',
        message: error.message,
      })
    },
  })
  
  return {
    createDevice,
    updateDevice,
    deleteDevice,
  }
}