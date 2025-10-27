import React, { useState, useMemo, useEffect } from 'react'
import { Search, X, ChevronRight, ChevronDown, ChevronLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { userApi } from '@/services/api/user.api'
import { departmentApiService } from '@/services/api/department.api'
import { useSecurityLevels } from '@/hooks/useSecurityLevels'
import type { User, UserSecurityLevel, Department, ActiveStatus } from '@/types'

interface UserSelectorProps {
  mode?: 'single' | 'multiple'
  value?: User[]
  onChange?: (users: User[]) => void
  filters?: {
    securityLevel?: UserSecurityLevel
    department?: string
    status?: string
  }
  showSecurityLevel?: boolean
  enableSearch?: boolean
}

const UserSelector: React.FC<UserSelectorProps> = ({
  mode = 'multiple',
  value = [],
  onChange,
  filters = {},
  showSecurityLevel = true,
  enableSearch = true
}) => {
  const [keyword, setKeyword] = useState('')
  const [selectedDeptId, setSelectedDeptId] = useState<string>('')
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(value.map(u => u.id))
  )
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  const { securityLevels } = useSecurityLevels()

  // 同步 value prop 的变化到 selectedIds
  useEffect(() => {
    setSelectedIds(new Set(value.map(u => u.id)))
  }, [value])

  // 获取部门树
  const { data: deptTree = [] } = useQuery({
    queryKey: ['department-tree'],
    queryFn: () => departmentApiService.getDepartmentTree()
  })

  // 获取用户列表
  const { data: usersResult, isLoading } = useQuery({
    queryKey: ['users', keyword, selectedDeptId, filters, page, pageSize],
    queryFn: async () => {
      const result = await userApi.getUsers({
        keyword,
        department: selectedDeptId || filters.department,
        securityLevel: filters.securityLevel,
        status: filters.status as ActiveStatus | undefined,  // 明确类型断言
        page,
        pageSize
      })
      return result
    }
  })

  const users = usersResult?.items || []
  const total = usersResult?.pagination?.total || 0
  const totalPages = Math.ceil(total / pageSize)

  const selectedUsers = useMemo(() => {
    return users.filter(u => selectedIds.has(u.id))
  }, [users, selectedIds])

  // 默认展开第一级部门
  useEffect(() => {
    if (deptTree.length > 0 && expandedDepts.size === 0) {
      setExpandedDepts(new Set(deptTree.map(d => d.id)))
    }
  }, [deptTree])

  // 搜索或切换部门时重置页码
  useEffect(() => {
    setPage(1)
  }, [keyword, selectedDeptId])

  const handleToggleUser = (user: User) => {
    const newIds = new Set(selectedIds)
    
    if (mode === 'single') {
      newIds.clear()
      newIds.add(user.id)
    } else {
      if (newIds.has(user.id)) {
        newIds.delete(user.id)
      } else {
        newIds.add(user.id)
      }
    }
    
    setSelectedIds(newIds)
    
    if (onChange) {
      // 保留之前选中的、不在当前页的用户
      const currentUserIds = new Set(users.map(u => u.id))
      const previouslySelected = value.filter(u => !currentUserIds.has(u.id))
      
      // 合并：之前选中的 + 当前页选中的
      const currentlySelected = users.filter(u => newIds.has(u.id))
      onChange([...previouslySelected, ...currentlySelected])
    }
  }

  const handleRemoveUser = (userId: string) => {
    const newIds = new Set(selectedIds)
    newIds.delete(userId)
    setSelectedIds(newIds)
    
    if (onChange) {
      // 直接从 value 中过滤掉被移除的用户
      const selected = value.filter(u => u.id !== userId)
      onChange(selected)
    }
  }

  const toggleDeptExpand = (deptId: string) => {
    const newExpanded = new Set(expandedDepts)
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId)
    } else {
      newExpanded.add(deptId)
    }
    setExpandedDepts(newExpanded)
  }

  const renderDeptTree = (depts: Department[], level: number = 0) => {
    return depts.map(dept => {
      const isExpanded = expandedDepts.has(dept.id)
      const isSelected = selectedDeptId === dept.id
      const hasChildren = dept.children && dept.children.length > 0

      return (
        <div key={dept.id}>
          <div
            onClick={() => setSelectedDeptId(dept.id)}
            className={`
              flex items-center gap-2 px-3 py-2 cursor-pointer rounded
              ${isSelected ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}
            `}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleDeptExpand(dept.id)
                }}
                className="flex-shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-4" />}
            <span className="text-sm flex-1 truncate">{dept.name}</span>
          </div>
          {hasChildren && isExpanded && renderDeptTree(dept.children!, level + 1)}
        </div>
      )
    })
  }

  return (
    <div className="flex h-full">
      {/* 左侧：部门树 */}
      <div className="w-56 border-r flex flex-col bg-gray-50">
        <div className="p-3 border-b bg-white">
          <div className="text-sm font-medium text-gray-700">部门</div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <div
            onClick={() => setSelectedDeptId('')}
            className={`
              px-3 py-2 mb-1 cursor-pointer rounded text-sm
              ${selectedDeptId === '' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}
            `}
          >
            全部部门
          </div>
          {renderDeptTree(deptTree)}
        </div>
      </div>

      {/* 右侧：用户列表 */}
      <div className="flex-1 flex flex-col">
        {enableSearch && (
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索人员..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无数据</div>
          ) : (
            <div className="space-y-2">
              {users.map(user => {
                const isSelected = selectedIds.has(user.id)
                const securityLevel = securityLevels.find(s => s.value === user.securityLevel)
                
                return (
                  <div
                    key={user.id}
                    onClick={() => handleToggleUser(user)}
                    className={`
                      p-3 rounded-lg border cursor-pointer transition-colors
                      ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="h-4 w-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{user.name || user.realName || user.username}</span>
                          {showSecurityLevel && securityLevel && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 flex-shrink-0">
                              {securityLevel.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 分页 */}
        {!isLoading && total > 0 && (
          <div className="p-4 border-t bg-white">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                共 {total} 人，第 {page}/{totalPages} 页
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => setPage(pageNum)}
                        className={`
                          px-3 py-1 border rounded min-w-[36px]
                          ${page === pageNum ? 'bg-blue-500 text-white border-blue-500' : 'hover:bg-gray-50'}
                        `}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedUsers.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-2">
              已选择 {selectedUsers.length} 人
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => {
                const securityLevel = securityLevels.find(s => s.value === user.securityLevel)
                
                return (
                  <div
                    key={user.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border rounded-md"
                  >
                    <span className="text-sm">
                      {user.name || user.realName || user.username}
                    </span>
                    {showSecurityLevel && securityLevel && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                        {securityLevel.name}
                      </span>
                    )}
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserSelector
