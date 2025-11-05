import type { StateCreator } from 'zustand'
import type { UISlice, GlobalStore } from '../types'
import type { Notification } from '@/types'

// 🆕 掩展通知类型以支持新功能
interface ExtendedNotification extends Notification {
  actions?: Array<{
    label: string
    action: () => void
    type?: 'primary' | 'secondary'
  }>
  persistent?: boolean  // 是否持久显示(不自动消失)
  category?: 'api' | 'validation' | 'network' | 'system' | 'business'
}

export const createUISlice: StateCreator<
  GlobalStore,
  [],
  [],
  UISlice
> = (set, get) => ({
  // 主题
  theme: 'system',
  setTheme: (theme) => set({ theme }),
  
  // 🔊 音效系统
  soundEnabled: true,
  soundVolume: 0.8,  // 调大音量到 0.8
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  setSoundVolume: (volume) => set({ soundVolume: Math.max(0, Math.min(1, volume)) }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  
  // 🔄 更新：增强的通知系统
  notifications: [],
  addNotification: (notification) => {
    const notificationId = Math.random().toString(36).substring(2)
    const newNotification: ExtendedNotification = {
      ...notification,
      id: notificationId,
      timestamp: Date.now(),
    }
    
    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }))
    
    // 🆕 自动移除通知 - 支持持久显示
    if (!newNotification.persistent && notification.duration !== 0) {
      setTimeout(() => {
        get().removeNotification(notificationId)
      }, notification.duration || 5000)
    }
  },
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  clearNotifications: () => set({ notifications: [] }),
  
  // 🆕 新增：按类型清除通知
  clearNotificationsByType: (type: string) => set((state) => ({
    notifications: state.notifications.filter(n => (n as ExtendedNotification).category !== type)
  })),
  
  // 全局加载状态
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
})

