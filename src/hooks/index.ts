export * from './usePermission'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wsService } from '@/services/websocket'
import { deviceService } from '@/services/device'
import { configService } from '@/services/config'
import { useGlobalStore, useDeviceStore } from '@/store'
import type { Device, ConfigItem, PaginationParams } from '@/types'

// WebSocket连接hook
export function useWebSocket() {
  const [connected, setConnected] = useState(false)
  
  useEffect(() => {
    wsService.connect()
      .then(() => setConnected(true))
      .catch(console.error)
    
    return () => {
      wsService.disconnect()
      setConnected(false)
    }
  }, [])
  
  return { connected }
}

// 设备实时状态hook
export function useDeviceStatus() {
  const updateDeviceStatus = useDeviceStore(state => state.updateDeviceStatus)
  const updateDeviceStats = useDeviceStore(state => state.updateDeviceStats)
  
  useEffect(() => {
    const unsubscribeStatus = wsService.on('device_status', (data) => {
      updateDeviceStatus(data.deviceId, data.status)
    })
    
    const unsubscribeStats = wsService.on('device_stats', (data) => {
      updateDeviceStats(data)
    })
    
    return () => {
      unsubscribeStatus()
      unsubscribeStats()
    }
  }, [updateDeviceStatus, updateDeviceStats])
}

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

// 配置列表hook
export function useConfigs(params?: PaginationParams & { search?: string; type?: string }) {
  return useQuery({
    queryKey: ['configs', params],
    queryFn: () => configService.getConfigs(params),
  })
}

// 配置详情hook
export function useConfig(id: string) {
  return useQuery({
    queryKey: ['config', id],
    queryFn: () => configService.getConfig(id),
    enabled: !!id,
  })
}

// 配置操作hooks
export function useConfigOperations() {
  const queryClient = useQueryClient()
  const { addNotification } = useGlobalStore()
  
  const createConfig = useMutation({
    mutationFn: configService.createConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configs'] })
      addNotification({
        type: 'success',
        title: '创建成功',
        message: '配置已成功创建',
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
  
  const updateConfig = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ConfigItem> }) =>
      configService.updateConfig(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configs'] })
      queryClient.invalidateQueries({ queryKey: ['config'] })
      addNotification({
        type: 'success',
        title: '更新成功',
        message: '配置已更新',
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
  
  const deleteConfig = useMutation({
    mutationFn: configService.deleteConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configs'] })
      addNotification({
        type: 'success',
        title: '删除成功',
        message: '配置已删除',
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
    createConfig,
    updateConfig,
    deleteConfig,
  }
}

// 主题切换hook
export function useTheme() {
  const { theme, setTheme } = useGlobalStore()
  
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark', 'gov-red')
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])
  
  return { theme, setTheme }
}

// 通知hook
export function useNotifications() {
  const { notifications, addNotification, removeNotification, clearNotifications } = useGlobalStore()
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  }
}
