import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'
import { mockApi, type OrgDepartment, type OrgUser } from '@/services/mockApi'
import type { MeetingParticipant } from '@/types'

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
  const [orgData, setOrgData] = useState<OrgDepartment[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedNodes, setExpandedNodes] = useState<string[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<OrgUser[]>([])

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
      const data = await mockApi.getOrganization()
      setOrgData(data)
      setExpandedNodes(data.map(dept => dept.id))
    } catch (error) {
      console.error('Load organization failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async () => {
    try {
      const users = await mockApi.searchUsers(searchKeyword)
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

  const handleUserSelect = (user: OrgUser) => {
    const isSelected = selectedParticipants.some(p => p.id === user.id)
    
    if (isSelected) {
      onParticipantsChange(
        selectedParticipants.filter(p => p.id !== user.id)
      )
    } else {
      const newParticipant: MeetingParticipant = {
        id: user.id,
        name: user.name,
        email: undefined, // OrgUser不包含email属性
        department: user.department,
        userId: user.id,
        role: 'participant'
      }
      onParticipantsChange([...selectedParticipants, newParticipant])
    }
  }

  const isUserSelected = (userId: string) => {
    return selectedParticipants.some(p => p.id === userId)
  }

  const renderOrgNode = (item: any, level: number = 0) => {
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
        
        {isExpanded && item.children && (
          <div>
            {item.children.map((child: any) => renderOrgNode(child, level + 1))}
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
