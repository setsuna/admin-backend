import React, { useState, useEffect } from 'react'
import { Input, Button } from '@/components'
import { X } from 'lucide-react'
import { mockApi, type MeetingCategory, type SecurityLevel } from '@/services/mockApi'
import type { MeetingSecurityLevel, MeetingType, MeetingParticipant } from '@/types'

const typeConfig = {
  standard: { label: '标准会议', icon: '👥' },
  tablet: { label: '平板会议', icon: '📱' }
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
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showExpiryModal, setShowExpiryModal] = useState(false)

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

  const handleTypeChange = (type: MeetingType) => {
    onFormDataChange('type', type)
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

      {/* 会议类别 */}
      <div>
        <label className="block text-sm font-medium mb-2">会议类别</label>
        <select
          value={formData.category}
          onChange={(e) => onFormDataChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
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
      <div>
        <label className="block text-sm font-medium mb-2">
          会议类型 <span className="text-red-500">*</span>
        </label>
        <div className="flex justify-between">
          <div>
            <div className="flex gap-2">
              {(Object.entries(typeConfig) as [MeetingType, typeof typeConfig.standard][]).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg border transition-colors ${
                    formData.type === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span>{config.icon}</span>
                  {config.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-900 mb-1 text-right">签到方式</div>
            <button
              onClick={() => {
                const signInTypes = ['none', 'manual', 'password'] as const
                const currentIndex = signInTypes.indexOf(formData.signInType as any)
                const nextIndex = (currentIndex + 1) % signInTypes.length
                onFormDataChange('signInType', signInTypes[nextIndex])
              }}
              className={`px-2 py-1 text-xs rounded-lg border transition-colors ${
                formData.signInType === 'none'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : formData.signInType === 'manual'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-orange-500 bg-orange-50 text-orange-700'
              }`}
            >
              {formData.signInType === 'none' && '免签'}
              {formData.signInType === 'manual' && '手写签到'}
              {formData.signInType === 'password' && '密码签到'}
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {formData.type === 'standard' 
            ? '需要指定与会人员，材料按人员权限分发'
            : '所有平板显示相同材料，无需指定与会人员'
          }
        </p>
      </div>

      {/* 参会人员 - 仅标准会议显示 */}
      {formData.type === 'standard' && (
        <div>
          <label className="block text-sm font-medium mb-2">
            参会人员 <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {/* 已添加的人员 */}
            <div 
              className="min-h-[60px] max-h-[200px] overflow-y-auto p-3 border border-gray-300 rounded-md bg-gray-50 cursor-pointer hover:border-gray-400 transition-colors"
              onClick={onOpenOrgSelector}
            >
              {formData.participants.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.participants.map((participant) => (
                    <span
                      key={participant.id}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {participant.name}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemoveParticipant(participant.id)
                        }}
                        className="hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500 text-sm">点击选择参会人员...</span>
              )}
            </div>
          </div>
        </div>
      )}

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
      <div>
        <label className="block text-sm font-medium mb-2">会议设置</label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPasswordModal(true)}
            className={formData.password ? 'border-blue-500 text-blue-700' : ''}
          >
            🔐 {formData.password ? '密码: ***' : '会议密码'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowExpiryModal(true)}
            className={formData.expiryType !== 'none' ? 'border-blue-500 text-blue-700' : ''}
          >
            ⏰ {formData.expiryType === 'none' ? '有效期' : 
                 formData.expiryType === 'today' ? '当天过期' : formData.expiryDate}
          </Button>
        </div>
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

      {/* 密码设置弹窗 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">设置会议密码</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">会议密码</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => onFormDataChange('password', e.target.value)}
                placeholder="请输入6位数字密码"
                maxLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">设置后需要密码才能进入会议</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
                取消
              </Button>
              <Button onClick={() => setShowPasswordModal(false)}>
                确定
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 有效期设置弹窗 */}
      {showExpiryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">设置会议有效期</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">有效期选择</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="expiryType"
                    value="none"
                    checked={formData.expiryType === 'none'}
                    onChange={(e) => onFormDataChange('expiryType', e.target.value)}
                    className="mr-2"
                  />
                  无限制
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="expiryType"
                    value="today"
                    checked={formData.expiryType === 'today'}
                    onChange={(e) => onFormDataChange('expiryType', e.target.value)}
                    className="mr-2"
                  />
                  当天
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="expiryType"
                    value="custom"
                    checked={formData.expiryType === 'custom'}
                    onChange={(e) => onFormDataChange('expiryType', e.target.value)}
                    className="mr-2"
                  />
                  自定义
                </label>
              </div>
              {formData.expiryType === 'custom' && (
                <div className="mt-3">
                  <Input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => onFormDataChange('expiryDate', e.target.value)}
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">设置后会议会在指定日期后自动销毁</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowExpiryModal(false)}>
                取消
              </Button>
              <Button onClick={() => setShowExpiryModal(false)}>
                确定
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BasicInfoForm
