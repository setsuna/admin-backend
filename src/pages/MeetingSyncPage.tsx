import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
import { deviceApi, sseService } from '@/services'
import { syncApi } from '@/services/api/sync.api'
import { BatchSyncPanel } from '@/components/business/sync/BatchSyncPanel'
import type { 
  OnlineDevice,
  SubTaskInfo,
  BatchSyncInfo,
  BatchTaskInfo
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

  const [selectedMeetingIds, setSelectedMeetingIds] = useState<string[]>([])
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([])
  const [searchMeeting, setSearchMeeting] = useState('')
  
  // 批量任务信息
  const [currentBatch, setCurrentBatch] = useState<BatchSyncInfo | null>(null)
  
  // 轮询定时器
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // 已订阅的任务ID集合
  const subscribedTasksRef = useRef<Set<string>>(new Set())
  
  // 缓存上一次的 statusCounts，用于判断是否需要查询详细 tasks
  const lastStatusCountsRef = useRef<{
    completed: number
    failed: number
    pending: number
    running: number
  } | null>(null)
  
  // 轮询配置（可调整）
  const POLL_INTERVAL = 5000 // 5秒轮询一次（原来是2秒，现在延长）
  
  // 稳定的回调引用
  const showSuccessRef = useRef(showSuccess)
  const showErrorRef = useRef(showError)
  const meetingsRef = useRef(meetings)
  
  useEffect(() => {
    showSuccessRef.current = showSuccess
    showErrorRef.current = showError
    meetingsRef.current = meetings
  }, [showSuccess, showError, meetings])

  // 订阅任务进度流（SSE）
  // 根据后端文档，事件类型为: connected, progress, complete
  useEffect(() => {
    // 监听连接成功事件
    const unsubscribeConnected = sseService.on('connected', (_event: any) => {
      // 连接成功
    })
    
    // 监听进度更新事件（后端事件类型: progress）
    const unsubscribeProgress = sseService.on('progress', (event: any) => {
      setCurrentBatch(prev => {
        if (!prev) return null
        
        const taskId = event.data.taskId
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
    
    // 监听完成事件（后端事件类型: complete）
    const unsubscribeComplete = sseService.on('complete', (event: any) => {
      setCurrentBatch(prev => {
        if (!prev) return null
        
        const taskId = event.data.taskId
        const task = prev.tasks.get(taskId)
        
        if (!task) return prev
        
        const updatedTask: BatchTaskInfo = {
          ...task,
          copyStatus: 'completed',
          progressPercent: 100
        }
        
        const newTasks = new Map(prev.tasks)
        newTasks.set(taskId, updatedTask)
        
        return {
          ...prev,
          tasks: newTasks
        }
      })
    })
    
    return () => {
      unsubscribeConnected()
      unsubscribeProgress()
      unsubscribeComplete()
    }
  }, [])

  // 轮询批量任务状态
  const pollBatchStatus = useCallback(async (batchId: string) => {
    try {
      const status = await syncApi.getBatchStatus(batchId)
      
      // 🎯 优化点1: 检查 statusCounts 是否发生变化
      const currentStatusCounts = status.statusCounts
      const lastStatusCounts = lastStatusCountsRef.current
      
      const hasStatusChanged = !lastStatusCounts || 
        currentStatusCounts.completed !== lastStatusCounts.completed ||
        currentStatusCounts.failed !== lastStatusCounts.failed ||
        currentStatusCounts.running !== lastStatusCounts.running ||
        currentStatusCounts.pending !== lastStatusCounts.pending
      
      if (!hasStatusChanged) {
        // 只更新汇总信息，不查询详细 tasks
        setCurrentBatch(prev => {
          if (!prev) return null
          return {
            ...prev,
            successCount: status.statusCounts.completed,
            failureCount: status.statusCounts.failed,
            status: status.status === 'completed' || status.status === 'partial_failed' ? 'completed' :
                    status.createdCount < status.totalCount ? 'creating' : 'syncing'
          }
        })
        
        // 检查是否完成
        if (status.status === 'completed' || status.status === 'partial_failed') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
        }
        
        return // 🎯 提前返回，不查询 tasks
      }
      
      // statusCounts 发生了变化，更新缓存并查询详细 tasks
      lastStatusCountsRef.current = { ...currentStatusCounts }
      
      const tasks = await syncApi.getBatchTasks(batchId)
      
      // 转换为前端使用的数据结构
      const tasksMap = new Map<string, BatchTaskInfo>()
      tasks.tasks.forEach((task: SubTaskInfo) => {
        const meeting = meetingsRef.current.find(m => String(m.id) === task.meetingId)
        const meetingName = meeting?.name || `会议-${task.meetingId}`
        
        const taskId = task.taskId || `${task.meetingId}-${task.serialNumber}`
        tasksMap.set(taskId, {
          taskId,
          meetingId: task.meetingId,
          meetingName,
          serialNumber: task.serialNumber,
          createStatus: task.status === 'failed' ? 'failed' : 'success',
          createError: task.errorMessage,
          packageSize: task.packageSize,
          fileCount: task.fileCount,
          createdAt: task.createdAt ? new Date(task.createdAt).getTime() : undefined,
          copyStatus: task.status === 'completed' ? 'completed' : 
                      task.status === 'running' ? 'copying' :
                      task.status === 'failed' ? 'failed' : 'idle',
          progressPercent: task.status === 'completed' ? 100 : 0,
          copiedBytes: 0,
          totalBytes: 0,
          speed: '',
          speedBytes: 0,
          eta: '',
          etaSeconds: 0,
          currentFile: ''
        })
        
        // 如果任务正在运行且还没订阅，订阅其进度流
        if (task.status === 'running' && task.taskId && !subscribedTasksRef.current.has(task.taskId)) {
          subscribedTasksRef.current.add(task.taskId)
          sseService.subscribeTaskProgress(task.taskId, task.serialNumber)
        }
      })
      
      setCurrentBatch({
        batchId: status.batchId,
        totalCount: status.totalCount,
        meetingCount: selectedMeetingIds.length,
        deviceCount: selectedDeviceIds.length,
        createdCount: status.createdCount,
        successCount: status.statusCounts.completed,
        failureCount: status.statusCounts.failed,
        tasks: tasksMap,
        startTime: status.createdAt * 1000,
        status: status.status === 'completed' || status.status === 'partial_failed' ? 'completed' :
                status.createdCount < status.totalCount ? 'creating' : 'syncing'
      })
      
      // 检查任务是否完成
      if (status.status === 'completed' || status.status === 'partial_failed') {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
      }
    } catch (error) {
      console.error('轮询批量任务状态失败:', error)
    }
  }, [selectedMeetingIds.length, selectedDeviceIds.length])

  // 清理轮询和SSE订阅
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      // 清理缓存
      lastStatusCountsRef.current = null
      // 清理所有SSE订阅
      subscribedTasksRef.current.forEach(taskId => {
        sseService.unsubscribeTaskProgress(taskId)
      })
      subscribedTasksRef.current.clear()
    }
  }, [])

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

  const handleStartSync = useCallback(async () => {
    // 防止重复提交：如果已经有正在进行的任务，不允许再次同步
    if (currentBatch && (currentBatch.status === 'creating' || currentBatch.status === 'syncing')) {
      return
    }
    
    if (selectedMeetingIds.length === 0) {
      return
    }
    if (selectedDeviceIds.length === 0) {
      return
    }
    
    try {
      // 创建批量同步任务（立即返回）
      const response = await syncApi.createBatchSync({
        meetingIds: selectedMeetingIds,
        serialNumbers: selectedDeviceIds,
        metadata: {
          operator: 'admin',
          timestamp: Date.now()
        }
      })
      
      // 任务已创建，开始轮询
      
      // 初始化批量任务信息
      setCurrentBatch({
        batchId: response.batchId,
        totalCount: response.totalCount,
        meetingCount: selectedMeetingIds.length,
        deviceCount: selectedDeviceIds.length,
        createdCount: 0,
        successCount: 0,
        failureCount: 0,
        tasks: new Map(),
        startTime: response.createdAt * 1000,
        status: 'creating'
      })
      
      // 开始轮询状态（每5秒）
      pollingIntervalRef.current = setInterval(() => {
        pollBatchStatus(response.batchId)
      }, POLL_INTERVAL)
      
      // 立即执行一次轮询
      pollBatchStatus(response.batchId)
      
    } catch (error: any) {
      console.error('创建批量同步任务失败:', error)
    }
  }, [selectedMeetingIds, selectedDeviceIds, currentBatch, showError, showSuccess, pollBatchStatus])

  const handleStopSync = useCallback(() => {
    // 清除轮询
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    
    // 清理缓存
    lastStatusCountsRef.current = null
    
    // 清理所有SSE订阅
    subscribedTasksRef.current.forEach(taskId => {
      sseService.unsubscribeTaskProgress(taskId)
    })
    subscribedTasksRef.current.clear()
    
    setCurrentBatch(prev => prev ? { ...prev, status: 'completed' } : null)
  }, [])

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
                停止监控
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
