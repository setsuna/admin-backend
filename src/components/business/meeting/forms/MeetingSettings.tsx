import React, { useState } from 'react'
import { Lock, Clock, Info } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface MeetingSettingsProps {
  password: string
  expiryType: 'none' | 'today' | 'custom'
  expiryDate: string
  signInType: 'none' | 'manual' | 'password'
  onPasswordChange: (password: string) => void
  onExpiryTypeChange: (type: 'none' | 'today' | 'custom') => void
  onExpiryDateChange: (date: string) => void
  readOnly?: boolean
}

const MeetingSettings: React.FC<MeetingSettingsProps> = ({
  password,
  expiryType,
  expiryDate,
  signInType,
  onPasswordChange,
  onExpiryTypeChange,
  onExpiryDateChange,
  readOnly = false
}) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showExpiryModal, setShowExpiryModal] = useState(false)

  // 🎯 问题1修复：格式化过期日期，只显示年月日
  const formatExpiryDate = (date: string): string => {
    if (!date) return ''
    // 如果是完整的ISO格式（2025-10-25T23:59:59+08:00），只取日期部分
    if (date.includes('T')) {
      return date.split('T')[0]
    }
    // 如果已经是日期格式（2025-10-25），直接返回
    return date
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">会议设置</label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => !readOnly && setShowPasswordModal(true)}
            disabled={readOnly}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg border transition-colors ${
              password 
                ? 'border-primary bg-primary/10 text-primary' 
                : signInType === 'password' 
                  ? 'border-error/30 bg-error/10 text-error' 
                  : 'border-border hover:border-muted-foreground/20'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            {password ? '密码: ***' : '会议密码'}
          </button>
          <button
            onClick={() => !readOnly && setShowExpiryModal(true)}
            disabled={readOnly}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg border transition-colors ${
              expiryType !== 'none' 
                ? 'border-primary bg-primary/10 text-primary' 
                : 'border-border hover:border-muted-foreground/20'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            {expiryType === 'none' ? '有效期' : 
                 expiryType === 'today' ? '当天过期' : `过期时间 ${formatExpiryDate(expiryDate)}`}
          </button>
        </div>
        {signInType === 'password' && !password && (
          <div className="flex items-start gap-1.5">
            <Info className="h-3.5 w-3.5 text-error flex-shrink-0 mt-0.5" />
            <p className="text-xs text-error">
              选择密码签到时，需要设置会议密码
            </p>
          </div>
        )}
      </div>

      {/* 密码设置弹窗 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-elevated rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">设置会议密码</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">会议密码</label>
              <Input
                type="text"
                value={password}
                onChange={(e) => {
                  const value = e.target.value
                  // 🔧 修复：只允许输入6位数字
                  if (/^\d{0,6}$/.test(value)) {
                    onPasswordChange(value)
                  }
                }}
                placeholder="请输入6位数字密码"
                maxLength={6}
              />
              <p className="text-xs text-text-regular mt-1">只能输入6位数字，设置后需要密码才能进入会议</p>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-elevated rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">设置会议有效期</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">有效期选择</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="expiryType"
                    value="none"
                    checked={expiryType === 'none'}
                    onChange={(e) => onExpiryTypeChange(e.target.value as 'none')}
                    className="mr-2"
                  />
                  无限制
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="expiryType"
                    value="today"
                    checked={expiryType === 'today'}
                    onChange={(e) => onExpiryTypeChange(e.target.value as 'today')}
                    className="mr-2"
                  />
                  当天
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="expiryType"
                    value="custom"
                    checked={expiryType === 'custom'}
                    onChange={(e) => onExpiryTypeChange(e.target.value as 'custom')}
                    className="mr-2"
                  />
                  自定义
                </label>
              </div>
              {expiryType === 'custom' && (
                <div className="mt-3">
                  <Input
                    type="date"
                    value={formatExpiryDate(expiryDate)}
                    onChange={(e) => onExpiryDateChange(e.target.value)}
                  />
                </div>
              )}
              <p className="text-xs text-text-regular mt-2">设置后会议会在指定日期后自动销毁</p>
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

export default MeetingSettings
