import { useState, useEffect, useCallback } from 'react'
import { Search, RefreshCw, Cable, Unplug } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Checkbox } from '@/components/ui/Checkbox'
import { useNotifications } from '@/hooks/useNotifications'
import { useSyncWebSocket } from '@/hooks/useSyncWebSocket'
import { useApp } from '@/store'
import { meetingApi } from '@/services/api/meeting.api'
import { deviceApi } from '@/services'
import { syncApi } from '@/services/api/sync.api'
import type { 
  OnlineDevice, 
  SyncedMeeting, 
  SyncOptions, 
  SyncTask,
  SyncProgressMessage,
  DeviceSyncState,
  SyncTaskProgress
} from '@/types'
import { DeviceDetailModal } from '@/components/business/sync/DeviceDetailModal'
import { SyncHistoryModal } from '@/components/business/sync/SyncHistoryModal'
import { DeviceSyncProgress } from '@/components/business/sync/DeviceSyncProgress'
import { SyncConfirmDialog } from '@/components/business/sync/SyncConfirmDialog'

export default function MeetingSyncPage() {
  const { showError, showSuccess } = useNotifications()
  const { devices: deviceStatusMap } = useApp()
  
  // 获取打包会议列表
  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['packaged-meetings'],
    queryFn: () => meetingApi.getPackagedMeetings(),
  })

  // 获取设备列表
  const { data: devicesData, isLoading: isDevicesLoading, refetch: refetchDevices } = useQuery({
    queryKey: ['online-devices'],
    queryFn: () => deviceApi.getOnlineDevices({ page: 1, size: 100 }),
    refetchInterval: 30000, // 每30秒刷新一次
  })

  const devices: OnlineDevice[] = devicesData?.items || []

  // 设备排序：在线状态优先显示在最上面
  const sortedDevices = [...devices].sort((a, b) => {
    if (a.status !== b.status) {
      return b.status - a.status
    }
    return a.serial_number.localeCompare(b.serial_number)
  })

  // 监听设备状态变化，自动刷新设备列表
  useEffect(() => {
    refetchDevices()
  }, [deviceStatusMap, refetchDevices])

  const [selectedMeetingIds, setSelectedMeetingIds] = useState<string[]>([])
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([])
  const [searchMeeting, setSearchMeeting] = useState('')
  const [batchSyncEnabled, setBatchSyncEnabled] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  
  const [syncOptions] = useState<SyncOptions>({
    includeMaterials: true,
    includeAgenda: true,
    includeRecording: false,
    overwriteExisting: false
  })

  const [selectedDevice, setSelectedDevice] = useState<OnlineDevice | null>(null)
  const [deviceSyncedMeetings, setDeviceSyncedMeetings] = useState<SyncedMeeting[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // 设备同步状态管理
  const [deviceSyncStates, setDeviceSyncStates] = useState<Map<string, DeviceSyncState>>(new Map())

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
  ])

  // WebSocket 进度处理
  const handleSyncProgress = useCallback((message: SyncProgressMessage) => {
    const { task_id, device_id, meeting_id, progress, speed, eta } = message.data

    setDeviceSyncStates(prev => {
      const newStates = new Map(prev)
      const deviceState = newStates.get(device_id) || {
        deviceId: device_id,
        tasks: new Map(),
        isActive: true
      }

      const meeting = meetings.find(m => String(m.id) === meeting_id)
      const existingTask = deviceState.tasks.get(task_id)

      deviceState.tasks.set(task_id, {
        taskId: task_id,
        meetingId: meeting_id,
        meetingName: meeting?.name || existingTask?.meetingName || '未知会议',
        status: progress >= 100 ? 'done' : 'processing',
        progress,
        speed,
        eta
      })

      // 检查是否所有任务都完成
      const allDone = Array.from(deviceState.tasks.values()).every(
        t => t.status === 'done' || t.status === 'failed'
      )
      deviceState.isActive = !allDone

      newStates.set(device_id, deviceState)
      return newStates
    })
  }, [meetings])

  // 连接 WebSocket
  useSyncWebSocket({
    onProgress: handleSyncProgress,
    enabled: true
  })

  const handleMeetingSelect = (meetingId: string | number) => {
    const idStr = String(meetingId)
    setSelectedMeetingIds(prev => 
      prev.includes(idStr) 
        ? prev.filter(id => id !== idStr)
        : [...prev, idStr]
    )
  }

  const handleDeviceSelect = (deviceId: string) => {
    const device = devices.find(d => d.serial_number === deviceId)
    if (device && device.status === -1) {
      return
    }
    
    setSelectedDeviceIds(prev => 
      prev.includes(deviceId) 
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    )
  }

  const handleSelectAllDevices = () => {
    const registeredDevices = devices.filter(d => d.status !== -1)
    if (selectedDeviceIds.length === registeredDevices.length) {
      setSelectedDeviceIds([])
    } else {
      setSelectedDeviceIds(registeredDevices.map(d => d.serial_number))
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
    
    setShowConfirmDialog(true)
  }

  const handleConfirmSync = async () => {
    setShowConfirmDialog(false)

    const selectedMeetings = meetings.filter(m => selectedMeetingIds.includes(String(m.id)))
    const selectedDevices = devices.filter(d => selectedDeviceIds.includes(d.serial_number))
    
    try {
      const tasks: Array<{ meetingId: string; deviceId: string; taskId: string }> = []

      // 循环调用 API 创建同步任务
      for (const meeting of selectedMeetings) {
        for (const device of selectedDevices) {
          try {
            const result = await syncApi.createSyncTask(
              String(meeting.id),
              device.serial_number
            )
            
            tasks.push({
              meetingId: String(meeting.id),
              deviceId: device.serial_number,
              taskId: result.taskId
            })

            // 初始化设备同步状态
            setDeviceSyncStates(prev => {
              const newStates = new Map(prev)
              const deviceState = newStates.get(device.serial_number) || {
                deviceId: device.serial_number,
                tasks: new Map(),
                isActive: true
              }

              deviceState.tasks.set(result.taskId, {
                taskId: result.taskId,
                meetingId: String(meeting.id),
                meetingName: meeting.name,
                status: 'pending',
                progress: 0
              })

              deviceState.isActive = true
              newStates.set(device.serial_number, deviceState)
              return newStates
            })
          } catch (error) {
            console.error(`创建同步任务失败 [${meeting.name} -> ${device.serial_number}]:`, error)
            showError('同步失败', `会议 "${meeting.name}" 同步到设备 "${device.serial_number}" 失败`)
          }
        }
      }

      showSuccess(
        '同步已开始', 
        `已创建 ${tasks.length} 个同步任务，正在后台处理`
      )

      console.log('已创建的同步任务:', tasks)
    } catch (error) {
      console.error('批量同步失败:', error)
      showError('同步失败', '创建同步任务时发生错误')
    }
  }

  const handleDeviceDoubleClick = (device: OnlineDevice) => {
    // Mock数据 - 实际应该从API获取该设备的已同步会议
    const mockSyncedMeetings: SyncedMeeting[] = device.status === 1 ? [
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
    console.log('删除会议:', meetingId, '从设备:', selectedDevice?.serial_number)
    setDeviceSyncedMeetings(prev => prev.filter(m => m.meetingId !== meetingId))
  }

  const handleDeleteAllMeetings = () => {
    console.log('清空设备所有会议:', selectedDevice?.serial_number)
    setDeviceSyncedMeetings([])
  }

  const handleResyncMeeting = (meetingId: string) => {
    console.log('重新同步会议:', meetingId, '到设备:', selectedDevice?.serial_number)
    showSuccess('重新同步', '已加入同步队列')
  }

  const getSecurityLevelVariant = (level: string): 'success' | 'warning' | 'error' | 'default' => {
    const variantMap: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
      internal: 'success',
      confidential: 'warning',
      secret: 'error',
      top_secret: 'error',
      public: 'default'
    }
    return variantMap[level] || 'default'
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
    meeting.name.toLowerCase().includes(searchMeeting.toLowerCase())
  )

  const selectedMeetingsSize = meetings
    .filter(m => selectedMeetingIds.includes(String(m.id)))
    .reduce((sum, m) => sum + ((m as any).package_info?.package_size || 0), 0) / (1024 * 1024)

  const selectedMeetingObjects = meetings.filter(m => selectedMeetingIds.includes(String(m.id)))
  const selectedDeviceObjects = devices.filter(d => selectedDeviceIds.includes(d.serial_number))

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
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">加载中...</div>
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">
                  {searchMeeting ? '没有找到匹配的会议' : '暂无打包会议'}
                </div>
              </div>
            ) : filteredMeetings.map((meeting) => (
              <Card
                key={meeting.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedMeetingIds.includes(String(meeting.id))
                    ? 'border-primary bg-primary/5'
                    : ''
                }`}
                hover="border"
                interactive
                onClick={() => handleMeetingSelect(meeting.id)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedMeetingIds.includes(String(meeting.id))}
                    onChange={() => {}}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getSecurityLevelVariant((meeting as any).security_level)}>
                        {getSecurityLevelText((meeting as any).security_level)}
                      </Badge>
                      <Badge variant={(meeting as any).type === 'standard' ? 'default' : 'info'}>
                        {(meeting as any).type === 'standard' ? '标准会议' : '平板会议'}
                      </Badge>
                      <span className="font-medium truncate">{meeting.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>
                        {new Date((meeting as any).start_time).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })} | 
                        {(meeting as any).package_info ? ` ${((meeting as any).package_info.package_size / (1024 * 1024)).toFixed(1)}MB` : ' 未打包'}
                      </div>
                      {(meeting as any).package_info && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>文件: {(meeting as any).package_info.file_count} 个</span>
                          <span>投票: {(meeting as any).package_info.vote_count} 个</span>
                        </div>
                      )}
                      {(meeting as any).package_info && (
                        <div className="text-xs text-muted-foreground/70">
                          打包时间: {new Date((meeting as any).package_info.packaged_at).toLocaleString('zh-CN', { 
                            year: 'numeric', 
                            month: '2-digit', 
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </CardContent>

          <div className="px-6 py-4 border-t bg-muted flex items-center justify-center">
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
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => refetchDevices()}
                  disabled={isDevicesLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isDevicesLoading ? 'animate-spin' : ''}`} />
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
            <div className="grid grid-cols-1 gap-3">
              {sortedDevices.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">
                    {isDevicesLoading ? '加载中...' : '暂无设备'}
                  </div>
                </div>
              ) : (
                sortedDevices.map((device) => {
                  const isUnregistered = device.status === -1
                  const isOnline = device.status === 1
                  const statusVariant = isUnregistered ? 'warning' : isOnline ? 'success' : 'default'
                  const deviceState = deviceSyncStates.get(device.serial_number)
                  const deviceTasks = deviceState ? Array.from(deviceState.tasks.values()) : []
                  
                  return (
                    <div key={device.serial_number} className="space-y-2">
                      <Card
                        className={`p-4 transition-all ${
                          selectedDeviceIds.includes(device.serial_number)
                            ? 'border-primary bg-primary/5'
                            : ''
                        }`}
                        hover="border"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedDeviceIds.includes(device.serial_number)}
                            onChange={() => handleDeviceSelect(device.serial_number)}
                            disabled={isUnregistered}
                          />
                          <div className="flex-1 flex items-center justify-between gap-4 min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-medium truncate">{device.serial_number}</span>
                              <Badge variant={statusVariant} className="flex items-center gap-1">
                                {isOnline && <Cable className="w-3 h-3" />}
                                {device.status === 0 && <Unplug className="w-3 h-3" />}
                                {device.status_name}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground whitespace-nowrap">
                              最后在线时间：{device.last_login 
                                ? new Date(device.last_login).toLocaleString('zh-CN', {
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : '-/- --:--'
                              }
                            </div>
                            {!isUnregistered && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeviceDoubleClick(device)}
                                className="whitespace-nowrap"
                              >
                                查看详情
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                      
                      {/* 设备进度条 */}
                      {deviceTasks.length > 0 && (
                        <DeviceSyncProgress 
                          tasks={deviceTasks}
                          className="px-4"
                        />
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>

          <div className="px-6 py-4 border-t bg-muted flex items-center justify-center">
            <div className="text-sm text-muted-foreground">
              已选择: {selectedDeviceIds.length} 台设备 | 预计需要: {selectedMeetingsSize.toFixed(1)}MB
            </div>
          </div>
        </Card>
      </div>

      {/* Sync Actions */}
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

      {/* Sync Confirm Dialog */}
      <SyncConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmSync}
        selectedMeetings={selectedMeetingObjects}
        selectedDevices={selectedDeviceObjects}
        totalSize={selectedMeetingsSize * selectedDeviceIds.length}
      />

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
