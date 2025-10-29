import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { MeetingSecurityLevel, MeetingType, MeetingParticipant } from '@/types'

type MeetingCategory = { name: string; value: string }
type SecurityLevel = { value: string; label: string; color: string }

// 导入子组件
import MeetingTypeSelect from './forms/MeetingTypeSelect'
import MeetingSettings from './forms/MeetingSettings'
import ParticipantSelector from './forms/ParticipantSelector'


interface BasicInfoFormProps {
  formData: {
    name: string
    securityLevel: MeetingSecurityLevel
    category: string
    startTime: string
    endTime: string
    type: MeetingType
    description: string
    participants: MeetingParticipant[]
    password: string
    expiryType: 'none' | 'today' | 'custom'
    expiryDate: string
    signInType: 'none' | 'manual' | 'password'
    location: string
    organizer: string
    host: string
  }
  onFormDataChange: (field: string, value: any) => void
  onOpenOrgSelector: () => void
  onRemoveParticipant: (id: string) => void
  meetingId?: string  // 会议ID
  mode?: 'create' | 'edit' | 'view'  // 模式
  readOnly?: boolean
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  formData,
  onFormDataChange,
  onOpenOrgSelector,
  onRemoveParticipant,
  meetingId,
  mode,
  readOnly = false
}) => {
  const [categories, setCategories] = useState<MeetingCategory[]>([])
  const [securityLevels, setSecurityLevels] = useState<SecurityLevel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOptions()
  }, [])

  const loadOptions = async () => {
    try {
      setLoading(true)
      // TODO: 从后端 API 获取数据
      const categoriesData: MeetingCategory[] = [
        { name: '部门例会', value: 'department' },
        { name: '项目会议', value: 'project' },
        { name: '全体会议', value: 'all' }
      ]
      const securityData: SecurityLevel[] = [
        { value: 'internal', label: '内部', color: 'bg-success' },
        { value: 'confidential', label: '秘密', color: 'bg-warning' },
        { value: 'secret', label: '机密', color: 'bg-error' }
      ]
      setCategories(categoriesData)
      setSecurityLevels(securityData)
    } catch (error) {
      console.error('Load options failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSecurityLevelChange = (level: MeetingSecurityLevel) => {
    onFormDataChange('securityLevel', level)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-text-regular">加载配置中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 会议名称 */}
      <div>
        <label className="block text-sm font-medium mb-1">
          会议名称 <span className="text-error">*</span>
        </label>
        <Input
          value={formData.name}
          onChange={(e) => onFormDataChange('name', e.target.value)}
          placeholder="请输入会议名称"
          disabled={readOnly}
        />
      </div>

      {/* 会议密级 */}
      <div>
        <label className="block text-sm font-medium mb-1">会议密级 <span className="text-error">*</span></label>
        <div className="flex gap-2">
          {securityLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => !readOnly && handleSecurityLevelChange(level.value as MeetingSecurityLevel)}
              disabled={readOnly}
              className={`px-2 py-1 text-xs rounded-md text-text-inverse transition-colors ${level.color} ${
                formData.securityLevel === level.value ? 'ring-2 ring-offset-2 ring-border' : ''
              } ${readOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* 会议时间 */}
      <div>
        <div className="grid grid-cols-2 gap-3">
          {/* 开始时间 */}
          <div>
            <div className="text-xs text-text-regular mb-1">开始时间</div>
            <div className="flex gap-1">
              <Input
                type="date"
                value={formData.startTime.split('T')[0]}
                onChange={(e) => {
                  const date = e.target.value
                  const time = formData.startTime.split('T')[1] || '09:00'
                  onFormDataChange('startTime', `${date}T${time}`)
                }}
                className="w-32 text-xs"
                disabled={readOnly}
              />
              <Input
                type="time"
                value={formData.startTime.split('T')[1] || '09:00'}
                onChange={(e) => {
                  const date = formData.startTime.split('T')[0]
                  const time = e.target.value
                  onFormDataChange('startTime', `${date}T${time}`)
                }}
                className="w-24 text-xs"
                disabled={readOnly}
              />
            </div>
          </div>
          
          {/* 结束时间 */}
          <div>
            <div className="text-xs text-text-regular mb-1">结束时间</div>
            <div className="flex gap-1">
              <Input
                type="date"
                value={formData.endTime.split('T')[0]}
                onChange={(e) => {
                  const date = e.target.value
                  const time = formData.endTime.split('T')[1] || '10:00'
                  onFormDataChange('endTime', `${date}T${time}`)
                }}
                className="w-32 text-xs"
                disabled={readOnly}
              />
              <Input
                type="time"
                value={formData.endTime.split('T')[1] || '10:00'}
                onChange={(e) => {
                  const date = formData.endTime.split('T')[0]
                  const time = e.target.value
                  onFormDataChange('endTime', `${date}T${time}`)
                }}
                className="w-24 text-xs"
                disabled={readOnly}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 会议类型和签到方式 */}
      <MeetingTypeSelect
        value={formData.type}
        onChange={(type) => onFormDataChange('type', type)}
        signInType={formData.signInType}
        onSignInTypeChange={(signInType) => onFormDataChange('signInType', signInType)}
        meetingId={meetingId}
        mode={mode}
        readOnly={readOnly}
      />

      {/* 参会人员 - 仅标准会议显示 */}
      <ParticipantSelector
        participants={formData.participants}
        onOpenSelector={onOpenOrgSelector}
        onRemoveParticipant={onRemoveParticipant}
        isVisible={formData.type === 'standard'}
        readOnly={readOnly}
      />

      {/* 会议地点和组织单位 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">会议地点</label>
          <Input
            value={formData.location || ''}
            onChange={(e) => onFormDataChange('location', e.target.value)}
            placeholder="请输入会议地点"
            disabled={readOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">组织单位</label>
          <Input
            value={formData.organizer || ''}
            onChange={(e) => {
              const value = e.target.value
              if (value.length <= 15) {
                onFormDataChange('organizer', value)
              }
            }}
            placeholder="请输入组织单位"
            maxLength={15}
            disabled={readOnly}
          />
        </div>
      </div>

      {/* 会议设置 */}
      <MeetingSettings
        password={formData.password}
        expiryType={formData.expiryType}
        expiryDate={formData.expiryDate}
        signInType={formData.signInType}
        onPasswordChange={(password) => onFormDataChange('password', password)}
        onExpiryTypeChange={(expiryType) => onFormDataChange('expiryType', expiryType)}
        onExpiryDateChange={(expiryDate) => onFormDataChange('expiryDate', expiryDate)}
        readOnly={readOnly}
      />

      {/* 会议类别和会议主持 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">会议类别</label>
          <Select
            value={formData.category}
            onValueChange={(value) => onFormDataChange('category', value)}
            options={categories.map(category => ({
              value: category.name,
              label: category.name
            }))}
            className="w-full"
            disabled={readOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">会议主持</label>
          <Input
            value={formData.host || ''}
            onChange={(e) => {
              const value = e.target.value
              if (value.length <= 10) {
                onFormDataChange('host', value)
              }
            }}
            placeholder="请输入主持人"
            maxLength={15}
            disabled={readOnly}
          />
        </div>
      </div>

      {/* 会议介绍 */}
      <div>
        <label className="block text-sm font-medium mb-1">会议介绍</label>
        <textarea
          value={formData.description}
          onChange={(e) => onFormDataChange('description', e.target.value)}
          placeholder="请输入会议介绍..."
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={readOnly}
        />
      </div>
    </div>
  )
}

export default BasicInfoForm
