import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Search, RefreshCw, Cable, Unplug } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Checkbox } from '@/components/ui/Checkbox'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { useNotifications } from '@/hooks/useNotifications'
import { meetingApi } from '@/services/api/meeting.api'
import { deviceApi } from '@/services'
import { wsService } from '@/services/core/websocket.service'
import { sseService } from '@/services/core/sse.service'
import { BatchSyncPanel } from '@/components/business/sync/BatchSyncPanel'
import type { 
  OnlineDevice, 
  BatchSyncInfo,
  BatchTaskInfo,
  SSEStartEvent,
  SSETaskCreatedEvent,
  SSETaskProgressEvent,
  SSETaskCompletedEvent,
  SSECompleteEvent,
  SSEErrorEvent
} from '@/types'

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
  const sortedDevices = useMemo(() => {
    return [...devices].sort((a, b) => {
      if (a.status !== b.status) {
        return b.status - a.status
      }
      return a.serial_number.localeCompare(b.serial_number)
    })
  }, [devices])

  // 监听设备上线/下线消息，自动刷新设备列表
  useEffect(() => {
    const unsubscribeOnline = wsService.on('device_online', () => {
      refetchDevices()
    })
    
    const unsubscribeOffline = wsService.on('device_offline', () => {
      refetchDevices()
    })
    
    return () => {
      unsubscribeOnline()
      unsubscribeOffline()
    }
  }, [refetchDevices])

  const [selectedMeetingIds, setSelectedMeetingIds] = useState<string[]>([])
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([])
  const [searchMeeting, setSearchMeeting] = useState('')
  
  // 批次任务信息
  const [currentBatch, setCurrentBatch] = useState<BatchSyncInfo | null>(null)
  
  // taskId 映射：用于单任务进度流事件补充信息
  const taskInfoMapRef = useRef<Map<string, { meetingId: string; serialNumber: string }>>(new Map())
  
  // 稳定的回调引用
  const showSuccessRef = useRef(showSuccess)
  const showErrorRef = useRef(showError)
  const meetingsRef = useRef(meetings)
  
  useEffect(() => {
    showSuccessRef.current = showSuccess
    showErrorRef.current = showError
    meetingsRef.current = meetings
  }, [showSuccess, showError, meetings])

  // SSE 事件处理器 - 只在组件挂载时订阅一次
  useEffect(() => {
    // start 事件
    const unsubscribeStart = sseService.on<SSEStartEvent['data']>('start', (event) => {
      const batchId = `batch_${Date.now()}`
      setCurrentBatch({
        batchId,
        totalCount: event.data.totalCount,
        meetingCount: event.data.meetingCount,
        deviceCount: event.data.deviceCount,
        createdCount: 0,
        successCount: 0,
        failureCount: 0,
        tasks: new Map(),
        startTime: Date.now(),
        status: 'creating'
      })
      showSuccessRef.current('开始同步', `正在同步 ${event.data.meetingCount} 个会议到 ${event.data.deviceCount} 台设备`)
    })
    
    // task_created 事件
    const unsubscribeTaskCreated = sseService.on<SSETaskCreatedEvent['data']>('task_created', (event) => {
      setCurrentBatch(prev => {
        if (!prev) return null
        
        const meeting = meetingsRef.current.find(m => String(m.id) === event.data.meetingId)
        const meetingName = meeting?.name || `会议-${event.data.meetingId}`
        
        const taskId = event.data.taskId || `${event.data.meetingId}-${event.data.serialNumber}`
        const newTask: BatchTaskInfo = {
          taskId,
          meetingId: event.data.meetingId,
          meetingName,
          serialNumber: event.data.serialNumber,
          createStatus: event.data.success ? 'success' : 'failed',
          createError: event.data.errorMessage,
          packageSize: event.data.packageSize,
          fileCount: event.data.fileCount,
          createdAt: event.data.createdAt,
          copyStatus: 'idle',
          progressPercent: 0,
          copiedBytes: 0,
          totalBytes: 0,
          speed: '',
          speedBytes: 0,
          eta: '',
          etaSeconds: 0,
          currentFile: ''
        }
        
        const newTasks = new Map(prev.tasks)
        newTasks.set(taskId, newTask)
        
        return {
          ...prev,
          createdCount: event.data.current,
          successCount: prev.successCount + (event.data.success ? 1 : 0),
          failureCount: prev.failureCount + (event.data.success ? 0 : 1),
          tasks: newTasks,
          status: event.data.current === prev.totalCount ? 'syncing' : 'creating'
        }
      })
      
      // 如果任务创建成功，订阅该任务的进度流
      if (event.data.success && event.data.taskId) {
        taskInfoMapRef.current.set(event.data.taskId, {
          meetingId: event.data.meetingId,
          serialNumber: event.data.serialNumber
        })
        sseService.subscribeTaskProgress(event.data.taskId, event.data.serialNumber)
      }
    })
    
    // task_progress 事件
    const unsubscribeTaskProgress = sseService.on<SSETaskProgressEvent['data']>('task_progress', (event) => {
      setCurrentBatch(prev => {
        if (!prev) return null
        
        // 如果事件数据没有 meetingId/serialNumber，从映射表中获取
        let taskId = event.data.taskId
        let meetingId = event.data.meetingId
        let serialNumber = event.data.serialNumber
        
        if (!meetingId || !serialNumber) {
          const taskInfo = taskInfoMapRef.current.get(taskId)
          if (taskInfo) {
            meetingId = taskInfo.meetingId
            serialNumber = taskInfo.serialNumber
          }
        }
        
        const task = prev.tasks.get(taskId)
        if (!task) return prev
        
        const updatedTask: BatchTaskInfo = {
          ...task,
          copyStatus: 'copying',
          progressPercent: event.data.progressPercent || 0,
          copiedBytes: event.data.copiedBytes || 0,
          totalBytes: event.data.totalBytes || 0,
          speed: event.data.speed || '',
          speedBytes: event.data.speedBytes || 0,
          eta: event.data.eta || '',
          etaSeconds: event.data.etaSeconds || 0,
          currentFile: event.data.currentFile || ''
        }
        
        const newTasks = new Map(prev.tasks)
        newTasks.set(taskId, updatedTask)
        
        return {
          ...prev,
          tasks: newTasks
        }
      })
    })
    
    // task_completed 事件
    const unsubscribeTaskCompleted = sseService.on<SSETaskCompletedEvent['data']>('task_completed', (event) => {
      setCurrentBatch(prev => {
        if (!prev) return null
        
        const task = prev.tasks.get(event.data.taskId)
        if (!task) return prev
        
        const updatedTask: BatchTaskInfo = {
          ...task,
          copyStatus: 'completed',
          progressPercent: 100
        }
        
        const newTasks = new Map(prev.tasks)
        newTasks.set(event.data.taskId, updatedTask)
        
        // 清理映射表
        taskInfoMapRef.current.delete(event.data.taskId)
        
        return {
          ...prev,
          tasks: newTasks
        }
      })
    })
    
    // complete 事件
    const unsubscribeComplete = sseService.on<SSECompleteEvent['data']>('complete', (event) => {
      setCurrentBatch(prev => {
        if (!prev) return null
        return {
          ...prev,
          status: 'completed'
        }
      })
      
      const { successCount, failureCount, duration, summary } = event.data
      
      if (failureCount === 0) {
        showSuccessRef.current(
          '同步完成',
          `成功同步 ${successCount} 个任务，耗时 ${duration.toFixed(1)} 秒`
        )
      } else {
        showErrorRef.current(
          '同步完成（部分失败）',
          `成功 ${successCount} 个，失败 ${failureCount} 个，成功率 ${summary.successRate.toFixed(1)}%`
        )
      }
      
      // ✅ 在收到 complete 事件时才关闭连接
      sseService.close()
    })
    
    // error 事件
    const unsubscribeError = sseService.on<SSEErrorEvent['data']>('error', (event) => {
      showErrorRef.current('同步错误', event.data.message || '同步过程中发生错误')
      setCurrentBatch(prev => prev ? { ...prev, status: 'completed' } : null)
      
      // ✅ 在错误时关闭连接
      sseService.close()
    })
    
    // ⚠️ 清理函数：只取消订阅，不关闭 SSE 连接
    return () => {
      unsubscribeStart()
      unsubscribeTaskCreated()
      unsubscribeTaskProgress()
      unsubscribeTaskCompleted()
      unsubscribeComplete()
      unsubscribeError()
      // ❌ 不在这里关闭连接！让 complete/error 事件或用户手动关闭
    }
  }, []) // 空依赖，只在挂载时执行一次

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

  const handleStartSync = useCallback(() => {
    // 防止重复提交：如果已经有正在进行的任务，不允许再次同步
    if (currentBatch && (currentBatch.status === 'creating' || currentBatch.status === 'syncing')) {
      showError('同步进行中', '请等待当前同步任务完成')
      return
    }
    
    if (selectedMeetingIds.length === 0) {
      showError('请选择会议', '请至少选择一个会议进行同步')
      return
    }
    if (selectedDeviceIds.length === 0) {
      showError('请选择设备', '请至少选择一个设备进行同步')
      return
    }
    
    sseService.startBatchSync(
      selectedMeetingIds,
      selectedDeviceIds,
      {
        operator: 'admin',
        batch_id: `batch_${Date.now()}`
      }
    )
  }, [selectedMeetingIds, selectedDeviceIds, currentBatch, showError])

  const handleStopSync = useCallback(() => {
    sseService.close()
    setCurrentBatch(prev => prev ? { ...prev, status: 'completed' } : null)
    showSuccess('已停止', '同步任务已手动停止')
  }, [showSuccess])

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
      secret: '秘密',
      confidential: '机密',
      internal: '内部'
    }
    return texts[level] || '内部'
  }

  const filteredMeetings = useMemo(() => {
    return meetings.filter(meeting => 
      meeting.name.toLowerCase().includes(searchMeeting.toLowerCase())
    )
  }, [meetings, searchMeeting])

  const selectedMeetingsSize = useMemo(() => {
    return meetings
      .filter(m => selectedMeetingIds.includes(String(m.id)))
      .reduce((sum, m) => sum + ((m as any).package_info?.package_size || 0), 0)
  }, [meetings, selectedMeetingIds])

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

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">会议文件同步到设备</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-[2fr_3fr] gap-4 overflow-hidden">
        {/* Left Panel - Selection */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="pb-3">
            <Tabs defaultValue="meetings" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="meetings" className="flex-1">
                  会议列表 ({selectedMeetingIds.length})
                </TabsTrigger>
                <TabsTrigger value="devices" className="flex-1">
                  设备列表 ({selectedDeviceIds.length})
                </TabsTrigger>
              </TabsList>

              {/* Meetings Tab */}
              <TabsContent value="meetings" className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="搜索会议..."
                      value={searchMeeting}
                      onChange={(e) => setSearchMeeting(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAllMeetings}
                    className="ml-2"
                  >
                    全选
                  </Button>
                </div>

                <div className="h-[calc(100vh-400px)] overflow-y-auto space-y-2">
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
                      className={`p-3 cursor-pointer transition-all ${
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
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{meeting.name}</span>
                            <Badge variant={getSecurityLevelVariant((meeting as any).security_level)} className="shrink-0">
                              {getSecurityLevelText((meeting as any).security_level)}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date((meeting as any).start_time).toLocaleDateString('zh-CN')} | 
                            {(meeting as any).package_info ? ` ${formatFileSize((meeting as any).package_info.package_size)}` : ' 未打包'}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="pt-3 border-t text-sm text-muted-foreground">
                  已选择: {selectedMeetingIds.length} 个会议
                </div>
              </TabsContent>

              {/* Devices Tab */}
              <TabsContent value="devices" className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">在线设备</span>
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

                <div className="h-[calc(100vh-400px)] overflow-y-auto space-y-2">
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
                      const canSelect = isOnline
                      
                      return (
                        <Card
                          key={device.serial_number}
                          className={`p-3 transition-all ${
                            selectedDeviceIds.includes(device.serial_number)
                              ? 'border-primary bg-primary/5'
                              : ''
                          } ${!canSelect ? 'opacity-50' : 'cursor-pointer'}`}
                          hover={canSelect ? 'border' : undefined}
                          onClick={() => canSelect && handleDeviceSelect(device.serial_number)}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedDeviceIds.includes(device.serial_number)}
                              onChange={() => {}}
                              disabled={!canSelect}
                            />
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm truncate">{device.serial_number}</span>
                                <Badge variant={statusVariant} className="flex items-center gap-1 shrink-0">
                                  {isOnline && <Cable className="w-3 h-3" />}
                                  {device.status === 0 && <Unplug className="w-3 h-3" />}
                                  {device.status_name}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                最后在线: {device.last_login 
                                  ? new Date(device.last_login).toLocaleString('zh-CN', {
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : '-'
                                }
                              </div>
                            </div>
                          </div>
                        </Card>
                      )
                    })
                  )}
                </div>

                <div className="pt-3 border-t text-sm text-muted-foreground">
                  已选择: {selectedDeviceIds.length} 台设备 | 预计需要: {formatFileSize(selectedMeetingsSize * selectedDeviceIds.length)}
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>

          <div className="px-6 py-4 border-t">
            {currentBatch && (currentBatch.status === 'creating' || currentBatch.status === 'syncing') ? (
              <Button
                onClick={handleStopSync}
                variant="destructive"
                className="w-full"
              >
                停止同步
              </Button>
            ) : (
              <Button
                onClick={handleStartSync}
                disabled={selectedMeetingIds.length === 0 || selectedDeviceIds.length === 0}
                className="w-full"
              >
                开始同步
              </Button>
            )}
          </div>
        </Card>

        {/* Right Panel - Batch Sync Status */}
        <BatchSyncPanel batchInfo={currentBatch} />
      </div>
    </div>
  )
}
