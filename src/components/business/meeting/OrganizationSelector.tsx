import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'
import type { MeetingParticipant } from '@/types'

/**
 * 组织架构选择器的视图模型 (ViewModel)
 * 
 * 注：这些类型是为UI层专门设计的轻量级节点类型，不同于领域层的 Department/User 类型。
 * - 领域类型 (Department/User): 完整的业务实体，包含所有业务字段
 * - 视图类型 (OrgNode): 只包含UI渲染所需的字段，用于组件显示
 * 
 * 这样设计的好处：
 * 1. 降低耦合：组件不直接依赖完整的领域模型
 * 2. 提升性能：减少不必要的数据传输
 * 3. 易于维护：类型定义靠近使用位置
 * 
 * 数据转换应在 API/Service 层完成：Department/User → OrgNode
 */

// 用户节点：用于显示可选择的人员
interface OrgUserNode {
  id: string
  name: string
  department: string
  position?: string
  type: 'user'
}

// 部门节点：用于组织架构的树形结构
interface OrgDeptNode {
  id: string
  name: string
  type: 'department'
  children?: OrgNode[]
}

// 统一的节点类型，方便递归渲染
type OrgNode = OrgDeptNode | OrgUserNode

interface OrganizationSelectorProps {
  isOpen: boolean
  onClose: () => void
  selectedParticipants: MeetingParticipant[]
  onParticipantsChange: (participants: MeetingParticipant[]) => void
}

const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({
  isOpen,
  onClose,
  selectedParticipants,
  onParticipantsChange
}) => {
  const [orgData, setOrgData] = useState<OrgDeptNode[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedNodes, setExpandedNodes] = useState<string[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<OrgUserNode[]>([])

  useEffect(() => {
    if (isOpen) {
      loadOrganization()
    }
  }, [isOpen])

  useEffect(() => {
    if (searchKeyword.trim()) {
      searchUsers()
    } else {
      setSearchResults([])
    }
  }, [searchKeyword])

  const loadOrganization = async () => {
    try {
      setLoading(true)
      // TODO: 替换为实际的API调用
      const data: OrgDeptNode[] = []
      setOrgData(data)
      setExpandedNodes(data.map((dept: OrgDeptNode) => dept.id))
    } catch (error) {
      console.error('Load organization failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async () => {
    try {
      // TODO: 替换为实际的API调用
      const users: OrgUserNode[] = []
      setSearchResults(users)
    } catch (error) {
      console.error('Search users failed:', error)
    }
  }

  const handleNodeToggle = (nodeId: string) => {
    setExpandedNodes(prev => 
      prev.includes(nodeId) 
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    )
  }

  const handleUserSelect = (user: OrgUserNode) => {
    const isSelected = selectedParticipants.some(p => p.userId === user.id)
    
    if (isSelected) {
      onParticipantsChange(
        selectedParticipants.filter(p => p.userId !== user.id)
      )
    } else {
      const newParticipant: MeetingParticipant = {
        id: `participant-${Date.now()}-${user.id}`,
        meetingId: '', // 将在保存时填充
        userId: user.id,
        userName: user.name,
        email: undefined,
        department: user.department,
        departmentName: user.department,
        role: 'participant',
        status: 'invited',
        invitedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      onParticipantsChange([...selectedParticipants, newParticipant])
    }
  }

  const isUserSelected = (userId: string) => {
    return selectedParticipants.some(p => p.userId === userId)
  }

  const renderOrgNode = (item: OrgNode, level: number = 0) => {
    const isExpanded = expandedNodes.includes(item.id)
    const marginLeft = level * 16

    if (item.type === 'user') {
      const selected = isUserSelected(item.id)
      return (
        <div 
          key={item.id}
          className={`flex items-center gap-2 p-2 hover:bg-blue-50 cursor-pointer rounded ${
            selected ? 'bg-blue-100' : ''
          }`}
          style={{ marginLeft }}
          onClick={() => handleUserSelect(item)}
        >
          <span className="text-blue-600">👤</span>
          <div className="flex-1">
            <span className="text-sm">{item.name}</span>
            {item.position && (
              <span className="text-xs text-gray-500 ml-2">{item.position}</span>
            )}
          </div>
          {selected && (
            <span className="text-xs text-green-600">✓</span>
          )}
        </div>
      )
    }

    return (
      <div key={item.id}>
        <div 
          className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded"
          style={{ marginLeft }}
          onClick={() => handleNodeToggle(item.id)}
        >
          <span className="text-lg">
            {isExpanded ? '▼' : '▶'}
          </span>
          <span className={`${item.type === 'department' ? 'font-medium' : ''}`}>
            {item.name}
          </span>
        </div>
        
        {isExpanded && item.type === 'department' && item.children && (
          <div>
            {item.children.map((child: OrgNode) => renderOrgNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[500px] max-h-[600px] flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">选择参会人员</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <Input
            placeholder="搜索人员姓名或职位..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">加载中...</div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-1">
              <div className="text-sm text-gray-600 mb-2">搜索结果：</div>
              {searchResults.map(user => renderOrgNode(user))}
            </div>
          ) : searchKeyword.trim() ? (
            <div className="text-sm text-gray-500 text-center py-4">
              未找到匹配的人员
            </div>
          ) : (
            <div className="space-y-1">
              {orgData.map(dept => renderOrgNode(dept))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              已选择 {selectedParticipants.length} 人
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button onClick={onClose}>
                确定
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrganizationSelector
