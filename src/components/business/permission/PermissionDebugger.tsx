/**
 * 权限调试组件
 * 开发环境下显示当前用户权限信息，方便调试
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { usePermission } from '@/hooks/usePermission'
import { useGlobalStore } from '@/store'
import { permissionApi } from '@/services/permission'
import { Card, Button } from '@/components/ui'
import { isDevelopment } from '@/config'

export function PermissionDebugger() {
  const { user } = useGlobalStore()
  const { permissions, menuConfig, isLoading } = usePermission()
  const [isExpanded, setIsExpanded] = useState(false)

  // 获取所有权限和角色信息
  const { data: allPermissions = [] } = useQuery({
    queryKey: ['allPermissions'],
    queryFn: () => permissionApi.getAllPermissions(),
    enabled: isExpanded
  })

  const { data: allRoles = [] } = useQuery({
    queryKey: ['allRoles'],
    queryFn: () => permissionApi.getAllRoles(),
    enabled: isExpanded
  })

  // 如果不是开发环境，不显示
  if (!isDevelopment()) {
    return null
  }

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="p-3 bg-orange-100 border-orange-300">
          <div className="text-xs text-orange-800">权限加载中...</div>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="bg-gray-900 text-white border-gray-700 shadow-lg">
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="p-3 text-xs font-mono hover:bg-gray-800 rounded"
          >
            🔐 权限调试器
          </button>
        ) : (
          <div className="p-4 max-w-md max-h-96 overflow-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold">🔐 权限调试器</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {/* 用户信息 */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-blue-300 mb-1">当前用户</h4>
              <div className="text-xs space-y-1">
                <div>用户名: {user?.username || 'N/A'}</div>
                <div>角色: {user?.role || 'N/A'}</div>
                <div>状态: {user?.status || 'N/A'}</div>
              </div>
            </div>

            {/* 用户权限 */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-green-300 mb-1">
                用户权限 ({permissions.length})
              </h4>
              <div className="max-h-24 overflow-y-auto">
                {permissions.length > 0 ? (
                  <div className="text-xs space-y-1">
                    {permissions.map((permission, index) => (
                      <div key={index} className="text-green-200 font-mono">
                        • {permission}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400">无权限</div>
                )}
              </div>
            </div>

            {/* 菜单信息 */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-purple-300 mb-1">
                可见菜单 ({menuConfig?.menus?.length || 0})
              </h4>
              <div className="max-h-24 overflow-y-auto">
                {menuConfig?.menus && menuConfig.menus.length > 0 ? (
                  <div className="text-xs space-y-1">
                    {menuConfig.menus.map((menu) => (
                      <div key={menu.key}>
                        <div className="text-purple-200 font-semibold">{menu.label}</div>
                        {menu.children?.map((child) => (
                          <div key={child.key} className="text-purple-100 ml-2">
                            • {child.label}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400">无可见菜单</div>
                )}
              </div>
            </div>

            {/* 系统权限信息 */}
            {allPermissions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-yellow-300 mb-1">
                  系统权限 ({allPermissions.length})
                </h4>
                <div className="max-h-24 overflow-y-auto">
                  <div className="text-xs space-y-1">
                    {allPermissions.map((permission) => {
                      const hasPermission = permissions.includes(permission.code)
                      return (
                        <div 
                          key={permission.id} 
                          className={`font-mono ${hasPermission ? 'text-green-200' : 'text-gray-500'}`}
                        >
                          {hasPermission ? '✓' : '✗'} {permission.code}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 系统角色信息 */}
            {allRoles.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-cyan-300 mb-1">
                  系统角色 ({allRoles.length})
                </h4>
                <div className="max-h-24 overflow-y-auto">
                  <div className="text-xs space-y-1">
                    {allRoles.map((role) => {
                      const isCurrentRole = user?.role === role.code
                      return (
                        <div 
                          key={role.id}
                          className={`${isCurrentRole ? 'text-cyan-200 font-bold' : 'text-gray-400'}`}
                        >
                          {isCurrentRole ? '→' : '•'} {role.name} ({role.code})
                          <div className="text-xs text-gray-500 ml-2">
                            {role.permissions.length} 个权限
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 调试操作 */}
            <div className="border-t border-gray-700 pt-3">
              <h4 className="text-xs font-semibold text-orange-300 mb-2">调试操作</h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    console.log('🔐 权限调试信息:', {
                      user,
                      permissions,
                      menuConfig,
                      allPermissions,
                      allRoles
                    })
                  }}
                  className="text-xs h-6 px-2 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  输出到控制台
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const debugData = {
                      user,
                      permissions,
                      menuConfig,
                      allPermissions,
                      allRoles,
                      timestamp: new Date().toISOString()
                    }
                    const blob = new Blob([JSON.stringify(debugData, null, 2)], { 
                      type: 'application/json' 
                    })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `permission-debug-${Date.now()}.json`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="text-xs h-6 px-2 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  导出JSON
                </Button>
              </div>
            </div>

            {/* 版本信息 */}
            <div className="border-t border-gray-700 pt-2 mt-2">
              <div className="text-xs text-gray-500">
                权限系统 v1.0.0 | 混合方案
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

// 权限测试工具组件
export function PermissionTester() {
  const [testPermission, setTestPermission] = useState('')
  const [testResult, setTestResult] = useState<boolean | null>(null)
  const { hasPermission } = usePermission()

  const handleTest = () => {
    if (testPermission.trim()) {
      const result = hasPermission(testPermission.trim())
      setTestResult(result)
    }
  }

  // 如果不是开发环境，不显示
  if (!isDevelopment()) {
    return null
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Card className="p-3 bg-blue-50 border-blue-300 max-w-xs">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">权限测试</h4>
        <div className="space-y-2">
          <input
            type="text"
            value={testPermission}
            onChange={(e) => setTestPermission(e.target.value)}
            placeholder="输入权限代码..."
            className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Button
            size="sm"
            onClick={handleTest}
            disabled={!testPermission.trim()}
            className="w-full h-6 text-xs"
          >
            测试
          </Button>
          {testResult !== null && (
            <div className={`text-xs p-2 rounded ${
              testResult 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {testResult ? '✅ 有权限' : '❌ 无权限'}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
