import { useMemo } from 'react'
import type { SyncTaskProgress } from '@/types'

interface DeviceSyncProgressProps {
  tasks: SyncTaskProgress[]
  className?: string
}

export function DeviceSyncProgress({ tasks, className = '' }: DeviceSyncProgressProps) {
  // 计算整体进度（所有任务的平均进度）
  const { overallProgress, activeTask, stats } = useMemo(() => {
    if (tasks.length === 0) {
      return { overallProgress: 0, activeTask: null, stats: null }
    }

    const total = tasks.reduce((sum, task) => sum + task.progress, 0)
    const avg = total / tasks.length
    
    // 查找当前活动任务（processing 状态）
    const active = tasks.find(t => t.status === 'processing')
    
    // 统计
    const completed = tasks.filter(t => t.status === 'done').length
    const failed = tasks.filter(t => t.status === 'failed').length
    
    return {
      overallProgress: avg,
      activeTask: active || tasks[tasks.length - 1],
      stats: {
        total: tasks.length,
        completed,
        failed,
        pending: tasks.length - completed - failed
      }
    }
  }, [tasks])

  if (tasks.length === 0) {
    return null
  }

  // 根据状态决定颜色
  const getProgressColor = () => {
    if (stats?.failed && stats.failed > 0) return 'bg-red-500'
    if (overallProgress >= 100) return 'bg-green-500'
    return 'bg-blue-500'
  }

  return (
    <div className={`w-full ${className}`}>
      {/* 进度条 */}
      <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${Math.min(overallProgress, 100)}%` }}
        />
      </div>

      {/* 进度信息 */}
      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {overallProgress.toFixed(1)}%
          </span>
          {activeTask && (
            <>
              <span>•</span>
              <span className="truncate max-w-[120px]" title={activeTask.meetingName}>
                {activeTask.meetingName}
              </span>
              {activeTask.status === 'failed' && activeTask.error && (
                <>
                  <span>•</span>
                  <span className="text-red-500" title={activeTask.error}>
                    失败
                  </span>
                </>
              )}
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {activeTask?.speed && (
            <span>{activeTask.speed}</span>
          )}
          {activeTask?.eta && activeTask.status === 'processing' && (
            <>
              <span>•</span>
              <span>剩余 {activeTask.eta}</span>
            </>
          )}
          {stats && (
            <>
              <span>•</span>
              <span>
                {stats.completed}/{stats.total}
                {stats.failed > 0 && (
                  <span className="text-red-500 ml-1">(失败: {stats.failed})</span>
                )}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
