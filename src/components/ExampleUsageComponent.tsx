import React from 'react'
import { useAuth, useUI, usePermission, useNotifications } from '@/hooks'

/**
 * 示例：如何在组件中使用重构后的状态管理
 * 展示了新架构下的最佳实践
 */
export const ExampleUsageComponent: React.FC = () => {
  // 1. 使用细粒度的状态选择器，避免不必要的重渲染
  const { user } = useAuth() // 只订阅认证相关状态
  const { theme, setTheme, notifications } = useUI() // 只订阅UI相关状态
  
  // 2. 使用业务逻辑hooks，封装复杂逻辑
  const { hasPermission, permissions } = usePermission()
  const { showSuccess, showError } = useNotifications()
  
  // 3. 组件本地状态，不需要全局管理
  const [_localFormData, _setLocalFormData] = React.useState({})
  
  const handleAction = () => {
    if (hasPermission('user:manage')) {
      // 执行需要权限的操作
      showSuccess('操作成功', '权限验证通过')
    } else {
      showError('权限不足', '您没有执行此操作的权限')
    }
  }
  
  return (
    <div>
      <h3>新状态管理架构使用示例</h3>
      <p>当前用户: {user?.username}</p>
      <p>当前主题: {theme}</p>
      <p>权限列表: {permissions.join(', ')}</p>
      <p>通知数量: {notifications.length}</p>
      
      <button onClick={handleAction}>
        测试权限检查
      </button>
      
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        切换主题
      </button>
    </div>
  )
}

// 导出使用指南作为注释
/**
 * 新状态管理使用指南:
 * 
 * 1. 状态选择器使用:
 *    - useAuth() - 认证、用户信息、权限
 *    - useUI() - 主题、侧边栏、通知、全局加载
 *    - useApp() - 设备状态、应用配置
 * 
 * 2. 业务hooks使用:
 *    - usePermission() - 权限检查
 *    - useNotifications() - 通知管理
 *    - useTheme() - 主题管理
 * 
 * 3. 数据获取hooks:
 *    - useUser() - 用户管理 (TanStack Query)
 *    - useDevice() - 设备管理 (TanStack Query)
 * 
 * 4. 组件本地状态:
 *    - 表单数据、筛选条件、选择状态等使用useState
 *    - 不要将临时状态放入全局store
 * 
 * 5. 性能优化:
 *    - 使用细粒度的状态选择器
 *    - 避免在组件中订阅整个store
 *    - 利用TanStack Query的缓存机制
 */
