import { useState } from 'react'
import { Search, RefreshCw, Download } from 'lucide-react'
import type { MeetingSyncInfo, SyncDevice, SyncedMeeting, SyncOptions, SyncTask } from '@/types'
import { DeviceDetailModal } from '@/components/business/sync/DeviceDetailModal'
import { SyncHistoryModal } from '@/components/business/sync/SyncHistoryModal'

export default function MeetingSyncPage() {
  // Mock数据 - 实际应该从API获取
  const [meetings] = useState<MeetingSyncInfo[]>([
    {
      id: '1',
      name: 'meeting-001',
      title: '战略规划会议',
      securityLevel: 'top_secret',
      status: 'ready',
      meetingDate: '2024-10-25',
      syncedDeviceCount: 15,
      autoSyncEnabled: true,
      meetingType: 'standard',
      createdBy: 'admin',
      createdAt: '2024-10-20T10:00:00Z',
      updatedAt: '2024-10-25T10:00:00Z'
    },
    {
      id: '2',
      name: 'meeting-002',
      title: 'Q4财务审计会议',
      securityLevel: 'secret',
      status: 'editable',
      meetingDate: '2024-10-28',
      syncedDeviceCount: 0,
      autoSyncEnabled: false,
      meetingType: 'standard',
      createdBy: 'admin',
      createdAt: '2024-10-22T10:00:00Z',
      updatedAt: '2024-10-28T10:00:00Z'
    },
    {
      id: '3',
      name: 'meeting-003',
      title: '产品发布会',
      securityLevel: 'internal',
      status: 'ready',
      meetingDate: '2024-11-02',
      syncedDeviceCount: 8,
      autoSyncEnabled: false,
      meetingType: 'standard',
      createdBy: 'admin',
      createdAt: '2024-10-28T10:00:00Z',
      updatedAt: '2024-11-02T10:00:00Z'
    }
  ])

  const [devices] = useState<SyncDevice[]>([
    { id: '1', name: '平板-001', usedStorage: 125, totalStorage: 500, syncedMeetingCount: 1, lastSyncTime: '2024-10-30T08:00:00Z' },
    { id: '2', name: '平板-002', usedStorage: 0, totalStorage: 500, syncedMeetingCount: 0 },
    { id: '3', name: '平板-003', usedStorage: 340, totalStorage: 500, syncedMeetingCount: 3, lastSyncTime: '2024-10-29T14:00:00Z' },
    { id: '4', name: '平板-004', usedStorage: 160, totalStorage: 500, syncedMeetingCount: 2, lastSyncTime: '2024-10-28T16:00:00Z' }
  ])

  const [selectedMeetingIds, setSelectedMeetingIds] = useState<string[]>([])
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([])
  const [searchMeeting, setSearchMeeting] = useState('')
  const [batchSyncEnabled, setBatchSyncEnabled] = useState(false)
  
  const [syncOptions, setSyncOptions] = useState<SyncOptions>({
    includeMaterials: true,
    includeAgenda: true,
    includeRecording: false,
    overwriteExisting: false
  })

  const [selectedDevice, setSelectedDevice] = useState<SyncDevice | null>(null)
  const [deviceSyncedMeetings, setDeviceSyncedMeetings] = useState<SyncedMeeting[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Mock历史记录数据
  const [syncTasks] = useState<SyncTask[]>([
    {
      id: '1',
      meetingId: '1',
      meetingTitle: '战略规划会议',
      deviceIds: ['1', '2', '3', '4', '5'],
      deviceNames: ['平板-001', '平板-002', '平板-003', '平板-004', '平板-005'],
      status: 'completed',
      completedCount: 5,
      totalCount: 5,
      createdAt: '2024-10-30T08:00:00Z',
      completedAt: '2024-10-30T08:15:00Z'
    },
    {
      id: '2',
      meetingId: '3',
      meetingTitle: '产品发布会',
      deviceIds: ['1', '2', '3'],
      deviceNames: ['平板-001', '平板-002', '平板-003'],
      status: 'running',
      completedCount: 2,
      totalCount: 3,
      createdAt: '2024-10-31T10:00:00Z'
    },
    {
      id: '3',
      meetingId: '2',
      meetingTitle: 'Q4财务审计会议',
      deviceIds: ['1', '2', '3', '4'],
      deviceNames: ['平板-001', '平板-002', '平板-003', '平板-004'],
      status: 'pending',
      completedCount: 0,
      totalCount: 4,
      createdAt: '2024-10-31T11:00:00Z'
    },
    {
      id: '4',
      meetingId: '1',
      meetingTitle: '战略规划会议',
      deviceIds: ['6', '7'],
      deviceNames: ['平板-006', '平板-007'],
      status: 'failed',
      completedCount: 0,
      totalCount: 2,
      createdAt: '2024-10-30T16:00:00Z'
    }
  ])

  const handleMeetingSelect = (meetingId: string) => {
    setSelectedMeetingIds(prev => 
      prev.includes(meetingId) 
        ? prev.filter(id => id !== meetingId)
        : [...prev, meetingId]
    )
  }

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDeviceIds(prev => 
      prev.includes(deviceId) 
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    )
  }

  const handleSelectAllDevices = () => {
    if (selectedDeviceIds.length === devices.length) {
      setSelectedDeviceIds([])
    } else {
      setSelectedDeviceIds(devices.map(d => d.id))
    }
  }

  const handleStartSync = () => {
    if (selectedMeetingIds.length === 0) {
      alert('请至少选择一个会议')
      return
    }
    if (selectedDeviceIds.length === 0) {
      alert('请至少选择一个设备')
      return
    }
    
    const selectedMeetings = meetings.filter(m => selectedMeetingIds.includes(m.id))
    const selectedDevices = devices.filter(d => selectedDeviceIds.includes(d.id))
    
    console.log('开始同步:', {
      meetings: selectedMeetings.map(m => m.title),
      devices: selectedDevices.map(d => d.name),
      options: syncOptions
    })
    
    alert(`开始同步 ${selectedMeetingIds.length} 个会议到 ${selectedDeviceIds.length} 台设备`)
  }

  const handleDeviceDoubleClick = (device: SyncDevice) => {
    // Mock数据 - 实际应该从API获取该设备的已同步会议
    const mockSyncedMeetings: SyncedMeeting[] = device.syncedMeetingCount > 0 ? [
      {
        meetingId: '1',
        title: '战略规划会议',
        securityLevel: 'top_secret',
        size: 125,
        fileCount: 3,
        syncTime: '2024-10-30T08:00:00Z',
        meetingDate: '2024-10-25'
      }
    ] : []
    
    setSelectedDevice(device)
    setDeviceSyncedMeetings(mockSyncedMeetings)
  }

  const handleDeleteMeeting = (meetingId: string) => {
    console.log('删除会议:', meetingId, '从设备:', selectedDevice?.id)
    // TODO: 调用API删除
    setDeviceSyncedMeetings(prev => prev.filter(m => m.meetingId !== meetingId))
  }

  const handleDeleteAllMeetings = () => {
    console.log('清空设备所有会议:', selectedDevice?.id)
    // TODO: 调用API删除所有
    setDeviceSyncedMeetings([])
  }

  const handleResyncMeeting = (meetingId: string) => {
    console.log('重新同步会议:', meetingId, '到设备:', selectedDevice?.id)
    // TODO: 调用API重新同步
    alert('重新同步功能待实现')
  }

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

  const filteredMeetings = meetings.filter(meeting => 
    meeting.title.toLowerCase().includes(searchMeeting.toLowerCase())
  )

  const selectedMeetingsSize = meetings
    .filter(m => selectedMeetingIds.includes(m.id))
    .reduce((sum) => sum + 125, 0) // Mock: 假设每个会议125MB

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">会议文件同步到设备</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={batchSyncEnabled}
              onChange={(e) => setBatchSyncEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium">
              批量同步模式 {batchSyncEnabled && `(监听 ${selectedMeetingIds.length} 个会议)`}
            </span>
          </label>
          <button 
            onClick={() => setShowHistory(true)}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            历史记录
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
        {/* Left Panel - Meeting List */}
        <div className="flex flex-col border rounded-lg bg-white overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">会议列表</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索会议..."
                value={searchMeeting}
                onChange={(e) => setSearchMeeting(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedMeetingIds.includes(meeting.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => handleMeetingSelect(meeting.id)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedMeetingIds.includes(meeting.id)}
                    onChange={() => {}}
                    className="mt-1 w-4 h-4 rounded border-gray-300"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-xs rounded border ${getSecurityLevelStyle(meeting.securityLevel)}`}>
                        {getSecurityLevelText(meeting.securityLevel)}
                      </span>
                      <span className="font-medium truncate">{meeting.title}</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>{meeting.meetingDate} | 125MB</div>
                      <div className="flex items-center gap-2">
                        <span>{meeting.syncedDeviceCount}/20台已同步</span>
                        {meeting.autoSyncEnabled && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            自动同步
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              已选择: {selectedMeetingIds.length} 个会议
            </div>
          </div>
        </div>

        {/* Right Panel - Device List */}
        <div className="flex flex-col border rounded-lg bg-white overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">设备列表</h2>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSelectAllDevices}
                  className="px-3 py-1 text-sm hover:bg-gray-100 rounded transition-colors"
                >
                  全选
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3">
            {devices.map((device) => (
              <div
                key={device.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedDeviceIds.includes(device.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => handleDeviceSelect(device.id)}
                onDoubleClick={() => handleDeviceDoubleClick(device)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedDeviceIds.includes(device.id)}
                    onChange={() => {}}
                    className="mt-1 w-4 h-4 rounded border-gray-300"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium mb-2">{device.name}</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>{device.usedStorage}MB / {device.totalStorage}MB</div>
                      <div>已同步: {device.syncedMeetingCount} 个会议</div>
                      {device.lastSyncTime && (
                        <div className="text-xs text-gray-500">
                          最后同步: {new Date(device.lastSyncTime).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      双击查看详情
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>

          <div className="p-4 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              已选择: {selectedDeviceIds.length} 台设备 | 预计需要: {selectedMeetingsSize}MB
            </div>
          </div>
        </div>
      </div>

      {/* Sync Options & Actions */}
      <div className="mt-6 border-t pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <span className="font-medium text-gray-700">同步设置:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={syncOptions.includeMaterials}
                onChange={(e) => setSyncOptions(prev => ({ ...prev, includeMaterials: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span>包含会议材料</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={syncOptions.includeAgenda}
                onChange={(e) => setSyncOptions(prev => ({ ...prev, includeAgenda: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span>包含议程</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={syncOptions.includeRecording}
                onChange={(e) => setSyncOptions(prev => ({ ...prev, includeRecording: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span>包含录音(如有)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={syncOptions.overwriteExisting}
                onChange={(e) => setSyncOptions(prev => ({ ...prev, overwriteExisting: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span>覆盖已有文件</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              预览同步包
            </button>
            <button
              onClick={handleStartSync}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              disabled={selectedMeetingIds.length === 0 || selectedDeviceIds.length === 0}
            >
              开始同步
            </button>
          </div>
        </div>
      </div>

      {/* Device Detail Modal */}
      <DeviceDetailModal
        device={selectedDevice}
        syncedMeetings={deviceSyncedMeetings}
        onClose={() => {
          setSelectedDevice(null)
          setDeviceSyncedMeetings([])
        }}
        onDelete={handleDeleteMeeting}
        onDeleteAll={handleDeleteAllMeetings}
        onResync={handleResyncMeeting}
      />

      {/* Sync History Modal */}
      <SyncHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        tasks={syncTasks}
      />
    </div>
  )
}
