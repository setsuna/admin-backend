import { CheckCircle2, XCircle, Loader2, Clock, Eye } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { BatchTaskInfo } from '@/types'

interface TaskItemProps {
  task: BatchTaskInfo
  onViewDetail?: (task: BatchTaskInfo) => void
  showSerialNumber?: boolean // 是否显示设备序列号
}


export function TaskItem({ task, onViewDetail, showSerialNumber = true }: TaskItemProps) {
  const getStatusIcon = () => {
    if (task.createStatus === 'failed') {
      return <XCircle className="w-5 h-5 text-destructive shrink-0" />
    }
    if (task.copyStatus === 'completed') {
      return <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
    }
    if (task.copyStatus === 'copying') {
      return <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
    }
    if (task.createStatus === 'success') {
      return <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
    }
    return <Loader2 className="w-5 h-5 text-muted-foreground animate-spin shrink-0" />
  }

  const getStatusText = () => {
    if (task.createStatus === 'pending') return '创建中'
    if (task.createStatus === 'failed') return '创建失败'
    if (task.copyStatus === 'idle') return '等待拷贝'
    if (task.copyStatus === 'copying') return '拷贝中'
    if (task.copyStatus === 'completed') return '已完成'
    return '处理中'
  }

  // 只有成功创建的任务才能查看详情
  const canViewDetail = task.createStatus === 'success' && task.taskId

  return (
    <Card className="p-3">
      <div className="flex items-start gap-3">
        {getStatusIcon()}
        
        <div className="flex-1 min-w-0 space-y-2">
          {/* 任务信息 */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium text-sm truncate">
                {task.meetingName}
              </span>
              {showSerialNumber && (
                <>
                  <span className="text-xs text-muted-foreground">→</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {task.serialNumber}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {getStatusText()}
              </span>
              {canViewDetail && onViewDetail && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewDetail(task)
                  }}
                >
                  <Eye className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* 创建失败信息 */}
          {task.createStatus === 'failed' && task.createError && (
            <div className="text-xs text-destructive">
              {task.createError}
            </div>
          )}

          {/* 拷贝进度 */}
          {task.createStatus === 'success' && task.copyStatus !== 'idle' && (
            <div className="space-y-1">
              {/* 进度条 */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${task.progressPercent}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {task.progressPercent.toFixed(0)}%
                </span>
              </div>

              {/* 详细信息 */}
              {task.copyStatus === 'copying' && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{task.speed}</span>
                  <span>•</span>
                  <span>剩余 {task.eta}</span>
                  {task.currentFile && (
                    <>
                      <span>•</span>
                      <span className="truncate">{task.currentFile}</span>
                    </>
                  )}
                </div>
              )}


            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
