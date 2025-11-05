import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createAuthSlice } from './slices/auth.slice'
import { createUISlice } from './slices/ui.slice'
import { createAppSlice } from './slices/app.slice'
import type { GlobalStore, PersistedState } from './types'

// 创建全局store
export const useStore = create<GlobalStore>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createUISlice(...a),
      ...createAppSlice(...a),
    }),
    {
      name: 'admin-global-store',
      partialize: (state): PersistedState => ({
        auth: {
          user: state.user,
        },
        ui: {
          theme: state.theme,
        },
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as PersistedState
        return {
          ...currentState,
          // 恢复认证状态
          user: persisted.auth?.user || currentState.user,
          // 恢复UI状态
          theme: persisted.ui?.theme || currentState.theme,
        }
      },
    }
  )
)

// 状态选择器hooks - 优化性能，避免不必要的重渲染
export const useAuth = () => useStore((state) => ({
  user: state.user,
  permissions: state.permissions,
  menuConfig: state.menuConfig,
  authError: state.authError,
  setUser: state.setUser,
  setPermissions: state.setPermissions,
  setMenuConfig: state.setMenuConfig,
  hasPermission: state.hasPermission,
  hasAnyPermission: state.hasAnyPermission,
  clearAuth: state.clearAuth,
  showAuthError: state.showAuthError,
  hideAuthError: state.hideAuthError,
  showAuthManagement: state.showAuthManagement,
}))

export const useUI = () => useStore((state) => ({
  theme: state.theme,
  notifications: state.notifications,
  notificationHistory: state.notificationHistory,
  unreadCount: state.unreadCount,
  globalLoading: state.globalLoading,
  soundEnabled: state.soundEnabled,
  soundVolume: state.soundVolume,
  setTheme: state.setTheme,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
  markNotificationAsRead: state.markNotificationAsRead,
  markAllAsRead: state.markAllAsRead,
  clearNotificationHistory: state.clearNotificationHistory,
  setGlobalLoading: state.setGlobalLoading,
  setSoundEnabled: state.setSoundEnabled,
  setSoundVolume: state.setSoundVolume,
  toggleSound: state.toggleSound,
}))

export const useApp = () => useStore((state) => ({
  devices: state.devices,
  deviceStats: state.deviceStats,
  appConfig: state.appConfig,
  updateDeviceStatus: state.updateDeviceStatus,
  updateDeviceStats: state.updateDeviceStats,
  updateAppConfig: state.updateAppConfig,
}))

// 兼容性导出 - 保持向后兼容
export const useGlobalStore = useStore
export const usePermissionStore = () => {
  const auth = useAuth()
  return {
    permissions: auth.permissions,
    menuConfig: auth.menuConfig,
    setPermissions: auth.setPermissions,
    setMenuConfig: auth.setMenuConfig,
    hasPermission: auth.hasPermission,
    hasAnyPermission: auth.hasAnyPermission,
    clearPermissions: auth.clearAuth,
  }
}
export const useDeviceStore = useApp

// 导出类型
export type * from './types'
