import React, { useState, useEffect } from 'react'
import { Button } from './Button'
import { Input } from './Input'
import { Plus, X } from 'lucide-react'
import { useSecurityLevels } from '@/hooks/useSecurityLevels'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './Dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './SelectNew'
import { Checkbox } from './CheckboxNew'
import SecurityLevelSelect from './SecurityLevelSelect'
import type { VoteType, VoteOption, MeetingSecurityLevel } from '@/types'

interface AddVoteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (data: {
    title: string
    voteType: VoteType
    options: VoteOption[]
    isAnonymous: boolean
    allowMultiple?: boolean
    securityLevel: MeetingSecurityLevel | null
  }) => void
  systemSecurityLevel?: 'confidential' | 'secret'
  initialData?: {
    title: string
    voteType: VoteType
    options: VoteOption[]
    isAnonymous: boolean
    allowMultiple?: boolean
    securityLevel: MeetingSecurityLevel | null
  }
}

const SIMPLE_VOTE_OPTIONS: VoteOption[] = [
  { id: 'agree', label: '赞成', value: 'agree', orderNum: 0 },
  { id: 'disagree', label: '反对', value: 'disagree', orderNum: 1 },
  { id: 'abstain', label: '弃权', value: 'abstain', orderNum: 2 }
]

export const AddVoteModal: React.FC<AddVoteModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
  initialData
}) => {
  const { securityLevels } = useSecurityLevels()
  const [title, setTitle] = useState('')
  const [voteType, setVoteType] = useState<VoteType>('simple')
  const [customOptions, setCustomOptions] = useState<VoteOption[]>([
    { id: '1', label: '', value: '1', orderNum: 0 }
  ])
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [allowMultiple, setAllowMultiple] = useState(false)
  const [securityLevel, setSecurityLevel] = useState<string | null>('')

  useEffect(() => {
    if (open && initialData) {
      setTitle(initialData.title)
      setVoteType(initialData.voteType)
      setIsAnonymous(initialData.isAnonymous)
      setAllowMultiple(initialData.allowMultiple || false)
      setSecurityLevel(initialData.securityLevel || '')
      if (initialData.voteType === 'custom') {
        setCustomOptions(initialData.options)
      }
    } else if (open) {
      setTitle('')
      setVoteType('simple')
      setCustomOptions([{ id: '1', label: '', value: '1', orderNum: 0 }])
      setIsAnonymous(false)
      setAllowMultiple(false)
      setSecurityLevel('')
    }
  }, [open, initialData])

  const handleAddOption = () => {
    const newId = String(Date.now())
    setCustomOptions([...customOptions, { 
      id: newId, 
      label: '', 
      value: newId,
      orderNum: customOptions.length 
    }])
  }

  const handleRemoveOption = (id: string) => {
    if (customOptions.length <= 2) return
    setCustomOptions(customOptions.filter(opt => opt.id !== id))
  }

  const handleUpdateOption = (id: string, label: string) => {
    setCustomOptions(customOptions.map(opt => 
      opt.id === id ? { ...opt, label } : opt
    ))
  }

  const handleConfirm = () => {
    if (!title.trim()) {
      return
    }

    const options = voteType === 'simple' 
      ? SIMPLE_VOTE_OPTIONS
      : customOptions.filter(opt => opt.label.trim())

    if (voteType === 'custom' && options.length < 2) {
      return
    }

    onConfirm({
      title: title.trim(),
      voteType,
      options,
      isAnonymous,
      allowMultiple: voteType === 'custom' ? allowMultiple : undefined,
      securityLevel: (securityLevel || null) as MeetingSecurityLevel | null
    })

    onOpenChange(false)
  }

  const isValid = title.trim() && (
    voteType === 'simple' || 
    customOptions.filter(opt => opt.label.trim()).length >= 2
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialData ? '编辑投票' : '添加投票'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              投票标题 <span className="text-error">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入投票标题"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              投票类型 <span className="text-error">*</span>
            </label>
            <Select value={voteType} onValueChange={(value) => setVoteType(value as VoteType)}>
              <SelectTrigger>
                <SelectValue placeholder="选择投票类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">意见表决（赞成/反对/弃权）</SelectItem>
                <SelectItem value="custom">自定义选项</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {voteType === 'custom' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-text-primary">
                  投票选项 <span className="text-error">*</span>
                  <span className="text-xs text-text-tertiary ml-2">（至少2个选项）</span>
                </label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleAddOption}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  添加选项
                </Button>
              </div>
              <div className="space-y-2">
                {customOptions.map((option, index) => (
                  <div key={option.id} className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        value={option.label}
                        onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                        placeholder={`选项 ${index + 1}`}
                      />
                    </div>
                    {customOptions.length > 2 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveOption(option.id)}
                        className="text-text-tertiary hover:text-error"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
              />
              <span className="text-sm text-text-primary">匿名投票</span>
            </label>
            
            {voteType === 'custom' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={allowMultiple}
                  onCheckedChange={(checked) => setAllowMultiple(checked as boolean)}
                />
                <span className="text-sm text-text-primary">允许多选</span>
                <span className="text-xs text-text-tertiary">(可选择多个选项)</span>
              </label>
            )}
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              安全等级
            </label>
            <SecurityLevelSelect
              value={securityLevel || ''}
              onChange={setSecurityLevel}
              options={[
                { code: '', name: '不限', value: '' },
                ...securityLevels
              ]}
            />
          </div> */}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid}>
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
