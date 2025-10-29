import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Tablet } from 'lucide-react'
import { meetingApi } from '@/services/api/meeting.api'
import { useNotifications } from '@/hooks/useNotifications'
import type { MeetingType } from '@/types'

const typeConfig = {
  standard: { label: '标准会议', icon: Users },
  tablet: { label: '平板会议', icon: Tablet }
}

interface MeetingTypeSelectProps {
  value: MeetingType
  onChange: (type: MeetingType) => void
  signInType: 'none' | 'manual' | 'password'
  onSignInTypeChange: (type: 'none' | 'manual' | 'password') => void
  meetingId?: string  // 会议ID，用于调用API
  mode?: 'create' | 'edit' | 'view'  // 模式
  readOnly?: boolean
}

const MeetingTypeSelect: React.FC<MeetingTypeSelectProps> = ({
  value,
  onChange,
  signInType,
  onSignInTypeChange,
  meetingId,
  mode,
  readOnly = false
}) => {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useNotifications()

  // 切换会议类型的 mutation
  const updateTypeMutation = useMutation({
    mutationFn: (type: MeetingType) => meetingApi.updateMeetingType(meetingId!, type),
    onSuccess: (updatedMeeting) => {
      // 类型安全的标签获取
      const typeLabel = (updatedMeeting.type === 'standard' || updatedMeeting.type === 'tablet')
        ? typeConfig[updatedMeeting.type].label
        : '未知类型'
      showSuccess('成功', `会议类型已切换为「${typeLabel}」`)
      // 更新缓存
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] })
      queryClient.invalidateQueries({ queryKey: ['meeting-participants', meetingId] })
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || '切换会议类型失败'
      showError('失败', message)
    }
  })

  const handleTypeChange = async (type: MeetingType) => {
    if (readOnly || value === type) return

    // 先更新本地状态
    onChange(type)

    // 如果有 meetingId，调用 API 同步到后端
    if (meetingId && (mode === 'create' || mode === 'edit')) {
      await updateTypeMutation.mutateAsync(type)
    }
  }

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
          会议类型 <span className="text-error">*</span>
        </label>
        <div className="space-y-1">
          <div className="flex gap-2">
            {(Object.entries(typeConfig) as [MeetingType, typeof typeConfig.standard][]).map(([type, config]) => {
              const Icon = config.icon
              return (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  disabled={readOnly || updateTypeMutation.isPending}
                  className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg border transition-colors ${
                    value === type
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-muted-foreground/20'
                  } ${readOnly || updateTypeMutation.isPending ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {config.label}
                  {updateTypeMutation.isPending && value !== type && (
                    <span className="ml-1 text-xs text-text-tertiary">切换中...</span>
                  )}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-text-regular leading-tight">
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
              ? 'border-success bg-success/10 text-success'
              : signInType === 'manual'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-warning bg-warning/10 text-warning'
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
