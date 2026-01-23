import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { TaskItem } from './TaskItem'
import { TaskDetailModal } from './TaskDetailModal'
import type { BatchSyncInfo, BatchTaskInfo } from '@/types'

// 设备分组信息
interface DeviceGroup {
  serialNumber: string
  tasks: BatchTaskInfo[]
  completedCount: number
  totalCount: number
}

interface BatchSyncPanelProps {
  batchInfo: BatchSyncInfo | null
}

export function BatchSyncPanel({ batchInfo }: BatchSyncPanelProps) {
  const [selectedTask, setSelectedTask] = useState<BatchTaskInfo | null>(null)

  // 按设备分组 - 必须在条件返回之前
  const deviceGroups = useMemo(() => {
    if (!batchInfo) return []
    
    const tasks = Array.from(batchInfo.tasks.values())
    const groupMap = new Map<string, BatchTaskInfo[]>()
    
    tasks.forEach(task => {
      const existing = groupMap.get(task.serialNumber) || []
      existing.push(task)
      groupMap.set(task.serialNumber, existing)
    })
    
    const groups: DeviceGroup[] = []
    groupMap.forEach((taskList, serialNumber) => {
      const completedCount = taskList.filter(
        t => t.copyStatus === 'completed'
      ).length
      groups.push({
        serialNumber,
        tasks: taskList,
        completedCount,
        totalCount: taskList.length
      })
    })
    
    // 按序列号排序
    return groups.sort((a, b) => a.serialNumber.localeCompare(b.serialNumber))
  }, [batchInfo])

  if (!batchInfo) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">选择会议和设备后，点击"开始同步"</p>
            <p className="text-xs mt-1">任务执行情况将在这里显示</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const createPercentage = batchInfo.totalCount > 0 
    ? (batchInfo.createdCount / batchInfo.totalCount) * 100 
    : 0

  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden min-h-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            批次任务 #{batchInfo.batchId.slice(-8)}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col space-y-4 min-h-0">
          {/* 任务创建进度 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">任务创建</span>
              <span className="text-muted-foreground">
                {batchInfo.createdCount}/{batchInfo.totalCount} ({createPercentage.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${createPercentage}%` }}
              />
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>成功: {batchInfo.successCount}</span>
              <span>失败: {batchInfo.failureCount}</span>
              <span>待创建: {batchInfo.totalCount - batchInfo.createdCount}</span>
            </div>
          </div>

          {/* 批次整体拷贝进度 */}
          {batchInfo.progress && batchInfo.progress.runningTasks > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">整体拷贝进度</span>
                <span className="text-muted-foreground">
                  {batchInfo.progress.progressPercent.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all duration-300"
                  style={{ width: `${batchInfo.progress.progressPercent}%` }}
                />
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>速度: {batchInfo.progress.speed}</span>
                <span>运行中: {batchInfo.progress.runningTasks} 个任务</span>
              </div>
            </div>
          )}

          {/* 任务列表 - 按设备分组 */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="text-sm font-medium mb-2">拷贝进度</div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
              {deviceGroups.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  暂无任务
                </div>
              ) : (
                deviceGroups.map(group => (
                  <div key={group.serialNumber} className="space-y-2">
                    {/* 设备分组标题 */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex-1 h-px bg-border" />
                      <span className="font-medium">
                        {group.serialNumber} ({group.completedCount}/{group.totalCount})
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    {/* 该设备的任务列表 */}
                    {group.tasks.map(task => (
                      <TaskItem 
                        key={task.taskId} 
                        task={task}
                        onViewDetail={setSelectedTask}
                        showSerialNumber={false}
                      />
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 任务详情模态框 */}
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  )
}
