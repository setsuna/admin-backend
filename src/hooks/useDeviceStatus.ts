import { useWSSubscription } from '@/services/websocket'
import { useStore } from '@/store'

/**
 * 设备实时状态 Hook
 * 
 * 订阅设备状态和统计信息的实时更新
 */
export function useDeviceStatus() {
  // ✅ 只订阅方法，不订阅状态
  const updateDeviceStatus = useStore((state) => state.updateDeviceStatus)
  const updateDeviceStats = useStore((state) => state.updateDeviceStats)
  
  // 订阅设备状态消息
  useWSSubscription('device_status' as any, (message: any) => {
    updateDeviceStatus(message.data.deviceId, message.data.status)
  }, [updateDeviceStatus])
  
  // 订阅设备统计消息
  useWSSubscription('device_stats' as any, (message: any) => {
    updateDeviceStats(message.data)
  }, [updateDeviceStats])
}