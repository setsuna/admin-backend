import type { WSMessage, DeviceOnlineData, DeviceOfflineData } from '../types'
import { soundManager } from '@/utils/sound'

/**
 * 设备消息处理器
 * 
 * 职责：
 * - 处理设备上线/下线消息
 * - 播放相应音效
 * - 通知应用状态更新
 */
export class DeviceMessageHandler {
  private onDeviceStatusChange?: (serialNumber: string, status: 'online' | 'offline') => void
  private onNotification?: (notification: any) => void

  /**
   * 设置回调函数
   */
  setCallbacks(callbacks: {
    onDeviceStatusChange?: (serialNumber: string, status: 'online' | 'offline') => void
    onNotification?: (notification: any) => void
  }) {
    this.onDeviceStatusChange = callbacks.onDeviceStatusChange
    this.onNotification = callbacks.onNotification
  }

  /**
   * 处理设备上线消息
   */
  handleDeviceOnline(message: WSMessage<DeviceOnlineData>): void {
    console.log('[Handler] Device online:', message.data)
    
    // 播放音效
    soundManager.play('online')
    
    // 发送通知
    this.onNotification?.({
      type: 'success',
      title: '设备上线',
      message: `设备 ${message.data.serialNumber} 已上线`,
      duration: 5000,
    })

    // 更新设备状态
    this.onDeviceStatusChange?.(message.data.serialNumber, 'online')
  }

  /**
   * 处理设备下线消息
   */
  handleDeviceOffline(message: WSMessage<DeviceOfflineData>): void {
    console.log('[Handler] Device offline:', message.data)
    
    // 播放音效
    soundManager.play('offline')
    
    // 发送通知
    this.onNotification?.({
      type: 'warning',
      title: '设备下线',
      message: `设备 ${message.data.serialNumber} 已下线`,
      duration: 5000,
    })

    // 更新设备状态
    this.onDeviceStatusChange?.(message.data.serialNumber, 'offline')
  }
}

// 导出单例
export const deviceHandler = new DeviceMessageHandler()
