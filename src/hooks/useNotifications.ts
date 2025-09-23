import { useUI } from '@/store'

/**
 * 通知管理Hook
 * 提供通知的添加、移除和清理功能
 */
export function useNotifications() {
  const { 
    notifications, 
    addNotification, 
    removeNotification, 
    clearNotifications 
  } = useUI()
  
  // 便捷方法
  const showSuccess = (title: string, message?: string) => {
    addNotification({ type: 'success', title, message })
  }
  
  const showError = (title: string, message?: string) => {
    addNotification({ type: 'error', title, message })
  }
  
  const showWarning = (title: string, message?: string) => {
    addNotification({ type: 'warning', title, message })
  }
  
  const showInfo = (title: string, message?: string) => {
    addNotification({ type: 'info', title, message })
  }
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    // 便捷方法
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}
