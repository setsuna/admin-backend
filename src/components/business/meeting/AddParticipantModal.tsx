import React, { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardFooter } from '@/components/ui/Card'
import UserSelector from '@/components/business/common/UserSelector'
import TemporaryParticipantImporter from '@/components/business/common/TemporaryParticipantImporter'
import { participantApi } from '@/services/api/participant.api'
import { useNotifications } from '@/hooks/useNotifications'
import { useSecurityLevels } from '@/hooks/useSecurityLevels'
import type { MeetingParticipant, User, TemporaryParticipant, CreateParticipantItemRequest } from '@/types'

interface AddParticipantModalProps {
  isOpen: boolean
  onClose: () => void
  meetingId?: string  // 新增：会议ID
  selectedParticipants: MeetingParticipant[]
  onParticipantsChange: (participants: MeetingParticipant[]) => void
  systemSecurityLevel?: 'confidential' | 'secret'  // 系统密级
}

type TabType = 'org' | 'temp'

const AddParticipantModal: React.FC<AddParticipantModalProps> = ({
  isOpen,
  onClose,
  meetingId,
  selectedParticipants,
  onParticipantsChange,
  systemSecurityLevel
}) => {
  const { showSuccess, showError } = useNotifications()
  const { securityLevels } = useSecurityLevels()
  const [activeTab, setActiveTab] = useState<TabType>('org')
  const [tempSelectedUsers, setTempSelectedUsers] = useState<User[]>([])
  const [tempImportedParticipants, setTempImportedParticipants] = useState<TemporaryParticipant[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 当模态框打开时，初始化已选人员（只包含组织架构人员）
  React.useEffect(() => {
    if (isOpen) {
      // 筛选出已添加的组织架构人员（userId 不以 temp 开头）
      const existingOrgUsers = selectedParticipants
        .filter(p => !p.userId?.startsWith('temp'))
        .map(p => ({
          id: p.userId,
          username: p.userName,
          name: p.name || p.userName,
          email: p.email || '',
          department: p.department || '',
          securityLevel: p.securityLevel || 'unclassified',
          role: 'user' as const,
          status: 'active' as const,
          createdAt: p.createdAt || new Date().toISOString()
        } as User))
      
      setTempSelectedUsers(existingOrgUsers)
      setTempImportedParticipants([])
    }
  }, [isOpen, selectedParticipants])

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

  const handleConfirm = async () => {
    // 判断是否需要调用后端接口：
    // 检查 selectedParticipants 中是否有后端返回的真实 ID（不是 participant- 开头的临时ID）
    const hasRealParticipants = selectedParticipants.some(p => !p.id.startsWith('participant-'))
    
    // 如果没有真实参会人员，说明还未提交到后端，仅保存到本地状态
    if (!hasRealParticipants) {
      const newParticipants: MeetingParticipant[] = []
      
      // 保留临时人员（不受影响）
      const tempParticipants = selectedParticipants.filter(p => p.userId?.startsWith('temp'))

      // 添加组织架构人员（根据 tempSelectedUsers）
      tempSelectedUsers.forEach(user => {
        newParticipants.push({
          id: `participant-${Date.now()}-${Math.random()}`,
          meetingId: meetingId || '',
          participantType: 'internal',
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
      })

      // 添加新导入的临时人员
      tempImportedParticipants.forEach(temp => {
        newParticipants.push({
          id: `participant-${Date.now()}-${Math.random()}`,
          meetingId: meetingId || '',
          participantType: 'temporary',
          userId: `temp-${Date.now()}-${Math.random()}`,
          userName: temp.name,
          name: temp.name,
          email: temp.email,
          department: temp.department,
          securityLevel: temp.securityLevel || 'unclassified',
          role: 'participant',
          status: 'invited',
          createdAt: new Date().toISOString()
        })
      })

      // 合并：临时人员 + 组织架构人员
      onParticipantsChange([...tempParticipants, ...newParticipants])
      
      // 重置状态
      setTempSelectedUsers([])
      setTempImportedParticipants([])
      onClose()
      return
    }

    // 如果有真实参会人员，说明已提交到后端，需要调用接口添加/删除
    if (!meetingId) {
      showError('错误', '会议ID不存在')
      return
    }

    try {
      setIsSubmitting(true)

      // 找出需要删除的人员（原有的组织架构人员中，不在 tempSelectedUsers 中的）
      const existingOrgParticipants = selectedParticipants.filter(p => !p.userId?.startsWith('temp'))
      const existingOrgUserIds = existingOrgParticipants.map(p => p.userId)
      const newSelectedUserIds = tempSelectedUsers.map(u => u.id)
      const toDelete = existingOrgParticipants.filter(
        p => !newSelectedUserIds.includes(p.userId)
      )

      // 找出需要添加的人员（tempSelectedUsers 中，不在原有列表中的）
      const toAdd = tempSelectedUsers.filter(u => !existingOrgUserIds.includes(u.id))

      // 构建请求数据
      const participantsToAdd: CreateParticipantItemRequest[] = []

      // 添加组织架构人员
      toAdd.forEach(user => {
        participantsToAdd.push({
          user_id: user.id,
          user_name: user.username,
          name: user.name || user.username,
          email: user.email,
          department: user.department,
          security_level: user.securityLevel,
          role: 'participant'
        })
      })

      // 添加临时人员（user_id传空字符串）
      tempImportedParticipants.forEach(temp => {
        participantsToAdd.push({
          user_id: '',  // 临时人员user_id传空
          user_name: temp.name,
          name: temp.name,
          email: temp.email || '',
          department: temp.department || '外部',
          security_level: temp.securityLevel || 'unclassified',
          password: temp.password,
          role: 'participant'
        })
      })

      // 执行删除操作
      if (toDelete.length > 0) {
        await Promise.all(
          toDelete.map(p => participantApi.deleteParticipant(meetingId, p.id))
        )
      }

      // 执行添加操作
      let addedParticipants: MeetingParticipant[] = []
      if (participantsToAdd.length > 0) {
        addedParticipants = await participantApi.batchCreateParticipants(meetingId, {
          participants: participantsToAdd
        })

        // 标记哪些是临时人员
        addedParticipants = addedParticipants.map(p => {
          const isTemp = p.userId?.startsWith('temp')
          return {
            ...p,
            participantType: isTemp ? 'temporary' as const : 'internal' as const
          }
        })
      }

      // 更新本地状态：移除被删除的 + 添加新增的
      const remaining = selectedParticipants.filter(
        p => !toDelete.some(d => d.id === p.id)
      )
      onParticipantsChange([...remaining, ...addedParticipants])

      const message = []
      if (toDelete.length > 0) message.push(`删除 ${toDelete.length} 人`)
      if (addedParticipants.length > 0) message.push(`添加 ${addedParticipants.length} 人`)
      showSuccess('操作成功', message.join('，'))
      
      // 重置状态
      setTempSelectedUsers([])
      setTempImportedParticipants([])
      onClose()
    } catch (error) {
      console.error('Failed to update participants:', error)
      showError('操作失败', '无法更新参会人员，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setTempSelectedUsers([])
    setTempImportedParticipants([])
    onClose()
  }

  // 计算待添加人员：只显示新增的，不显示已存在的
  const existingOrgUserIds = selectedParticipants
    .filter(p => !p.userId?.startsWith('temp'))
    .map(p => p.userId)
  
  const newlySelectedUsers = tempSelectedUsers.filter(
    user => !existingOrgUserIds.includes(user.id)
  )
  
  const totalSelected = newlySelectedUsers.length + tempImportedParticipants.length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <Card 
        animate="scaleIn" 
        className="w-[1100px] h-[700px] flex flex-col shadow-2xl"
      >
        {/* 头部 */}
        <CardHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">添加参会人员</h3>
            <button
              onClick={handleCancel}
              className="text-text-tertiary hover:text-text-secondary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>

        {/* Tab切换 */}
        <div className="border-b border-border">
          <div className="flex">
            <button
              onClick={() => setActiveTab('org')}
              className={`
                flex-1 px-4 py-3 text-sm font-medium transition-colors
                ${activeTab === 'org'
                  ? 'text-primary border-b-2 border-primary bg-primary/10'
                  : 'text-text-secondary hover:text-text-primary hover:bg-muted'
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
                  ? 'text-primary border-b-2 border-primary bg-primary/10'
                  : 'text-text-secondary hover:text-text-primary hover:bg-muted'
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
          <div className="flex-1 border-r border-border overflow-hidden">
            {activeTab === 'org' && (
              <UserSelector
                mode="multiple"
                value={tempSelectedUsers}
                onChange={handleOrgUsersChange}
                showSecurityLevel={true}
                enableSearch={true}
                systemSecurityLevel={systemSecurityLevel}
              />
            )}
            
            {activeTab === 'temp' && (
              <TemporaryParticipantImporter
                onImport={handleTempImport}
                systemSecurityLevel={systemSecurityLevel}
              />
            )}
          </div>

          {/* 右侧：待添加人员列表 */}
          <div className="w-80 flex flex-col bg-bg-container">
            <CardHeader className="p-4 border-b bg-bg-card">
              <div className="text-sm font-medium text-text-secondary">
                待添加人员 ({totalSelected}人)
              </div>
            </CardHeader>
            
            <div className="flex-1 overflow-y-auto p-4">
              {totalSelected === 0 ? (
                <div className="text-center py-8 text-text-tertiary text-sm">
                  暂无待添加人员
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {/* 组织架构人员 - 只显示新增的 */}
                  {newlySelectedUsers.map(user => {
                    const securityLevel = securityLevels.find(s => s.value === user.securityLevel)
                    const securityColorMap: Record<string, string> = {
                      'internal': 'bg-green-500',
                      'confidential': 'bg-yellow-500',
                      'secret': 'bg-red-500'
                    }
                    const securityColor = securityColorMap[user.securityLevel] || 'bg-gray-500'
                    return (
                      <span
                        key={user.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-white text-gray-700 border border-gray-300"
                      >
                        <span>{user.name}</span>
                        {securityLevel && (
                          <span className={`text-xs px-1.5 py-0.5 rounded text-white ${securityColor}`}>
                            {securityLevel.name}
                          </span>
                        )}
                        <button
                          onClick={() => handleRemoveTempUser(user.id)}
                          className="hover:text-gray-900 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )
                  })}
                  
                  {/* 临时人员 */}
                  {tempImportedParticipants.map((participant, index) => {
                    const securityLevel = securityLevels.find(s => s.value === participant.securityLevel)
                    const securityColorMap: Record<string, string> = {
                      'internal': 'bg-green-500',
                      'confidential': 'bg-yellow-500',
                      'secret': 'bg-red-500'
                    }
                    const securityColor = securityColorMap[participant.securityLevel || ''] || 'bg-gray-500'
                    return (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-white text-gray-700 border border-dashed border-gray-400"
                      >
                        <span>{participant.name}</span>
                        {securityLevel && (
                          <span className={`text-xs px-1.5 py-0.5 rounded text-white ${securityColor}`}>
                            {securityLevel.name}
                          </span>
                        )}
                        <button
                          onClick={() => handleRemoveTempParticipant(index)}
                          className="hover:text-gray-900 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <CardFooter className="p-4 border-t">
          <div className="flex items-center justify-end gap-2 w-full">
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
        </CardFooter>
      </Card>
    </div>
  )
}

export default AddParticipantModal
