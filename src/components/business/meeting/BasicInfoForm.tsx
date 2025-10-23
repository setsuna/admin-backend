import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { MeetingSecurityLevel, MeetingType, MeetingParticipant } from '@/types'

type MeetingCategory = { name: string; value: string }
type SecurityLevel = { value: string; label: string; color: string }

// 导入子组件
import MeetingTypeSelect from './forms/MeetingTypeSelect'
import MeetingSettings from './forms/MeetingSettings'
import ParticipantSelector from './forms/ParticipantSelector'

// 🔧 修复：支持中文输入法的 Input 组件
interface ChineseInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
}

const ChineseInput: React.FC<ChineseInputProps> = ({ value, onChange, placeholder, maxLength }) => {
  const isComposing = useRef(false)

  const handleCompositionStart = () => {
    isComposing.current = true
  }

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposing.current = false
    const newValue = (e.target as HTMLInputElement).value
    if (!maxLength || newValue.length <= maxLength) {
      onChange(newValue)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 只在非组合状态下才更新
    if (!isComposing.current) {
      const newValue = e.target.value
      if (!maxLength || newValue.length <= maxLength) {
        onChange(newValue)
      }
    }
  }

  return (
    <Input
      value={value}
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      placeholder={placeholder}
      maxLength={maxLength}
    />
  )
}

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
    organizer: string  // 新增
    host: string       // 新增
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
      // TODO: 从后端 API 获取数据
      const categoriesData: MeetingCategory[] = [
        { name: '部门例会', value: 'department' },
        { name: '项目会议', value: 'project' },
        { name: '全体会议', value: 'all' }
      ]
      const securityData: SecurityLevel[] = [
        { value: 'internal', label: '内部', color: 'bg-green-600' },
        { value: 'confidential', label: '秘密', color: 'bg-yellow-600' },
        { value: 'secret', label: '机密', color: 'bg-red-600' }
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
        <div className="text-sm text-gray-500">加载配置中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 会议名称 */}
      <div>
        <label className="block text-sm font-medium mb-1">
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
        <label className="block text-sm font-medium mb-1">会议密级 <span className="text-red-500">*</span></label>
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
      <div>
        <div className="grid grid-cols-2 gap-3">
          {/* 开始时间 */}
          <div>
            <div className="text-xs text-gray-500 mb-1">开始时间</div>
            <div className="flex gap-1">
              <Input
                type="date"
                value={formData.startTime.split('T')[0]}
                onChange={(e) => {
                  const date = e.target.value
                  const time = formData.startTime.split('T')[1] || '09:00'
                  onFormDataChange('startTime', `${date}T${time}`)
                }}
                className="flex-1 text-xs"
              />
              <Input
                type="time"
                value={formData.startTime.split('T')[1] || '09:00'}
                onChange={(e) => {
                  const date = formData.startTime.split('T')[0]
                  const time = e.target.value
                  onFormDataChange('startTime', `${date}T${time}`)
                }}
                className="w-20 text-xs"
              />
            </div>
          </div>
          
          {/* 结束时间 */}
          <div>
            <div className="text-xs text-gray-500 mb-1">结束时间</div>
            <div className="flex gap-1">
              <Input
                type="date"
                value={formData.endTime.split('T')[0]}
                onChange={(e) => {
                  const date = e.target.value
                  const time = formData.endTime.split('T')[1] || '10:00'
                  onFormDataChange('endTime', `${date}T${time}`)
                }}
                className="flex-1 text-xs"
              />
              <Input
                type="time"
                value={formData.endTime.split('T')[1] || '10:00'}
                onChange={(e) => {
                  const date = formData.endTime.split('T')[0]
                  const time = e.target.value
                  onFormDataChange('endTime', `${date}T${time}`)
                }}
                className="w-20 text-xs"
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
      />

      {/* 参会人员 - 仅标准会议显示 */}
      <ParticipantSelector
        participants={formData.participants}
        onOpenSelector={onOpenOrgSelector}
        onRemoveParticipant={onRemoveParticipant}
        isVisible={formData.type === 'standard'}
      />

      {/* 会议地点和组织单位 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">会议地点</label>
          <ChineseInput
            value={formData.location || ''}
            onChange={(value) => onFormDataChange('location', value)}
            placeholder="请输入会议地点"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">组织单位</label>
          <ChineseInput
            value={formData.organizer || ''}
            onChange={(value) => onFormDataChange('organizer', value)}
            placeholder="请输入组织单位"
            maxLength={15}
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
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">会议主持</label>
          <ChineseInput
            value={formData.host || ''}
            onChange={(value) => onFormDataChange('host', value)}
            placeholder="请输入主持人"
            maxLength={10}
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  )
}

export default BasicInfoForm
