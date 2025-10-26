import React, { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import UserSelector from '@/components/business/common/UserSelector'
import { participantApi } from '@/services/api/participant.api'
import { useNotifications } from '@/hooks/useNotifications'
import type { MeetingParticipant, User, CreateParticipantItemRequest } from '@/types'

interface AddParticipantModalProps {
  isOpen: boolean
  onClose: () => void
  meetingId?: string  // 新增：会议ID
  selectedParticipants: MeetingParticipant[]
  onParticipantsChange: (participants: MeetingParticipant[]) => void
}

const SECURITY_LEVEL_CONFIG = {
  unclassified: { label: '普通', icon: '🔓', badge: 'bg-gray-100 text-gray-800' },
  confidential: { label: '机密', icon: '🔒', badge: 'bg-blue-100 text-blue-800' },
  secret: { label: '绝密', icon: '🔒', badge: 'bg-orange-100 text-orange-800' },
  top_secret: { label: '最高机密', icon: '🔐', badge: 'bg-red-100 text-red-800' }
}

const AddParticipantModal: React.FC<AddParticipantModalProps> = ({
  isOpen,
  onClose,
  meetingId,
  selectedParticipants,
  onParticipantsChange
}) => {
  const { showSuccess, showError } = useNotifications()
  const [tempSelectedUsers, setTempSelectedUsers] = useState<User[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOrgUsersChange = (users: User[]) => {
    setTempSelectedUsers(users)
  }

  const handleRemoveTempUser = (userId: string) => {
    setTempSelectedUsers(prev => prev.filter(u => u.id !== userId))
  }

  const handleConfirm = async () => {
    // 如果没有会议ID，则仅保存到本地状态（创建会议时）
    if (!meetingId) {
      const newParticipants: MeetingParticipant[] = []

      // 添加组织架构人员
      tempSelectedUsers.forEach(user => {
        if (!selectedParticipants.some(p => p.userId === user.id)) {
          newParticipants.push({
            id: `participant-${Date.now()}-${Math.random()}`,
            meetingId: '',
            userId: user.id,
            userName: user.username,
            name: user.name || user.username,
            email: user.email,
            department: user.department,
            securityLevel: user.securityLevel,
            role: 'participant',
            status: 'invited',
            createdAt: new Date().toISOString()
          })
        }
      })

      onParticipantsChange([...selectedParticipants, ...newParticipants])
      
      // 重置状态
      setTempSelectedUsers([])
      onClose()
      return
    }

    // 如果有会议ID，则批量调用接口添加
    try {
      setIsSubmitting(true)

      // 构建请求数据
      const participantsToAdd: CreateParticipantItemRequest[] = []

      // 添加组织架构人员
      tempSelectedUsers.forEach(user => {
        if (!selectedParticipants.some(p => p.userId === user.id)) {
          participantsToAdd.push({
            user_id: user.id,
            user_name: user.username,
            name: user.name || user.username,
            email: user.email,
            department: user.department,
            security_level: user.securityLevel,
            role: 'participant'
          })
        }
      })

      if (participantsToAdd.length === 0) {
        showError('添加失败', '没有需要添加的参会人员')
        return
      }

      // 调用批量添加接口
      const addedParticipants = await participantApi.batchCreateParticipants(meetingId, {
        participants: participantsToAdd
      })

      // 更新本地状态
      onParticipantsChange([...selectedParticipants, ...addedParticipants])

      showSuccess('添加成功', `已添加 ${addedParticipants.length} 名参会人员`)
      
      // 重置状态
      setTempSelectedUsers([])
      onClose()
    } catch (error) {
      console.error('Failed to add participants:', error)
      showError('添加失败', '无法添加参会人员，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setTempSelectedUsers([])
    onClose()
  }

  const totalSelected = tempSelectedUsers.length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[1100px] h-[700px] flex flex-col">
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

        {/* 标题 */}
        <div className="border-b">
          <div className="px-4 py-3 text-sm font-medium text-gray-700">
            从组织架构选择参会人员
          </div>
        </div>

        {/* 左右分栏内容区 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧：选择器 */}
          <div className="flex-1 border-r overflow-hidden">
            <UserSelector
              mode="multiple"
              value={tempSelectedUsers}
              onChange={handleOrgUsersChange}
              showSecurityLevel={true}
              enableSearch={true}
            />
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
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{user.name}</span>
                            {securityConfig && (
                              <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${securityConfig.badge}`}>
                                {securityConfig.icon} {securityConfig.label}
                              </span>
                            )}
                          </div>
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
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              取消
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={totalSelected === 0 || isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? '添加中...' : `确定添加 (${totalSelected}人)`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddParticipantModal
