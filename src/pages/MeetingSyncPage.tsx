import { useState } from 'react'
import { Search, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Checkbox } from '@/components/ui/Checkbox'
import { useNotifications } from '@/hooks/useNotifications'
import type { MeetingSyncInfo, SyncDevice, SyncedMeeting, SyncOptions, SyncTask } from '@/types'
import { DeviceDetailModal } from '@/components/business/sync/DeviceDetailModal'
import { SyncHistoryModal } from '@/components/business/sync/SyncHistoryModal'

export default function MeetingSyncPage() {
  const { showError, showSuccess } = useNotifications()
  
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
      showError('请选择会议', '请至少选择一个会议进行同步')
      return
    }
    if (selectedDeviceIds.length === 0) {
      showError('请选择设备', '请至少选择一个设备进行同步')
      return
    }
    
    const selectedMeetings = meetings.filter(m => selectedMeetingIds.includes(m.id))
    const selectedDevices = devices.filter(d => selectedDeviceIds.includes(d.id))
    
    console.log('开始同步:', {
      meetings: selectedMeetings.map(m => m.title),
      devices: selectedDevices.map(d => d.name),
      options: syncOptions
    })
    
    showSuccess('同步已开始', `正在同步 ${selectedMeetingIds.length} 个会议到 ${selectedDeviceIds.length} 台设备`)
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
    showSuccess('重新同步', '已加入同步队列')
  }

  const getSecurityLevelVariant = (level: string): 'top_secret' | 'secret' | 'confidential' | 'internal' | 'public' => {
    const validLevels = ['top_secret', 'secret', 'confidential', 'internal', 'public'] as const
    return validLevels.includes(level as any) ? (level as any) : 'internal'
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
          <Checkbox
            checked={batchSyncEnabled}
            onChange={(e) => setBatchSyncEnabled(e.target.checked)}
            label={`批量同步模式${batchSyncEnabled ? ` (监听 ${selectedMeetingIds.length} 个会议)` : ''}`}
          />
          <Button 
            variant="outline"
            onClick={() => setShowHistory(true)}
          >
            历史记录
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
        {/* Left Panel - Meeting List */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="mb-3">会议列表</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="搜索会议..."
                value={searchMeeting}
                onChange={(e) => setSearchMeeting(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto space-y-3">
            {filteredMeetings.map((meeting) => (
              <Card
                key={meeting.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedMeetingIds.includes(meeting.id)
                    ? 'border-primary bg-primary/5'
                    : ''
                }`}
                hover="border"
                interactive
                onClick={() => handleMeetingSelect(meeting.id)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedMeetingIds.includes(meeting.id)}
                    onChange={() => {}}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getSecurityLevelVariant(meeting.securityLevel)}>
                        {getSecurityLevelText(meeting.securityLevel)}
                      </Badge>
                      <span className="font-medium truncate">{meeting.title}</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>{meeting.meetingDate} | 125MB</div>
                      <div className="flex items-center gap-2">
                        <span>{meeting.syncedDeviceCount}/20台已同步</span>
                        {meeting.autoSyncEnabled && (
                          <Badge variant="success">
                            自动同步
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </CardContent>

          <div className="p-6 pt-0 border-t bg-muted">
            <div className="text-sm text-muted-foreground">
              已选择: {selectedMeetingIds.length} 个会议
            </div>
          </div>
        </Card>

        {/* Right Panel - Device List */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>设备列表</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAllDevices}
                >
                  全选
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
            {devices.map((device) => (
              <Card
                key={device.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedDeviceIds.includes(device.id)
                    ? 'border-primary bg-primary/5'
                    : ''
                }`}
                hover="border"
                interactive
                onClick={() => handleDeviceSelect(device.id)}
                onDoubleClick={() => handleDeviceDoubleClick(device)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedDeviceIds.includes(device.id)}
                    onChange={() => {}}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium mb-2">{device.name}</div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>{device.usedStorage}MB / {device.totalStorage}MB</div>
                      <div>已同步: {device.syncedMeetingCount} 个会议</div>
                      {device.lastSyncTime && (
                        <div className="text-xs text-muted-foreground/70">
                          最后同步: {new Date(device.lastSyncTime).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground/60">
                      双击查看详情
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            </div>
          </CardContent>

          <div className="p-6 pt-0 border-t bg-muted">
            <div className="text-sm text-muted-foreground">
              已选择: {selectedDeviceIds.length} 台设备 | 预计需要: {selectedMeetingsSize}MB
            </div>
          </div>
        </Card>
      </div>

      {/* Sync Options & Actions */}
      <div className="mt-6 border-t pt-6">
      <div className="flex items-center justify-between">
      <div className="flex gap-3">
      <Button
      onClick={handleStartSync}
      disabled={selectedMeetingIds.length === 0 || selectedDeviceIds.length === 0}
      >
        开始同步
      </Button>
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
