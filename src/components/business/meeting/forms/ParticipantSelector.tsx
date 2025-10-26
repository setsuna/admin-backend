import React from 'react'
import { X } from 'lucide-react'
import type { MeetingParticipant } from '@/types'

interface ParticipantSelectorProps {
  participants: MeetingParticipant[]
  onOpenSelector: () => void
  onRemoveParticipant: (id: string) => void
  isVisible: boolean
  readOnly?: boolean
}

const SECURITY_LEVEL_CONFIG = {
  unclassified: { label: '普通', icon: '🔓', badge: 'bg-gray-100 text-gray-600' },
  confidential: { label: '机密', icon: '🔒', badge: 'bg-blue-100 text-blue-700' },
  secret: { label: '绝密', icon: '🔒', badge: 'bg-orange-100 text-orange-700' },
  top_secret: { label: '最高机密', icon: '🔐', badge: 'bg-red-100 text-red-700' }
}

const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({
  participants,
  onOpenSelector,
  onRemoveParticipant,
  isVisible,
  readOnly = false
}) => {
  if (!isVisible) return null

  const getDisplayName = (participant: MeetingParticipant) => {
    return participant.name || participant.userName || participant.userId
  }

  const getSecurityLevel = (participant: MeetingParticipant) => {
    return participant.securityLevel
  }

  const isTemporary = (participant: MeetingParticipant) => {
    return participant.participantType === 'temporary'
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
                const securityLevel = getSecurityLevel(participant)
                const securityConfig = securityLevel 
                  ? SECURITY_LEVEL_CONFIG[securityLevel as keyof typeof SECURITY_LEVEL_CONFIG]
                  : null
                const isTemp = isTemporary(participant)

                return (
                  <span
                    key={participant.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${
                      isTemp ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    <span>{displayName}</span>
                    {isTemp && (
                      <span className="text-xs opacity-75">(临时)</span>
                    )}
                    {securityConfig && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${securityConfig.badge}`}>
                        {securityConfig.icon}
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
