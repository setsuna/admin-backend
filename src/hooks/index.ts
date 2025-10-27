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
export { useDepartment } from './useDepartment'
export { useDeviceStatus } from './useDeviceStatus'
export { useRole, useRoleOptions, useRoleDisplayName } from './useRole'
export { usePolicy } from './usePolicy'
export { useConfig } from './useConfig'
export { useWebSocket } from './useWebSocket'
