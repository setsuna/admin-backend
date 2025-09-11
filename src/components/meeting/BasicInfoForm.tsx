import React, { useState, useEffect } from 'react'
import { Input, Select } from '@/components'
import { mockApi, type MeetingCategory, type SecurityLevel } from '@/services/mockApi'
import type { MeetingSecurityLevel, MeetingType, MeetingParticipant } from '@/types'

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
  }
  onFormDataChange: (field: string, value: any) => void
  onOpenOrgSelector: () => void
  onRemoveParticipant: (id: string) => void
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  formData,
  onFormDataChange,
  onOpenOrgSelector,
  onRemoveParticipant
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
      const [categoriesData, securityData] = await Promise.all([
        mockApi.getMeetingCategories(),
        mockApi.getSecurityLevels()
      ])
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
        <div className="text-sm text-gray-500">加载配置中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 会议名称 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          会议名称 <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.name}
          onChange={(e) => onFormDataChange('name', e.target.value)}
          placeholder="请输入会议名称"
        />
      </div>

      {/* 会议密级 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          会议密级 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {securityLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => handleSecurityLevelChange(level.value as MeetingSecurityLevel)}
              className={`px-2 py-1 text-xs rounded-md text-white transition-colors ${level.color} ${
                formData.securityLevel === level.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* 会议时间 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">开始时间</label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={formData.startTime.split('T')[0]}
              onChange={(e) => {
                const date = e.target.value
                const time = formData.startTime.split('T')[1] || '09:00'
                onFormDataChange('startTime', `${date}T${time}`)
              }}
              className="flex-1"
            />
            <Input
              type="time"
              value={formData.startTime.split('T')[1] || '09:00'}
              onChange={(e) => {
                const date = formData.startTime.split('T')[0]
                const time = e.target.value
                onFormDataChange('startTime', `${date}T${time}`)
              }}
              className="w-32"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">结束时间</label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={formData.endTime.split('T')[0]}
              onChange={(e) => {
                const date = e.target.value
                const time = formData.endTime.split('T')[1] || '10:00'
                onFormDataChange('endTime', `${date}T${time}`)
              }}
              className="flex-1"
            />
            <Input
              type="time"
              value={formData.endTime.split('T')[1] || '10:00'}
              onChange={(e) => {
                const date = formData.endTime.split('T')[0]
                const time = e.target.value
                onFormDataChange('endTime', `${date}T${time}`)
              }}
              className="w-32"
            />
          </div>
        </div>
      </div>

      {/* 会议类型和签到方式 */}
      <MeetingTypeSelect
        value={formData.type}
        onChange={(type) => onFormDataChange('type', type)}
        signInType={formData.signInType}
        onSignInTypeChange={(signInType) => onFormDataChange('signInType', signInType)}
      />

      {/* 参会人员 - 仅标准会议显示 */}
      <ParticipantSelector
        participants={formData.participants}
        onOpenSelector={onOpenOrgSelector}
        onRemoveParticipant={onRemoveParticipant}
        isVisible={formData.type === 'standard'}
      />

      {/* 会议地点 */}
      <div>
        <label className="block text-sm font-medium mb-2">会议地点</label>
        <Input
          value={formData.location || ''}
          onChange={(e) => onFormDataChange('location', e.target.value)}
          placeholder="请输入会议地点"
        />
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
      />

      {/* 会议类别 */}
      <div>
        <label className="block text-sm font-medium mb-2">会议类别</label>
        <Select
          value={formData.category}
          onChange={(e) => onFormDataChange('category', e.target.value)}
          options={categories.map(category => ({
            value: category.name,
            label: category.name
          }))}
          size="sm"
          className="w-40"
        />
      </div>

      {/* 会议介绍 */}
      <div>
        <label className="block text-sm font-medium mb-2">会议介绍</label>
        <textarea
          value={formData.description}
          onChange={(e) => onFormDataChange('description', e.target.value)}
          placeholder="请输入会议介绍..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  )
}

export default BasicInfoForm
