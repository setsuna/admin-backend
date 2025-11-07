import React, { useState, useMemo, useEffect } from 'react'
import { Search, X, ChevronRight, ChevronDown, ChevronLeft, Check } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
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
  systemSecurityLevel?: 'confidential' | 'secret'  // 系统密级
}

const UserSelector: React.FC<UserSelectorProps> = ({
  mode = 'multiple',
  value = [],
  onChange,
  filters = {},
  showSecurityLevel = true,
  enableSearch = true,
  systemSecurityLevel
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

  // 密级层级定义
  const securityLevelOrder: Record<string, number> = {
    'unclassified': 0,
    'internal': 1,
    'confidential': 2,
    'secret': 3,
    'top_secret': 4
  }

  // 判断用户密级是否满足会议要求
  // 规则：
  // - 内部会议：允许任何人参加
  // - 秘密会议：只允许秘密级及以上的人参加
  // - 机密会议：只允许机密级及以上的人参加
  const isUserSecurityExceeded = (userSecurityLevel: string) => {
    if (!systemSecurityLevel) return false
    
    const userLevel = securityLevelOrder[userSecurityLevel] || 0
    const meetingLevel = securityLevelOrder[systemSecurityLevel] || 0
    
    // 用户密级必须 >= 会议密级
    return userLevel < meetingLevel
  }

  const handleToggleUser = (user: User) => {
    // 检查用户密级是否超出限制
    if (isUserSecurityExceeded(user.securityLevel)) {
      // 不允许选择
      return
    }
    
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
              flex items-center gap-2 px-3 py-2 cursor-pointer rounded transition-all duration-200
              ${isSelected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted hover:translate-x-0.5'}
            `}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleDeptExpand(dept.id)
                }}
                className="flex-shrink-0 hover:bg-primary/10 rounded p-0.5 transition-colors duration-200"
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
      <div className="w-56 border-r flex flex-col bg-bg-container">
        <div className="flex-1 overflow-y-auto p-2">
          <div
            onClick={() => setSelectedDeptId('')}
            className={`
              px-3 py-2 mb-1 cursor-pointer rounded text-sm transition-all duration-200
              ${selectedDeptId === '' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted hover:translate-x-0.5'}
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <input
                type="text"
                placeholder="搜索人员..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring shadow-sm transition-shadow"
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <Card animate="fadeIn" className="text-center py-12">
              <div className="text-text-regular mb-2">加载中...</div>
              <div className="text-sm text-text-tertiary">正在获取人员列表</div>
            </Card>
          ) : users.length === 0 ? (
            <Card animate="fadeIn" className="text-center py-12">
              <div className="text-text-regular mb-2">暂无数据</div>
              <div className="text-sm text-text-tertiary">请尝试调整筛选条件</div>
            </Card>
          ) : (
            <div className="space-y-2">
              {users.map(user => {
                const isSelected = selectedIds.has(user.id)
                const isExceeded = isUserSecurityExceeded(user.securityLevel)
                const securityLevel = securityLevels.find(s => s.value === user.securityLevel)
                const securityColorMap: Record<string, string> = {
                  'internal': 'bg-green-500',
                  'confidential': 'bg-yellow-500',
                  'secret': 'bg-red-500'
                }
                const securityColor = securityColorMap[user.securityLevel] || 'bg-gray-500'
                
                return (
                  <Card
                    key={user.id}
                    onClick={() => handleToggleUser(user)}
                    hover={isExceeded ? undefined : "lift"}
                    interactive={!isExceeded}
                    className={`
                      p-3 transition-all duration-200
                      ${isExceeded ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                      ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : ''}
                    `}
                    title={isExceeded ? `该人员密级不足，${systemSecurityLevel === 'confidential' ? '秘密' : '机密'}会议要求${systemSecurityLevel === 'confidential' ? '秘密' : '机密'}级及以上人员` : ''}
                  >
                    <div className="flex items-center gap-3">
                      {/* 自定义 checkbox 样式 */}
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          disabled={isExceeded}
                          className="peer sr-only"
                        />
                        <div className={`
                          h-4 w-4 rounded border-2 flex items-center justify-center transition-all duration-200
                          ${isSelected 
                            ? 'bg-primary border-primary' 
                            : isExceeded
                            ? 'border-input/30'
                            : 'border-input hover:border-primary/50'
                          }
                        `}>
                          {isSelected && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium transition-colors ${
                            isSelected ? 'text-primary' : 'text-text-primary'
                          }`}>
                            {user.name || user.realName || user.username}
                          </span>
                          {showSecurityLevel && securityLevel && (
                            <span className={`text-xs px-1.5 py-0.5 rounded text-white flex-shrink-0 ${securityColor}`}>
                              {securityLevel.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* 分页 */}
        {!isLoading && total > 0 && (
          <div className="p-4 border-t bg-bg-card">
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                共 {total} 人，第 {page}/{totalPages} 页
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
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
                          px-3 py-1 border rounded min-w-[36px] transition-all duration-200 shadow-sm
                          ${page === pageNum 
                            ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                            : 'hover:bg-accent hover:text-accent-foreground'
                          }
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
                  className="px-3 py-1 border rounded hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedUsers.length > 0 && (
          <div className="p-4 border-t bg-bg-container">
            <div className="text-sm font-medium text-text-secondary mb-2">
              已选择 {selectedUsers.length} 人
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => {
                const securityLevel = securityLevels.find(s => s.value === user.securityLevel)
                const securityColorMap: Record<string, string> = {
                  'internal': 'bg-green-500',
                  'confidential': 'bg-yellow-500',
                  'secret': 'bg-red-500'
                }
                const securityColor = securityColorMap[user.securityLevel] || 'bg-gray-500'
                
                return (
                  <Card
                    key={user.id}
                    hover="scale"
                    animate="fadeIn"
                    className="inline-flex items-center gap-2 px-3 py-1.5 shadow-sm"
                  >
                    <span className="text-sm font-medium">
                      {user.name || user.realName || user.username}
                    </span>
                    {showSecurityLevel && securityLevel && (
                      <span className={`text-xs px-1.5 py-0.5 rounded text-white ${securityColor}`}>
                        {securityLevel.name}
                      </span>
                    )}
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="text-text-tertiary hover:text-error transition-colors duration-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Card>
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
