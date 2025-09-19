import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme, User, Notification, MenuConfig, AuthErrorDialogData } from '@/types'
import { getCurrentDeviceFingerprint } from '@/utils/auth'

// 全局状态
interface GlobalState {
  // 主题
  theme: Theme
  setTheme: (theme: Theme) => void
  
  // 用户信息
  user: User | null
  setUser: (user: User | null) => void
  
  // 侧边栏折叠状态
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  
  // 通知
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // 加载状态
  globalLoading: boolean
  setGlobalLoading: (loading: boolean) => void
  
  // 授权错误弹窗
  authError: {
    visible: boolean
    data: AuthErrorDialogData | null
  }
  showAuthError: (data: AuthErrorDialogData) => void
  hideAuthError: () => void
  showAuthManagement: () => void
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set, get) => ({
      // 主题
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      
      // 用户信息
      user: null,
      setUser: (user) => set({ user }),
      
      // 侧边栏折叠状态
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      // 通知
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
      
      // 授权错误弹窗
      authError: {
        visible: false,
        data: null,
      },
      showAuthError: (data) => set({ authError: { visible: true, data } }),
      hideAuthError: () => set({ authError: { visible: false, data: null } }),
      showAuthManagement: () => {
        const currentFingerprint = getCurrentDeviceFingerprint()
        set({ 
          authError: { 
            visible: true, 
            data: {
              message: '授权信息管理',
              deviceFingerprint: currentFingerprint,
              mode: 'info',
              allowClose: true,
              showCurrentStatus: true
            }
          } 
        })
      },
    }),
    {
      name: 'admin-global-store',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        user: state.user,
      }),
    }
  )
)

// 设备状态store
interface DeviceState {
  devices: Record<string, any>
  deviceStats: any
  updateDeviceStatus: (deviceId: string, status: any) => void
  updateDeviceStats: (stats: any) => void
}

export const useDeviceStore = create<DeviceState>()((set) => ({
  devices: {},
  deviceStats: null,
  updateDeviceStatus: (deviceId, status) => set((state) => ({
    devices: {
      ...state.devices,
      [deviceId]: { ...state.devices[deviceId], ...status }
    }
  })),
  updateDeviceStats: (stats) => set({ deviceStats: stats }),
}))

// 权限状态store
interface PermissionState {
  permissions: string[]
  menuConfig: MenuConfig | null
  setPermissions: (permissions: string[]) => void
  setMenuConfig: (config: MenuConfig) => void
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  clearPermissions: () => void
}

export const usePermissionStore = create<PermissionState>()((set, get) => ({
  permissions: [],
  menuConfig: null,
  setPermissions: (permissions) => set({ permissions }),
  setMenuConfig: (config) => set({ menuConfig: config }),
  hasPermission: (permission) => {
    const { permissions } = get()
    return permissions.includes(permission)
  },
  hasAnyPermission: (permissions) => {
    const { permissions: userPermissions } = get()
    return permissions.some(p => userPermissions.includes(p))
  },
  clearPermissions: () => set({ permissions: [], menuConfig: null }),
}))
