import React, { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import UserSelector from '@/components/business/common/UserSelector'
import TemporaryParticipantImporter from '@/components/business/common/TemporaryParticipantImporter'
import type { MeetingParticipant, User, TemporaryParticipant } from '@/types'

interface AddParticipantModalProps {
  isOpen: boolean
  onClose: () => void
  selectedParticipants: MeetingParticipant[]
  onParticipantsChange: (participants: MeetingParticipant[]) => void
}

type TabType = 'org' | 'temp'

const SECURITY_LEVEL_CONFIG = {
  unclassified: { label: '普通', icon: '🔓', badge: 'bg-gray-100 text-gray-800' },
  confidential: { label: '机密', icon: '🔒', badge: 'bg-blue-100 text-blue-800' },
  secret: { label: '绝密', icon: '🔒', badge: 'bg-orange-100 text-orange-800' },
  top_secret: { label: '最高机密', icon: '🔐', badge: 'bg-red-100 text-red-800' }
}

const AddParticipantModal: React.FC<AddParticipantModalProps> = ({
  isOpen,
  onClose,
  selectedParticipants,
  onParticipantsChange
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('org')
  const [tempSelectedUsers, setTempSelectedUsers] = useState<User[]>([])
  const [tempImportedParticipants, setTempImportedParticipants] = useState<TemporaryParticipant[]>([])

  const handleOrgUsersChange = (users: User[]) => {
    setTempSelectedUsers(users)
  }

  const handleTempImport = (participants: TemporaryParticipant[]) => {
    setTempImportedParticipants(prev => [...prev, ...participants])
  }

  const handleRemoveTempUser = (userId: string) => {
    setTempSelectedUsers(prev => prev.filter(u => u.id !== userId))
  }

  const handleRemoveTempParticipant = (index: number) => {
    setTempImportedParticipants(prev => prev.filter((_, i) => i !== index))
  }

  const handleConfirm = () => {
    const newParticipants: MeetingParticipant[] = []

    // 添加组织架构人员
    tempSelectedUsers.forEach(user => {
      if (!selectedParticipants.some(p => p.userId === user.id)) {
        newParticipants.push({
          id: `participant-${Date.now()}-${Math.random()}`,
          meetingId: '',
          participantType: 'internal',
          userId: user.id,
          username: user.username,
          department: user.department,
          departmentName: user.departmentName,
          position: user.position,
          securityLevel: user.securityLevel,
          role: 'participant',
          status: 'invited',
          createdAt: new Date().toISOString()
        })
      }
    })

    // 添加临时人员
    tempImportedParticipants.forEach(temp => {
      newParticipants.push({
        id: `participant-${Date.now()}-${Math.random()}`,
        meetingId: '',
        participantType: 'temporary',
        name: temp.name,
        tempDepartment: temp.tempDepartment,
        tempPosition: temp.tempPosition,
        tempSecurityLevel: temp.tempSecurityLevel || 'unclassified',
        role: 'participant',
        status: 'invited',
        createdAt: new Date().toISOString()
      })
    })

    onParticipantsChange([...selectedParticipants, ...newParticipants])
    
    // 重置状态
    setTempSelectedUsers([])
    setTempImportedParticipants([])
    onClose()
  }

  const handleCancel = () => {
    setTempSelectedUsers([])
    setTempImportedParticipants([])
    onClose()
  }

  const totalSelected = tempSelectedUsers.length + tempImportedParticipants.length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[900px] h-[700px] flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">添加参会人员</h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab切换 */}
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('org')}
              className={`
                flex-1 px-4 py-3 text-sm font-medium transition-colors
                ${activeTab === 'org'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              从组织架构选择
            </button>
            <button
              onClick={() => setActiveTab('temp')}
              className={`
                flex-1 px-4 py-3 text-sm font-medium transition-colors
                ${activeTab === 'temp'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              导入临时人员
            </button>
          </div>
        </div>

        {/* 左右分栏内容区 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧：选择器 */}
          <div className="flex-1 border-r overflow-hidden">
            {activeTab === 'org' && (
              <UserSelector
                mode="multiple"
                value={tempSelectedUsers}
                onChange={handleOrgUsersChange}
                showSecurityLevel={true}
                enableSearch={true}
              />
            )}
            
            {activeTab === 'temp' && (
              <TemporaryParticipantImporter
                onImport={handleTempImport}
              />
            )}
          </div>

          {/* 右侧：待添加人员列表 */}
          <div className="w-80 flex flex-col bg-gray-50">
            <div className="p-4 border-b bg-white">
              <div className="text-sm font-medium text-gray-700">
                待添加人员 ({totalSelected}人)
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {totalSelected === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  暂无待添加人员
                </div>
              ) : (
                <div className="space-y-2">
                  {/* 组织架构人员 */}
                  {tempSelectedUsers.map(user => {
                    const securityConfig = SECURITY_LEVEL_CONFIG[user.securityLevel as keyof typeof SECURITY_LEVEL_CONFIG]
                    return (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{user.username}</div>
                          {securityConfig && (
                            <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded mt-1 ${securityConfig.badge}`}>
                              {securityConfig.icon} {securityConfig.label}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveTempUser(user.id)}
                          className="ml-2 text-gray-400 hover:text-red-600 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  })}
                  
                  {/* 临时人员 */}
                  {tempImportedParticipants.map((participant, index) => {
                    const securityConfig = SECURITY_LEVEL_CONFIG[participant.tempSecurityLevel as keyof typeof SECURITY_LEVEL_CONFIG]
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded border border-amber-200">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{participant.name}</span>
                            <span className="text-xs text-amber-600 flex-shrink-0">(临时)</span>
                          </div>
                          {securityConfig && (
                            <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded mt-1 ${securityConfig.badge}`}>
                              {securityConfig.icon} {securityConfig.label}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveTempParticipant(index)}
                          className="ml-2 text-gray-400 hover:text-red-600 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={totalSelected === 0}
            >
              确定添加 ({totalSelected}人)
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddParticipantModal
