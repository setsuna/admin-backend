import { useEffect } from 'react'
import { wsService } from '@/services/websocket'
import { useDeviceStore } from '@/store'

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