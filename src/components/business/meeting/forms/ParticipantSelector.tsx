import React from 'react'
import { X } from 'lucide-react'
import { useSecurityLevels } from '@/hooks/useSecurityLevels'
import type { MeetingParticipant } from '@/types'

interface ParticipantSelectorProps {
  participants: MeetingParticipant[]
  onOpenSelector: () => void
  onRemoveParticipant: (id: string) => void
  isVisible: boolean
  readOnly?: boolean
}

const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({
  participants,
  onOpenSelector,
  onRemoveParticipant,
  isVisible,
  readOnly = false
}) => {
  const { securityLevels } = useSecurityLevels()

  if (!isVisible) return null

  const getDisplayName = (participant: MeetingParticipant) => {
    return participant.name || participant.userName || participant.userId
  }

  const isTemporary = (participant: MeetingParticipant) => {
    // 判断 user_id 是否以 temp 开头
    return participant.userId?.startsWith('temp')
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        参会人员 <span className="text-red-500">*</span>
      </label>
      <div className="space-y-2">
        <div 
          className={`
            min-h-[50px] max-h-[160px] overflow-y-auto p-2 border border-gray-300 rounded-md bg-gray-50 
            ${readOnly ? 'cursor-default' : 'cursor-pointer hover:border-gray-400'} 
            transition-colors
          `}
          onClick={readOnly ? undefined : onOpenSelector}
        >
          {participants.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {participants.map((participant) => {
                const displayName = getDisplayName(participant)
                const isTemp = isTemporary(participant)
                const securityLevel = securityLevels.find(s => s.value === participant.securityLevel)

                return (
                  <span
                    key={participant.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${
                      isTemp ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    <span>{displayName}</span>
                    {securityLevel && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        isTemp ? 'bg-amber-200 text-amber-900' : 'bg-blue-200 text-blue-900'
                      }`}>
                        {securityLevel.name}
                      </span>
                    )}
                    {!readOnly && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemoveParticipant(participant.id)
                        }}
                        className={isTemp ? 'hover:text-amber-600' : 'hover:text-blue-600'}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                )
              })}
            </div>
          ) : (
            <span className="text-gray-500 text-sm">
              {readOnly ? '暂无参会人员' : '点击选择参会人员...'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ParticipantSelector
