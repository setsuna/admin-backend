import { useEffect, useRef } from 'react'
import { wsClient } from '../client'
import { soundManager } from '@/utils/sound'
import { useStore } from '@/store'
import { deviceHandler, notificationHandler, meetingHandler } from '../handlers'

/**
 * WebSocket 连接管理 Hook
 * 
 * 职责：
 * - 管理 WebSocket 连接生命周期
 * - 注册全局消息处理器
 * - 初始化音效系统
 * 
 * 使用场景：
 * - 在顶层组件（如 App.tsx 或 Layout）中使用一次
 * - 确保全局只有一个连接
 * 
 * @example
 * ```tsx
 * function App() {
 *   useWSConnection()
 *   return <Router />
 * }
 * ```
 */
export function useWSConnection() {
  // ✅ 使用 ref 存储回调函数，避免依赖变化
  const userRef = useRef(useStore.getState().user)
  const addNotificationRef = useRef(useStore.getState().addNotification)
  const updateDeviceStatusRef = useRef(useStore.getState().updateDeviceStatus)
  
  // 同步最新的回调函数
  useEffect(() => {
    userRef.current = useStore.getState().user
    addNotificationRef.current = useStore.getState().addNotification
    updateDeviceStatusRef.current = useStore.getState().updateDeviceStatus
  })
  
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    // 确保只初始化一次
    if (hasInitializedRef.current) return
    
    const token = localStorage.getItem('access_token')
    if (!token || !userRef.current) {
      console.log('[WS] No token or user, skipping connection')
      return
    }

    console.log('[WS] Initializing connection...')
    hasInitializedRef.current = true

    // 初始化音频
    soundManager.initialize()

    // 配置处理器回调 - 使用 ref 避免闭包问题
    deviceHandler.setCallbacks({
      onDeviceStatusChange: (serialNumber, status) => {
        updateDeviceStatusRef.current(serialNumber, status)
      },
      onNotification: (notification) => {
        addNotificationRef.current(notification)
      }
    })

    notificationHandler.setCallbacks({
      onNotification: (notification) => {
        addNotificationRef.current(notification)
      }
    })

    meetingHandler.setCallbacks({
      onMeetingUpdate: (action, meetingId) => {
        console.log(`[WS] Meeting ${action}:`, meetingId)
        // 这里可以触发会议列表刷新等操作
      }
    })

    // 注册消息处理器
    const unsubscribeDeviceOnline = wsClient.on('device_online', deviceHandler.handleDeviceOnline.bind(deviceHandler))
    const unsubscribeDeviceOffline = wsClient.on('device_offline', deviceHandler.handleDeviceOffline.bind(deviceHandler))
    const unsubscribeSystemNotify = wsClient.on('system_notify', notificationHandler.handleSystemNotify.bind(notificationHandler))
    const unsubscribeMeetingCreate = wsClient.on('meeting_create', meetingHandler.handleMeetingCreate.bind(meetingHandler))
    const unsubscribeMeetingUpdate = wsClient.on('meeting_update', meetingHandler.handleMeetingUpdate.bind(meetingHandler))
    const unsubscribeMeetingDelete = wsClient.on('meeting_delete', meetingHandler.handleMeetingDelete.bind(meetingHandler))

    // 连接 WebSocket
    wsClient.connect(token)

    // 清理函数
    return () => {
      console.log('[WS] Cleaning up connection')
      unsubscribeDeviceOnline()
      unsubscribeDeviceOffline()
      unsubscribeSystemNotify()
      unsubscribeMeetingCreate()
      unsubscribeMeetingUpdate()
      unsubscribeMeetingDelete()
      wsClient.disconnect()
      hasInitializedRef.current = false
    }
  }, [])  // ✅ 移除所有依赖，只初始化一次

  return {
    connectionState: wsClient.getConnectionState(),
  }
}
