import React from 'react'
import type { MeetingType } from '@/types'

const typeConfig = {
  standard: { label: '标准会议', icon: '👥' },
  tablet: { label: '平板会议', icon: '📱' }
}

interface MeetingTypeSelectProps {
  value: MeetingType
  onChange: (type: MeetingType) => void
  signInType: 'none' | 'manual' | 'password'
  onSignInTypeChange: (type: 'none' | 'manual' | 'password') => void
  readOnly?: boolean
}

const MeetingTypeSelect: React.FC<MeetingTypeSelectProps> = ({
  value,
  onChange,
  signInType,
  onSignInTypeChange,
  readOnly = false
}) => {
  const handleSignInTypeToggle = () => {
    if (readOnly) return
    const signInTypes = ['none', 'manual', 'password'] as const
    const currentIndex = signInTypes.indexOf(signInType)
    const nextIndex = (currentIndex + 1) % signInTypes.length
    onSignInTypeChange(signInTypes[nextIndex])
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* 会议类型 */}
      <div>
        <label className="block text-sm font-medium mb-1">
          会议类型 <span className="text-red-500">*</span>
        </label>
        <div className="space-y-1">
          <div className="flex gap-2">
            {(Object.entries(typeConfig) as [MeetingType, typeof typeConfig.standard][]).map(([type, config]) => (
              <button
                key={type}
                onClick={() => !readOnly && onChange(type)}
                disabled={readOnly}
                className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg border transition-colors ${
                  value === type
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                } ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <span>{config.icon}</span>
                {config.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 leading-tight">
            {value === 'standard' 
              ? '需要指定与会人员，材料按人员权限分发'
              : '所有平板显示相同材料，无需指定与会人员'
            }
          </p>
        </div>
      </div>
      
      {/* 签到方式 */}
      <div>
        <label className="block text-sm font-medium mb-1">签到方式</label>
        <button
          onClick={handleSignInTypeToggle}
          disabled={readOnly}
          className={`px-2 py-1 text-xs rounded-lg border transition-colors ${
            signInType === 'none'
              ? 'border-green-500 bg-green-50 text-green-700'
              : signInType === 'manual'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-orange-500 bg-orange-50 text-orange-700'
          } ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {signInType === 'none' && '免签'}
          {signInType === 'manual' && '手写签到'}
          {signInType === 'password' && '密码签到'}
        </button>
      </div>
    </div>
  )
}

export default MeetingTypeSelect
