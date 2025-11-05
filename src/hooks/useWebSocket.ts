import { useEffect, useRef } from 'react'
import { wsService } from '@/services/core/websocket.service'
import { soundManager } from '@/utils/sound'
import { useAuth, useUI, useApp } from '@/store'
import type { 
  WSMessage, 
  DeviceOnlineData, 
  DeviceOfflineData, 
  SystemNotifyData 
} from '@/types/common/websocket.types'

/**
 * WebSocket Hook
 * 管理 WebSocket 连接，处理各种消息类型
 */
export function useWebSocket() {
  const { user } = useAuth()
  const { addNotification } = useUI()
  const { updateDeviceStatus } = useApp()
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    // 确保只初始化一次
    if (hasInitializedRef.current) return
    
    const token = localStorage.getItem('access_token')
    if (!token || !user) {
      console.log('No token or user, skipping WebSocket connection')
      return
    }

    console.log('Initializing WebSocket connection')
    hasInitializedRef.current = true

    // 初始化音频
    soundManager.initialize()

    // 连接 WebSocket
    wsService.connect(token)

    // 订阅设备上线消息
    const unsubscribeOnline = wsService.on('device_online', (message: WSMessage<DeviceOnlineData>) => {
      console.log('Device online:', message.data)
      
      // 播放音效
      soundManager.play('online')
      
      // 显示通知
      addNotification({
        type: 'success',
        title: '设备上线',
        message: `设备 ${message.data.serialNumber} 已上线`,
        duration: 5000,
      })

      // 更新设备状态
      updateDeviceStatus(message.data.serialNumber, 'online')
    })

    // 订阅设备下线消息
    const unsubscribeOffline = wsService.on('device_offline', (message: WSMessage<DeviceOfflineData>) => {
      console.log('Device offline:', message.data)
      
      // 播放音效
      soundManager.play('offline')
      
      // 显示通知
      addNotification({
        type: 'warning',
        title: '设备下线',
        message: `设备 ${message.data.serialNumber} 已下线`,
        duration: 5000,
      })

      // 更新设备状态
      updateDeviceStatus(message.data.serialNumber, 'offline')
    })

    // 订阅系统通知消息
    const unsubscribeNotify = wsService.on('system_notify', (message: WSMessage<SystemNotifyData>) => {
      console.log('System notify:', message.data)
      
      // 播放音效
      soundManager.play('notify')
      
      // 显示通知
      const notificationType = message.data.level === 'error' ? 'error' 
        : message.data.level === 'warning' ? 'warning' 
        : 'info'
      
      addNotification({
        type: notificationType,
        title: message.data.title,
        message: message.data.content,
        duration: 5000,
      })
    })

    // 订阅心跳消息（可选：用于调试）
    const unsubscribeHeartbeat = wsService.on('heartbeat', () => {
      // console.log('Heartbeat received')
    })

    // 清理函数
    return () => {
      console.log('Cleaning up WebSocket connection')
      unsubscribeOnline()
      unsubscribeOffline()
      unsubscribeNotify()
      unsubscribeHeartbeat()
      wsService.disconnect()
      hasInitializedRef.current = false
    }
  }, [user, addNotification, updateDeviceStatus])

  return {
    connectionState: wsService.getConnectionState(),
  }
}
