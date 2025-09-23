import type { StateCreator } from 'zustand'
import type { UISlice, GlobalStore } from '../types'
import type { Notification } from '@/types'

export const createUISlice: StateCreator<
  GlobalStore,
  [],
  [],
  UISlice
> = (set, get) => ({
  // 主题
  theme: 'system',
  setTheme: (theme) => set({ theme }),
  
  // 侧边栏状态
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  // 通知系统
  notifications: [],
  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(2)
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
    }
    
    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }))
    
    // 自动移除通知
    if (notification.duration !== 0) {
      setTimeout(() => {
        get().removeNotification(id)
      }, notification.duration || 5000)
    }
  },
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  clearNotifications: () => set({ notifications: [] }),
  
  // 全局加载状态
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
})
