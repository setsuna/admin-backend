import { useEffect } from 'react'
import { wsService } from '@/services/websocket'
import { useApp } from '@/store'

// 设备实时状态hook
export function useDeviceStatus() {
  const { updateDeviceStatus, updateDeviceStats } = useApp()
  
  useEffect(() => {
    const unsubscribeStatus = wsService.on('device_status', (data: any) => {
      updateDeviceStatus(data.deviceId, data.status)
    })
    
    const unsubscribeStats = wsService.on('device_stats', (data: any) => {
      updateDeviceStats(data)
    })
    
    return () => {
      unsubscribeStatus()
      unsubscribeStats()
    }
  }, [updateDeviceStatus, updateDeviceStats])
}