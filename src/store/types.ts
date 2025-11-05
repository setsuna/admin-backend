import type { Theme, User, Notification, MenuConfig, AuthErrorDialogData } from '@/types'

// 认证状态切片
export interface AuthSlice {
  // 用户信息
  user: User | null
  setUser: (user: User | null) => void
  
  // 权限管理
  permissions: string[]
  menuConfig: MenuConfig | null
  setPermissions: (permissions: string[]) => void
  setMenuConfig: (config: MenuConfig) => void
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  clearAuth: () => void
  
  // 授权错误处理
  authError: {
    visible: boolean
    data: AuthErrorDialogData | null
  }
  showAuthError: (data: AuthErrorDialogData) => void
  hideAuthError: () => void
  showAuthManagement: () => void
}

// UI状态切片
export interface UISlice {
  // 主题
  theme: Theme
  setTheme: (theme: Theme) => void
  
  // Toast 通知系统（自动消失的提示框）
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // 通知历史（持久保存的通知面板）
  notificationHistory: Notification[]
  unreadCount: number
  markNotificationAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotificationHistory: () => void
  clearNotificationsByType?: (type: string) => void  // 🆕 添加按类型清除方法
  
  // 音效系统
  soundEnabled: boolean
  soundVolume: number
  setSoundEnabled: (enabled: boolean) => void
  setSoundVolume: (volume: number) => void
  toggleSound: () => void
  
  // 全局加载状态
  globalLoading: boolean
  setGlobalLoading: (loading: boolean) => void
}

// 应用状态切片
export interface AppSlice {
  // 设备状态
  devices: Record<string, any>
  deviceStats: any
  updateDeviceStatus: (deviceId: string, status: any) => void
  updateDeviceStats: (stats: any) => void
  
  // 应用配置
  appConfig: {
    version: string
    environment: 'development' | 'production'
    features: Record<string, boolean>
  }
  updateAppConfig: (config: Partial<AppSlice['appConfig']>) => void
}

// 全局Store类型
export interface GlobalStore extends AuthSlice, UISlice, AppSlice {}

// 持久化状态类型
export interface PersistedState {
  auth: {
    user: User | null
  }
  ui: {
    theme: Theme
  }
}
