import React from 'react'
import { X } from 'lucide-react'
import type { MeetingParticipant } from '@/types'

interface ParticipantSelectorProps {
  participants: MeetingParticipant[]
  onOpenSelector: () => void
  onRemoveParticipant: (id: string) => void
  isVisible: boolean
}

const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({
  participants,
  onOpenSelector,
  onRemoveParticipant,
  isVisible
}) => {
  if (!isVisible) return null

  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        参会人员 <span className="text-red-500">*</span>
      </label>
      <div className="space-y-2">
        {/* 已添加的人员 */}
        <div 
          className="min-h-[50px] max-h-[160px] overflow-y-auto p-2 border border-gray-300 rounded-md bg-gray-50 cursor-pointer hover:border-gray-400 transition-colors"
          onClick={onOpenSelector}
        >
          {participants.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {participants.map((participant) => (
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
  )
}

export default ParticipantSelector
