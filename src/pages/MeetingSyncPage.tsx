import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, RefreshCw, Cable, Unplug } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Checkbox } from '@/components/ui/Checkbox'
import { useNotifications } from '@/hooks/useNotifications'
import { meetingApi } from '@/services/api/meeting.api'
import { deviceApi } from '@/services'
import { syncApi } from '@/services/api/sync.api'
import { wsService } from '@/services/core/websocket.service'
import type { 
  OnlineDevice, 
  SyncedMeeting, 
  SyncTask,
  DeviceSyncState,
  WSMessage,
  SyncProgressData,
  BatchSyncTaskResult
} from '@/types'
import { DeviceDetailModal } from '@/components/business/sync/DeviceDetailModal'
import { SyncHistoryModal } from '@/components/business/sync/SyncHistoryModal'
import { DeviceSyncProgress } from '@/components/business/sync/DeviceSyncProgress'
import { SyncConfirmDialog } from '@/components/business/sync/SyncConfirmDialog'

export default function MeetingSyncPage() {
  const { showError, showSuccess } = useNotifications()
  
  // 获取打包会议列表
  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['packaged-meetings'],
    queryFn: () => meetingApi.getPackagedMeetings(),
  })

  // 获取设备列表
  const { data: devicesData, isLoading: isDevicesLoading, refetch: refetchDevices } = useQuery({
    queryKey: ['online-devices'],
    queryFn: () => deviceApi.getOnlineDevices({ page: 1, size: 100 }),
  })

  const devices: OnlineDevice[] = devicesData?.items || []

  // 设备排序：在线状态优先显示在最上面
  const sortedDevices = [...devices].sort((a, b) => {
    if (a.status !== b.status) {
      return b.status - a.status
    }
    return a.serial_number.localeCompare(b.serial_number)
  })

  // 监听设备上线/下线消息，自动刷新设备列表
  useEffect(() => {
    console.log('[Device Status] 订阅设备上线/下线消息')
    
    const unsubscribeOnline = wsService.on('device_online', (message) => {
      console.log('[Device Status] 收到设备上线消息:', message.data)
      refetchDevices()
    })
    
    const unsubscribeOffline = wsService.on('device_offline', (message) => {
      console.log('[Device Status] 收到设备下线消息:', message.data)
      refetchDevices()
    })
    
    return () => {
      console.log('[Device Status] 取消订阅设备上线/下线消息')
      unsubscribeOnline()
      unsubscribeOffline()
    }
  }, [refetchDevices])

  const [selectedMeetingIds, setSelectedMeetingIds] = useState<string[]>([])
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([])
  const [searchMeeting, setSearchMeeting] = useState('')
  const [batchSyncEnabled, setBatchSyncEnabled] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const [selectedDevice, setSelectedDevice] = useState<OnlineDevice | null>(null)
  const [deviceSyncedMeetings, setDeviceSyncedMeetings] = useState<SyncedMeeting[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // 设备同步状态管理
  const [deviceSyncStates, setDeviceSyncStates] = useState<Map<string, DeviceSyncState>>(new Map())
  
  // 任务ID映射：taskId -> { deviceId, meetingId, meetingName }
  const taskMappingRef = useRef<Map<string, { deviceId: string; meetingId: string; meetingName: string }>>(new Map())
  
  // 从 localStorage 加载任务映射
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sync_task_mapping')
      if (saved) {
        const entries = JSON.parse(saved) as Array<[string, { deviceId: string; meetingId: string; meetingName: string }]>
        taskMappingRef.current = new Map(entries)
        console.log('[Sync] 从 localStorage 加载任务映射:', taskMappingRef.current.size, '个任务')
      }
    } catch (error) {
      console.error('[Sync] 加载任务映射失败:', error)
    }
  }, [])
  
  // 保存任务映射到 localStorage
  const saveTaskMapping = useCallback(() => {
    try {
      const entries = Array.from(taskMappingRef.current.entries())
      localStorage.setItem('sync_task_mapping', JSON.stringify(entries))
      console.log('[Sync] 保存任务映射到 localStorage:', entries.length, '个任务')
    } catch (error) {
      console.error('[Sync] 保存任务映射失败:', error)
    }
  }, [])

  // Debug: 监控 deviceSyncStates 变化
  useEffect(() => {
    if (deviceSyncStates.size > 0) {
      console.log('[Sync State] deviceSyncStates 更新:', {
        size: deviceSyncStates.size,
        keys: Array.from(deviceSyncStates.keys()),
        details: Array.from(deviceSyncStates.entries()).map(([key, state]) => ({
          deviceId: key,
          taskCount: state.tasks.size,
          isActive: state.isActive
        }))
      })
    }
  }, [deviceSyncStates])

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
  const handleSyncProgress = useCallback((message: WSMessage<SyncProgressData>) => {
    console.log('[Sync Progress] 收到同步进度消息:', message.data)
    const { task_id, progress, speed, eta } = message.data
    
    // 通过 taskId 查找对应的设备和会议信息
    const taskInfo = taskMappingRef.current.get(task_id)
    if (!taskInfo) {
      console.warn('[Sync Progress] 未找到任务映射:', task_id)
      return
    }
    
    const { deviceId, meetingId, meetingName } = taskInfo
    console.log('[Sync Progress] 任务映射:', { task_id, deviceId, meetingId, meetingName })

    setDeviceSyncStates(prev => {
      const newStates = new Map(prev)
      const deviceState = newStates.get(deviceId) || {
        deviceId: deviceId,
        tasks: new Map(),
        isActive: true
      }

    
      deviceState.tasks.set(task_id, {
        taskId: task_id,
        meetingId: meetingId,
        meetingName: meetingName,
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
      
      // 如果任务完成，从映射表中移除
      if (progress >= 100) {
        setTimeout(() => {
          taskMappingRef.current.delete(task_id)
          saveTaskMapping()
          console.log('[Sync Progress] 任务完成，从映射表移除:', task_id)
        }, 5000) // 5秒后清理
      }

      newStates.set(deviceId, deviceState)
      console.log('[Sync Progress] 更新设备状态:', {
        deviceId,
        taskCount: deviceState.tasks.size,
        isActive: deviceState.isActive,
        progress
      })
      return newStates
    })
  }, [saveTaskMapping])

  // 订阅 WebSocket 同步进度消息
  useEffect(() => {
    console.log('[Sync WebSocket] 订阅同步进度消息')
    console.log('[Sync WebSocket] 当前连接状态:', wsService.getConnectionState())
    
    // 订阅所有消息用于调试
    const unsubscribeAll = wsService.on('*', (msg) => {
      if (msg.type === 'sync_progress') {
        console.log('[Sync WebSocket] 收到 sync_progress 消息 (wildcard):', msg)
      }
    })
    
    const unsubscribe = wsService.on('sync_progress', handleSyncProgress)
    
    return () => {
      console.log('[Sync WebSocket] 取消订阅同步进度消息')
      unsubscribeAll()
      unsubscribe()
    }
  }, [handleSyncProgress])

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
    // 只能选择在线设备（status === 1）
    if (!device || device.status !== 1) {
      return
    }
    
    setSelectedDeviceIds(prev => 
      prev.includes(deviceId) 
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    )
  }

  const handleSelectAllDevices = () => {
    // 只能全选在线设备（status === 1）
    const onlineDevices = devices.filter(d => d.status === 1)
    if (selectedDeviceIds.length === onlineDevices.length) {
      setSelectedDeviceIds([])
    } else {
      setSelectedDeviceIds(onlineDevices.map(d => d.serial_number))
    }
  }

  const handleSelectAllMeetings = () => {
    if (selectedMeetingIds.length === filteredMeetings.length) {
      setSelectedMeetingIds([])
    } else {
      setSelectedMeetingIds(filteredMeetings.map(m => String(m.id)))
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
    
    try {
      // 🚀 使用批量接口：一次请求完成所有任务创建
      const batchResult = await syncApi.batchSyncMeetingPackage(
        selectedMeetingIds,
        selectedDeviceIds,
        {
          operator: 'admin',
          batch_id: `batch_${Date.now()}`
        }
      )
      
      console.log('[Batch Sync] 批量同步结果:', batchResult)
      
      // 批量处理成功的任务
      const newTaskMappings = new Map<string, DeviceSyncState>()
      
      batchResult.results.forEach((result: BatchSyncTaskResult) => {
        if (result.success && result.taskId) {
          const meeting = selectedMeetings.find(m => String(m.id) === result.meetingId)
          if (!meeting) return
          
          // 保存任务映射
          taskMappingRef.current.set(result.taskId, {
            deviceId: result.serialNumber,
            meetingId: result.meetingId,
            meetingName: meeting.name
          })
          
          // 收集设备状态（按设备分组）
          if (!newTaskMappings.has(result.serialNumber)) {
            newTaskMappings.set(result.serialNumber, {
              deviceId: result.serialNumber,
              tasks: new Map(),
              isActive: true
            })
          }
          
          newTaskMappings.get(result.serialNumber)!.tasks.set(result.taskId, {
            taskId: result.taskId,
            meetingId: result.meetingId,
            meetingName: meeting.name,
            status: 'pending',
            progress: 0
          })
        } else if (!result.success) {
          console.error(
            `[Batch Sync] 任务失败 [${result.meetingId} -> ${result.serialNumber}]:`,
            result.errorMessage
          )
        }
      })
      
      // 一次性更新所有设备状态
      setDeviceSyncStates(prev => {
        const newStates = new Map(prev)
        newTaskMappings.forEach((state, deviceId) => {
          newStates.set(deviceId, state)
        })
        return newStates
      })
      
      // 持久化任务映射
      saveTaskMapping()
      
      console.log('[Batch Sync] 统计:', {
        totalRequests: batchResult.totalRequests,
        successCount: batchResult.successCount,
        failureCount: batchResult.failureCount,
        successRate: batchResult.summary.successRate.toFixed(2) + '%'
      })
      
    } catch (error) {
      console.error('[Batch Sync] 批量同步失败:', error)
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
    .reduce((sum, m) => sum + ((m as any).package_info?.package_size || 0), 0)

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0B'
    const mb = bytes / (1024 * 1024)
    if (mb < 0.1) {
      const kb = bytes / 1024
      return `${kb.toFixed(1)}KB`
    }
    return `${mb.toFixed(1)}MB`
  }

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
            <div className="flex items-center justify-between mb-3">
              <CardTitle>会议列表</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAllMeetings}
              >
                全选
              </Button>
            </div>
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
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedMeetingIds.includes(String(meeting.id))}
                    onChange={() => {}}
                  />
                  <div className="flex-1 flex items-center justify-between gap-4 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-medium truncate">{meeting.name}</span>
                      <Badge variant={getSecurityLevelVariant((meeting as any).security_level)} className="shrink-0">
                        {getSecurityLevelText((meeting as any).security_level)}
                      </Badge>
                      <Badge variant={(meeting as any).type === 'standard' ? 'default' : 'info'} className="shrink-0">
                        {(meeting as any).type === 'standard' ? '标准会议' : '平板会议'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap shrink-0">
                      {new Date((meeting as any).start_time).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })} | 
                      {(meeting as any).package_info ? ` ${formatFileSize((meeting as any).package_info.package_size)}` : ' 未打包'}
                      {(meeting as any).package_info && (
                        <> | 文件: {(meeting as any).package_info.file_count} 个 | 投票: {(meeting as any).package_info.vote_count} 个</>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </CardContent>

          <div className="px-6 py-4 border-t bg-muted flex items-center justify-start">
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
                  // 只有在线设备可以勾选
                  const canSelect = isOnline
                  
                  // Debug: 检查设备同步状态
                  if (deviceState) {
                    console.log('[Device Render] 设备有同步状态:', {
                      serial_number: device.serial_number,
                      taskCount: deviceTasks.length,
                      tasks: deviceTasks
                    })
                  }
                  
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
                            disabled={!canSelect}
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

          <div className="px-6 py-4 border-t bg-muted flex items-center justify-start">
            <div className="text-sm text-muted-foreground">
              已选择: {selectedDeviceIds.length} 台设备 | 预计需要: {formatFileSize(selectedMeetingsSize * selectedDeviceIds.length)}
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
        totalSize={selectedMeetingsSize}
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
