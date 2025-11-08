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
> = (set) => ({
  // 主题
  theme: 'system',
  setTheme: (theme) => set({ theme }),
  
  // 🔊 音效系统
  soundEnabled: true,
  soundVolume: 0.8,  // 调大音量到 0.8
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  setSoundVolume: (volume) => set({ soundVolume: Math.max(0, Math.min(1, volume)) }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  
  // 🔄 Toast通知系统（自动消失）
  notifications: [],
  
  // 📜 通知历史（持久保存）
  notificationHistory: [],
  unreadCount: 0,
  
  addNotification: (notification, showInHistory = false) => {
    const notificationId = Math.random().toString(36).substring(2)
    const newNotification: ExtendedNotification = {
      ...notification,
      id: notificationId,
      timestamp: Date.now(),
      read: false,
    }
    
    // 添加到 Toast 列表（用于显示）
    set((state) => {
      const updates: any = {
        notifications: [...state.notifications, newNotification],
      }
      
      // 只有 showInHistory=true 时才加入历史（用于Socket消息等重要通知）
      if (showInHistory) {
        updates.notificationHistory = [...state.notificationHistory, newNotification]
        updates.unreadCount = state.unreadCount + 1
      }
      
      return updates
    })
    
    // Toast 自动消失
    if (!newNotification.persistent && notification.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== notificationId)
        }))
      }, notification.duration || 5000)
    }
  },
  
  // Toast 清空
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  clearNotifications: () => set({ notifications: [] }),
  
  // 通知历史管理
  markNotificationAsRead: (id) => set((state) => {
    const notification = state.notificationHistory.find(n => n.id === id)
    if (notification && !notification.read) {
      return {
        notificationHistory: state.notificationHistory.map(n => 
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }
    }
    return state
  }),
  
  markAllAsRead: () => set((state) => ({
    notificationHistory: state.notificationHistory.map(n => ({ ...n, read: true })),
    unreadCount: 0
  })),
  
  clearNotificationHistory: () => set({ 
    notificationHistory: [], 
    unreadCount: 0 
  }),
  
  // 🆕 新增：按类型清除通知
  clearNotificationsByType: (type: string) => set((state) => ({
    notificationHistory: state.notificationHistory.filter(n => (n as ExtendedNotification).category !== type)
  })),
  
  // 全局加载状态
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
})

