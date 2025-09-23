// 导出所有hooks
export { usePermission, useMenuPermission, useRoutePermission } from './usePermission'
export { useTheme } from './useTheme'
export { useNotifications } from './useNotifications'
export { useUser } from './useUser'
export { useDevices, useDevice, useDeviceStats, useDeviceOperations, useDeviceMonitor } from './useDevice'
export { useModal, useDialog } from './useModal'

// 从store导出状态选择器hooks
export { useAuth, useUI, useApp } from '@/store'

// 重新导出其他hooks（保持现有导入路径兼容）
export { default as useDepartment } from './useDepartment'
export { default as useDeviceStatus } from './useDeviceStatus'  
export { default as useMeeting } from './useMeeting'
export { default as useRole } from './useRole'
export { default as usePolicy } from './usePolicy'
export { default as useConfig } from './useConfig'
export { default as useWebSocket } from './useWebSocket'
