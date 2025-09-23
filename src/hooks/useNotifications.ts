import { useGlobalStore } from '@/store'

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