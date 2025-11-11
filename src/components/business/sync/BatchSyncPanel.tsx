import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { TaskItem } from './TaskItem'
import { TaskDetailModal } from './TaskDetailModal'
import type { BatchSyncInfo, BatchTaskInfo } from '@/types'

interface BatchSyncPanelProps {
  batchInfo: BatchSyncInfo | null
}

export function BatchSyncPanel({ batchInfo }: BatchSyncPanelProps) {
  const [selectedTask, setSelectedTask] = useState<BatchTaskInfo | null>(null)

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

  const tasks = Array.from(batchInfo.tasks.values())
  const createPercentage = batchInfo.totalCount > 0 
    ? (batchInfo.createdCount / batchInfo.totalCount) * 100 
    : 0

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            批次任务 #{batchInfo.batchId.slice(-8)}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col space-y-4">
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

          {/* 任务列表 */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="text-sm font-medium mb-2">拷贝进度</div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {tasks.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  暂无任务
                </div>
              ) : (
                tasks.map(task => (
                  <TaskItem 
                    key={task.taskId} 
                    task={task}
                    onViewDetail={setSelectedTask}
                  />
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
