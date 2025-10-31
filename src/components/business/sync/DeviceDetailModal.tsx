import { X } from 'lucide-react'
import type { SyncDevice, SyncedMeeting } from '@/types'

interface DeviceDetailModalProps {
  device: SyncDevice | null
  syncedMeetings: SyncedMeeting[]
  onClose: () => void
  onDelete: (meetingId: string) => void
  onDeleteAll: () => void
  onResync: (meetingId: string) => void
}

export function DeviceDetailModal({
  device,
  syncedMeetings,
  onClose,
  onDelete,
  onDeleteAll,
  onResync
}: DeviceDetailModalProps) {
  if (!device) return null

  const storagePercent = (device.usedStorage / device.totalStorage) * 100
  const remainingStorage = device.totalStorage - device.usedStorage

  const getSecurityLevelStyle = (level: string) => {
    const styles: Record<string, string> = {
      top_secret: 'bg-red-100 text-red-700 border-red-300',
      secret: 'bg-orange-100 text-orange-700 border-orange-300',
      confidential: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      internal: 'bg-blue-100 text-blue-700 border-blue-300',
      public: 'bg-gray-100 text-gray-700 border-gray-300'
    }
    return styles[level] || styles.internal
  }

  const getSecurityLevelText = (level: string) => {
    const texts: Record<string, string> = {
      top_secret: '绝密',
      secret: '机密',
      confidential: '秘密',
      internal: '内部',
      public: '公开'
    }
    return texts[level] || '内部'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">{device.name} 设备详情</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Storage Info */}
        <div className="p-6 border-b bg-gray-50">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-600">存储空间:</span>
            <span className="font-medium">
              {device.usedStorage}MB / {device.totalStorage}MB (剩余{remainingStorage}MB)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${storagePercent}%` }}
            />
          </div>
        </div>

        {/* Synced Meetings List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">已同步会议:</h3>
            <div className="space-x-2">
              <button
                onClick={() => {
                  if (window.confirm('确定要清空该设备上的所有会议吗？')) {
                    onDeleteAll()
                  }
                }}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                disabled={syncedMeetings.length === 0}
              >
                清空全部
              </button>
            </div>
          </div>

          {syncedMeetings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              该设备暂无已同步的会议
            </div>
          ) : (
            <div className="space-y-3">
              {syncedMeetings.map((meeting) => (
                <div
                  key={meeting.meetingId}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-xs rounded border ${getSecurityLevelStyle(meeting.securityLevel)}`}>
                          {getSecurityLevelText(meeting.securityLevel)}
                        </span>
                        <span className="font-medium">{meeting.title}</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>{meeting.fileCount}个文件 | {meeting.size}MB | {meeting.meetingDate}</div>
                        <div>同步时间: {new Date(meeting.syncTime).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => onResync(meeting.meetingId)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                      >
                        重新同步
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`确定要删除会议"${meeting.title}"吗？`)) {
                            onDelete(meeting.meetingId)
                          }
                        }}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
