/**
 * 权限管理页面
 * 提供角色权限矩阵编辑功能
 */

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { permissionApi } from '@/services/permission'
import { Card, Button, Loading, Modal } from '@/components/ui'
import { useGlobalStore } from '@/store'
import type { Role, PermissionGroup } from '@/types'

interface RoleFormData {
  name: string
  code: string
  description: string
  status: 'enabled' | 'disabled'
  permissions: string[]
}

export default function PermissionManagePage() {
  const { addNotification } = useGlobalStore()
  const queryClient = useQueryClient()

  // 状态管理
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])

  // 数据查询
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => permissionApi.getAllRoles()
  })

  const { data: permissionGroups = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissionGroups'],
    queryFn: () => permissionApi.getPermissionGroups()
  })

  const { data: rolePermissionMatrix = [], isLoading: matrixLoading } = useQuery({
    queryKey: ['rolePermissionMatrix'],
    queryFn: () => permissionApi.getRolePermissionMatrix()
  })

  // 默认展开所有权限组
  useEffect(() => {
    if (permissionGroups.length > 0) {
      setExpandedGroups(permissionGroups.map(group => group.key))
    }
  }, [permissionGroups])

  // 权限更新
  const updatePermissionMutation = useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: string, permissions: string[] }) =>
      permissionApi.updateRolePermissions(roleId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rolePermissionMatrix'] })
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      addNotification({
        type: 'success',
        title: '权限更新成功',
        message: '角色权限已成功更新'
      })
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: '权限更新失败',
        message: '请稍后重试'
      })
    }
  })

  // 角色创建
  const createRoleMutation = useMutation({
    mutationFn: (roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) =>
      permissionApi.createRole(roleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['rolePermissionMatrix'] })
      setShowRoleModal(false)
      setSelectedRole(null)
      addNotification({
        type: 'success',
        title: '角色创建成功'
      })
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: '角色创建失败',
        message: '请稍后重试'
      })
    }
  })

  // 角色更新
  const updateRoleMutation = useMutation({
    mutationFn: ({ roleId, roleData }: { 
      roleId: string, 
      roleData: Partial<Omit<Role, 'id' | 'createdAt' | 'updatedAt'>> 
    }) => permissionApi.updateRole(roleId, roleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['rolePermissionMatrix'] })
      setShowRoleModal(false)
      setSelectedRole(null)
      addNotification({
        type: 'success',
        title: '角色更新成功'
      })
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: '角色更新失败',
        message: '请稍后重试'
      })
    }
  })

  // 角色删除
  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: string) => permissionApi.deleteRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['rolePermissionMatrix'] })
      setShowDeleteConfirm(false)
      setRoleToDelete(null)
      addNotification({
        type: 'success',
        title: '角色删除成功'
      })
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: '角色删除失败',
        message: '请稍后重试'
      })
    }
  })

  // 权限切换处理
  const handlePermissionToggle = (roleId: string, permissionCode: string, hasPermission: boolean) => {
    const roleMatrix = rolePermissionMatrix.find(rm => rm.roleId === roleId)
    if (!roleMatrix) return

    const currentPermissions = Object.keys(roleMatrix.permissions).filter(code => 
      roleMatrix.permissions[code]
    )

    let newPermissions: string[]
    if (hasPermission) {
      // 移除权限
      newPermissions = currentPermissions.filter(code => code !== permissionCode)
    } else {
      // 添加权限
      newPermissions = [...currentPermissions, permissionCode]
    }

    updatePermissionMutation.mutate({
      roleId,
      permissions: newPermissions
    })
  }

  // 权限组展开/折叠
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupKey)
        ? prev.filter(key => key !== groupKey)
        : [...prev, groupKey]
    )
  }

  // 全选/取消全选权限组
  const handleGroupToggle = (roleId: string, groupKey: string, isSelected: boolean) => {
    const group = permissionGroups.find(g => g.key === groupKey)
    if (!group) return

    const roleMatrix = rolePermissionMatrix.find(rm => rm.roleId === roleId)
    if (!roleMatrix) return

    const currentPermissions = Object.keys(roleMatrix.permissions).filter(code => 
      roleMatrix.permissions[code]
    )

    const groupPermissionCodes = group.permissions.map(p => p.code)
    
    let newPermissions: string[]
    if (isSelected) {
      // 取消选择该组的所有权限
      newPermissions = currentPermissions.filter(code => !groupPermissionCodes.includes(code))
    } else {
      // 选择该组的所有权限
      newPermissions = [...new Set([...currentPermissions, ...groupPermissionCodes])]
    }

    updatePermissionMutation.mutate({
      roleId,
      permissions: newPermissions
    })
  }

  // 检查权限组是否全选
  const isGroupSelected = (roleId: string, groupKey: string): boolean => {
    const group = permissionGroups.find(g => g.key === groupKey)
    const roleMatrix = rolePermissionMatrix.find(rm => rm.roleId === roleId)
    
    if (!group || !roleMatrix) return false

    const groupPermissionCodes = group.permissions.map(p => p.code)
    return groupPermissionCodes.every(code => roleMatrix.permissions[code])
  }

  if (rolesLoading || permissionsLoading || matrixLoading) {
    return <Loading />
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">权限管理</h1>
          <p className="text-muted-foreground mt-1">管理系统角色和权限分配</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedRole(null)
            setShowRoleModal(true)
          }}
        >
          新增角色
        </Button>
      </div>

      {/* 角色权限矩阵 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">角色权限矩阵</h2>
        
        {/* 角色列表标题 */}
        <div className="grid grid-cols-12 gap-4 mb-4 pb-2 border-b">
          <div className="col-span-4 font-medium">权限项</div>
          {roles.map(role => (
            <div key={role.id} className="col-span-2 text-center">
              <div className="font-medium">{role.name}</div>
              <div className="text-xs text-muted-foreground">{role.code}</div>
              <div className="flex gap-1 justify-center mt-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedRole(role as Role)
                    setShowRoleModal(true)
                  }}
                  className="h-6 px-2 text-xs"
                >
                  编辑
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setRoleToDelete(role as Role)
                    setShowDeleteConfirm(true)
                  }}
                  className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                >
                  删除
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* 权限组和权限项 */}
        <div className="space-y-4">
          {permissionGroups.map(group => {
            const isExpanded = expandedGroups.includes(group.key)
            
            return (
              <div key={group.key} className="border rounded-lg">
                {/* 权限组标题 */}
                <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 dark:bg-gray-800/50">
                  <div className="col-span-4">
                    <button
                      onClick={() => toggleGroup(group.key)}
                      className="flex items-center gap-2 font-medium hover:text-primary"
                    >
                      <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                        ▶
                      </span>
                      {group.name}
                    </button>
                  </div>
                  {roles.map(role => {
                    const isSelected = isGroupSelected(role.id, group.key)
                    return (
                      <div key={role.id} className="col-span-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleGroupToggle(role.id, group.key, isSelected)}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                      </div>
                    )
                  })}
                </div>

                {/* 权限项详情 */}
                {isExpanded && (
                  <div className="p-3 space-y-2">
                    {group.permissions.map(permission => (
                      <div key={permission.id} className="grid grid-cols-12 gap-4 items-center py-1">
                        <div className="col-span-4 pl-6">
                          <div className="font-medium text-sm">{permission.name}</div>
                          <div className="text-xs text-muted-foreground">{permission.code}</div>
                          {permission.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {permission.description}
                            </div>
                          )}
                        </div>
                        {roles.map(role => {
                          const roleMatrix = rolePermissionMatrix.find(rm => rm.roleId === role.id)
                          const hasPermission = roleMatrix?.permissions[permission.code] || false
                          
                          return (
                            <div key={role.id} className="col-span-2 text-center">
                              <input
                                type="checkbox"
                                checked={hasPermission}
                                onChange={() => handlePermissionToggle(role.id, permission.code, hasPermission)}
                                disabled={updatePermissionMutation.isPending}
                                className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                              />
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* 角色编辑模态框 */}
      <RoleModal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false)
          setSelectedRole(null)
        }}
        role={selectedRole}
        permissionGroups={permissionGroups}
        onSubmit={(data) => {
          if (selectedRole) {
            updateRoleMutation.mutate({
              roleId: selectedRole.id,
              roleData: data
            })
          } else {
            createRoleMutation.mutate({
              ...data,
              status: data.status || 'enabled'
            })
          }
        }}
        isLoading={createRoleMutation.isPending || updateRoleMutation.isPending}
      />

      {/* 删除确认模态框 */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setRoleToDelete(null)
        }}
        title="确认删除"
      >
        <div className="space-y-4">
          <p>
            确定要删除角色 <strong>{roleToDelete?.name}</strong> 吗？
          </p>
          <p className="text-sm text-muted-foreground">
            删除后将无法恢复，请谨慎操作。
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false)
                setRoleToDelete(null)
              }}
            >
              取消
            </Button>
            <Button
              onClick={() => {
                if (roleToDelete) {
                  deleteRoleMutation.mutate(roleToDelete.id)
                }
              }}
              disabled={deleteRoleMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteRoleMutation.isPending ? '删除中...' : '确认删除'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// 角色编辑模态框组件
interface RoleModalProps {
  isOpen: boolean
  onClose: () => void
  role: Role | null
  permissionGroups: PermissionGroup[]
  onSubmit: (data: RoleFormData) => void
  isLoading: boolean
}

function RoleModal({ isOpen, onClose, role, onSubmit, isLoading }: RoleModalProps) {
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    code: '',
    description: '',
    status: 'enabled',
    permissions: []
  })

  // 重置表单数据
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        code: role.code,
        description: role.description || '',
        status: role.status,
        permissions: role.permissions
      })
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        status: 'enabled',
        permissions: []
      })
    }
  }, [role, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={role ? '编辑角色' : '新增角色'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">角色名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="请输入角色名称"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">角色代码</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="请输入角色代码"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">状态</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'enabled' | 'disabled' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="enabled">启用</option>
            <option value="disabled">禁用</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">描述</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={3}
            placeholder="请输入角色描述"
          />
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '保存中...' : '保存'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
