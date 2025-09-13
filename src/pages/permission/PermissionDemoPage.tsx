/**
 * 权限演示页面
 * 展示各种权限验证组件的使用方法
 */

import { useState } from 'react'
import { Card, Button } from '@/components/ui'
import { 
  PermissionCheck, 
  PermissionButton, 
  PermissionField,
  usePermissionState,
  useBatchPermissionCheck
} from '@/components/PermissionCheck'
import { useGlobalStore } from '@/store'

export default function PermissionDemoPage() {
  const { user, addNotification } = useGlobalStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ''
  })

  // 使用权限状态钩子
  const userPermissionState = usePermissionState(['personnel:read', 'personnel:write', 'personnel:delete'])
  const systemPermissionState = usePermissionState(['system:dict:read', 'system:dict:manage'])

  // 批量权限检查
  const permissions = useBatchPermissionCheck({
    canReadUsers: ['personnel:read'],
    canWriteUsers: ['personnel:write'],
    canDeleteUsers: ['personnel:delete'],
    canManageRoles: ['role:manage'],
    canViewMeetings: ['meeting:read'],
    canManageMeetings: ['meeting:manage'],
    canViewSystem: ['system:dict:read'],
    canManageSystem: ['system:dict:manage']
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addNotification({
      type: 'success',
      title: '表单提交成功',
      message: '这只是一个演示'
    })
  }

  const handleDelete = () => {
    addNotification({
      type: 'warning',
      title: '删除操作',
      message: '这只是一个演示，未真正删除'
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold">权限验证演示</h1>
        <p className="text-muted-foreground mt-1">
          当前用户：{user?.username} ({user?.role})
        </p>
      </div>

      {/* 基础权限检查 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">基础权限检查</h2>
        <div className="space-y-4">
          <PermissionCheck permissions={['personnel:read']}>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              ✅ 您有人员查看权限，可以看到这个内容
            </div>
          </PermissionCheck>

          <PermissionCheck 
            permissions={['personnel:write']}
            fallback={
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                ❌ 您没有人员编辑权限，看到的是降级内容
              </div>
            }
          >
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              ✅ 您有人员编辑权限，可以看到这个内容
            </div>
          </PermissionCheck>

          <PermissionCheck 
            permissions={['personnel:read', 'personnel:write']} 
            requireAll={true}
            fallback={
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                ⚠️ 您缺少某些权限（需要同时拥有读取和编辑权限）
              </div>
            }
          >
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              ✅ 您同时拥有人员读取和编辑权限
            </div>
          </PermissionCheck>
        </div>
      </Card>

      {/* 权限按钮示例 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">权限按钮示例</h2>
        <div className="flex gap-4 flex-wrap">
          <PermissionButton
            permissions={['personnel:read']}
            onClick={() => addNotification({ type: 'info', title: '查看操作' })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            查看人员
          </PermissionButton>

          <PermissionButton
            permissions={['personnel:write']}
            onClick={() => addNotification({ type: 'info', title: '编辑操作' })}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            编辑人员
          </PermissionButton>

          <PermissionButton
            permissions={['personnel:delete']}
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            删除人员
          </PermissionButton>

          <PermissionButton
            permissions={['role:manage']}
            onClick={() => addNotification({ type: 'info', title: '角色管理操作' })}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            管理角色
          </PermissionButton>
        </div>
      </Card>

      {/* 表单字段权限示例 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">表单字段权限示例</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <PermissionField 
            readOnlyPermissions={['personnel:read']}
            writePermissions={['personnel:write']}
            readOnlyFallback={
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                姓名：{formData.name || '(无权限查看)'}
              </div>
            }
          >
            <div>
              <label className="block text-sm font-medium mb-1">姓名</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="请输入姓名"
              />
            </div>
          </PermissionField>

          <PermissionField 
            readOnlyPermissions={['personnel:read']}
            writePermissions={['personnel:write']}
            readOnlyFallback={
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                邮箱：{formData.email || '(无权限查看)'}
              </div>
            }
          >
            <div>
              <label className="block text-sm font-medium mb-1">邮箱</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="请输入邮箱"
              />
            </div>
          </PermissionField>

          <PermissionField 
            readOnlyPermissions={['role:read']}
            writePermissions={['role:manage']}
            readOnlyFallback={
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                角色：{formData.role || '(无权限查看)'}
              </div>
            }
          >
            <div>
              <label className="block text-sm font-medium mb-1">角色</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">请选择角色</option>
                <option value="admin">管理员</option>
                <option value="user">普通用户</option>
                <option value="auditor">审计员</option>
              </select>
            </div>
          </PermissionField>

          <PermissionCheck permissions={['personnel:write']}>
            <Button type="submit">提交表单</Button>
          </PermissionCheck>
        </form>
      </Card>

      {/* 权限状态钩子示例 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">权限状态钩子示例</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">人员权限状态</h3>
            <div className="space-y-2 text-sm">
              <div className={`flex items-center gap-2 ${userPermissionState.canRead ? 'text-green-600' : 'text-red-600'}`}>
                <span>{userPermissionState.canRead ? '✅' : '❌'}</span>
                可读取: {userPermissionState.canRead.toString()}
              </div>
              <div className={`flex items-center gap-2 ${userPermissionState.canWrite ? 'text-green-600' : 'text-red-600'}`}>
                <span>{userPermissionState.canWrite ? '✅' : '❌'}</span>
                可写入: {userPermissionState.canWrite.toString()}
              </div>
              <div className={`flex items-center gap-2 ${userPermissionState.canDelete ? 'text-green-600' : 'text-red-600'}`}>
                <span>{userPermissionState.canDelete ? '✅' : '❌'}</span>
                可删除: {userPermissionState.canDelete.toString()}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">系统权限状态</h3>
            <div className="space-y-2 text-sm">
              <div className={`flex items-center gap-2 ${systemPermissionState.canRead ? 'text-green-600' : 'text-red-600'}`}>
                <span>{systemPermissionState.canRead ? '✅' : '❌'}</span>
                可读取: {systemPermissionState.canRead.toString()}
              </div>
              <div className={`flex items-center gap-2 ${systemPermissionState.canWrite ? 'text-green-600' : 'text-red-600'}`}>
                <span>{systemPermissionState.canWrite ? '✅' : '❌'}</span>
                可管理: {systemPermissionState.canWrite.toString()}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 批量权限检查示例 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">批量权限检查示例</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(permissions).map(([key, hasPermission]) => (
            <div 
              key={key}
              className={`p-3 rounded-lg border ${
                hasPermission 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{hasPermission ? '✅' : '❌'}</span>
                <span className="text-sm font-medium">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 动态权限检查示例 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">动态权限检查示例</h2>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            根据当前用户的权限动态显示不同的操作按钮
          </p>
          
          <div className="flex gap-4 flex-wrap">
            {permissions.canReadUsers && (
              <Button 
                variant="outline"
                onClick={() => addNotification({ type: 'info', title: '用户列表', message: '显示用户列表' })}
              >
                查看用户列表
              </Button>
            )}
            
            {permissions.canWriteUsers && (
              <Button 
                onClick={() => addNotification({ type: 'info', title: '用户编辑', message: '打开用户编辑表单' })}
              >
                编辑用户
              </Button>
            )}
            
            {permissions.canDeleteUsers && (
              <Button 
                variant="outline"
                onClick={() => addNotification({ type: 'warning', title: '用户删除', message: '确认删除用户' })}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                删除用户
              </Button>
            )}
            
            {permissions.canManageRoles && (
              <Button 
                onClick={() => addNotification({ type: 'info', title: '角色管理', message: '打开角色管理页面' })}
                className="bg-purple-600 hover:bg-purple-700"
              >
                管理角色
              </Button>
            )}
          </div>
          
          {!permissions.canReadUsers && !permissions.canWriteUsers && !permissions.canDeleteUsers && !permissions.canManageRoles && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center text-muted-foreground">
              您当前没有任何用户管理权限
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
