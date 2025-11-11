import { useEffect, useState, useRef } from 'react'
import { X, Loader2, CheckCircle2, FileText, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { sseService } from '@/services/core/sse.service'
import type { BatchTaskInfo } from '@/types'

interface TaskDetailModalProps {
  task: BatchTaskInfo
  onClose: () => void
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

export function TaskDetailModal({ task: initialTask, onClose }: TaskDetailModalProps) {
  const [task, setTask] = useState<BatchTaskInfo>(initialTask)
  const isSubscribed = useRef(false)

  useEffect(() => {
    // 如果任务还没完成且没有订阅过，订阅实时进度
    if (task.copyStatus !== 'completed' && task.taskId && !isSubscribed.current) {
      console.log('[TaskDetailModal] 订阅任务进度:', task.taskId, task.serialNumber)
      isSubscribed.current = true
      
      // 订阅进度更新
      const unsubscribe = sseService.on('task_progress', (event: any) => {
        console.log('[TaskDetailModal] 收到进度更新:', event.data)
        if (event.data.taskId === task.taskId) {
          setTask(prev => ({
            ...prev,
            copyStatus: 'copying',
            progressPercent: event.data.progressPercent || 0,
            copiedBytes: event.data.copiedBytes || 0,
            totalBytes: event.data.totalBytes || 0,
            speed: event.data.speed || '',
            speedBytes: event.data.speedBytes || 0,
            eta: event.data.eta || '',
            etaSeconds: event.data.etaSeconds || 0,
            currentFile: event.data.currentFile || ''
          }))
        }
      })

      // 订阅完成事件
      const unsubscribeCompleted = sseService.on('task_completed', (event: any) => {
        console.log('[TaskDetailModal] 收到完成事件:', event.data)
        if (event.data.taskId === task.taskId) {
          setTask(prev => ({
            ...prev,
            copyStatus: 'completed',
            progressPercent: 100
          }))
        }
      })

      // 开始订阅SSE流
      sseService.subscribeTaskProgress(task.taskId, task.serialNumber)

      return () => {
        console.log('[TaskDetailModal] 取消订阅:', task.taskId)
        unsubscribe()
        unsubscribeCompleted()
        sseService.unsubscribeTaskProgress(task.taskId)
        isSubscribed.current = false
      }
    }
  }, [task.taskId, task.serialNumber, task.copyStatus])

  const isCompleted = task.copyStatus === 'completed'
  const isInProgress = task.copyStatus === 'copying'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : isInProgress ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <Clock className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <h2 className="text-lg font-semibold">任务详情</h2>
              <p className="text-sm text-muted-foreground">
                {task.meetingName} → {task.serialNumber}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 基本信息 */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">基本信息</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">任务ID:</span>
                <p className="font-mono text-xs mt-1">{task.taskId}</p>
              </div>
              <div>
                <span className="text-muted-foreground">会议ID:</span>
                <p className="font-mono text-xs mt-1">{task.meetingId}</p>
              </div>
              <div>
                <span className="text-muted-foreground">设备序列号:</span>
                <p className="font-mono text-xs mt-1">{task.serialNumber}</p>
              </div>
              <div>
                <span className="text-muted-foreground">创建时间:</span>
                <p className="text-xs mt-1">
                  {task.createdAt ? new Date(task.createdAt * 1000).toLocaleString('zh-CN') : '-'}
                </p>
              </div>
              {task.packageSize && (
                <div>
                  <span className="text-muted-foreground">包大小:</span>
                  <p className="text-xs mt-1">{formatBytes(task.packageSize)}</p>
                </div>
              )}
              {task.fileCount && (
                <div>
                  <span className="text-muted-foreground">文件数量:</span>
                  <p className="text-xs mt-1">{task.fileCount} 个文件</p>
                </div>
              )}
            </div>
          </div>

          {/* 拷贝进度 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">拷贝进度</h3>
            
            {/* 进度条 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">整体进度</span>
                <span className="font-medium">{task.progressPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    isCompleted ? 'bg-success' : 'bg-primary'
                  }`}
                  style={{ width: `${task.progressPercent}%` }}
                />
              </div>
            </div>

            {/* 详细信息 */}
            {task.totalBytes > 0 && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">已拷贝:</span>
                  <p className="font-medium mt-1">{formatBytes(task.copiedBytes)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">总大小:</span>
                  <p className="font-medium mt-1">{formatBytes(task.totalBytes)}</p>
                </div>
                {isInProgress && (
                  <>
                    <div>
                      <span className="text-muted-foreground">传输速度:</span>
                      <p className="font-medium mt-1">{task.speed || '-'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">剩余时间:</span>
                      <p className="font-medium mt-1">{task.eta || '-'}</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 当前文件 */}
            {isInProgress && task.currentFile && (
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">当前文件:</span>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-mono truncate">{task.currentFile}</span>
                </div>
              </div>
            )}

            {/* 状态提示 */}
            {task.copyStatus === 'idle' && (
              <div className="text-sm text-muted-foreground text-center py-4">
                等待后台开始拷贝任务...
              </div>
            )}

            {isCompleted && (
              <div className="text-sm text-success text-center py-4 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                拷贝完成
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          <Button onClick={onClose}>
            关闭
          </Button>
        </div>
      </Card>
    </div>
  )
}
