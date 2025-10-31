import { X, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { SyncTask, SyncTaskStatus } from '@/types'

interface SyncHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  tasks: SyncTask[]
}

type FilterStatus = 'all' | 'running' | 'completed' | 'failed' | 'pending'

export function SyncHistoryModal({ isOpen, onClose, tasks }: SyncHistoryModalProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

  if (!isOpen) return null

  const filteredTasks = filterStatus === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filterStatus)

  const getStatusConfig = (status: SyncTaskStatus) => {
    const configs: Record<SyncTaskStatus, {
      icon: typeof Clock
      text: string
      bgColor: string
      textColor: string
      iconColor: string
    }> = {
      pending: {
        icon: Clock,
        text: '等待中',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        iconColor: 'text-gray-500'
      },
      running: {
        icon: Loader2,
        text: '同步中',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        iconColor: 'text-blue-500'
      },
      completed: {
        icon: CheckCircle,
        text: '已完成',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        iconColor: 'text-green-500'
      },
      failed: {
        icon: XCircle,
        text: '失败',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        iconColor: 'text-red-500'
      }
    }
    return configs[status]
  }

  const getTaskProgress = (task: SyncTask) => {
    if (task.status === 'completed') return 100
    if (task.status === 'failed') return 0
    return Math.round((task.completedCount / task.totalCount) * 100)
  }

  const taskCounts = {
    all: tasks.length,
    running: tasks.filter(t => t.status === 'running').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">同步历史记录</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 pt-4 pb-2 border-b bg-gray-50">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              全部 ({taskCounts.all})
            </button>
            <button
              onClick={() => setFilterStatus('running')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'running'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              进行中 ({taskCounts.running})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              等待中 ({taskCounts.pending})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              已完成 ({taskCounts.completed})
            </button>
            <button
              onClick={() => setFilterStatus('failed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'failed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              失败 ({taskCounts.failed})
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              暂无{filterStatus !== 'all' && getStatusConfig(filterStatus as SyncTask['status']).text}任务
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => {
                const statusConfig = getStatusConfig(task.status)
                const StatusIcon = statusConfig.icon
                const progress = getTaskProgress(task)

                return (
                  <div
                    key={task.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Task Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                            <StatusIcon className={`w-3 h-3 ${task.status === 'running' ? 'animate-spin' : ''}`} />
                            {statusConfig.text}
                          </span>
                          <span className="font-medium text-gray-900">{task.meetingTitle}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          目标设备: {task.deviceNames.slice(0, 3).join(', ')}
                          {task.deviceNames.length > 3 && ` 等${task.totalCount}台`}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-gray-600">
                          {new Date(task.createdAt).toLocaleString()}
                        </div>
                        {task.completedAt && (
                          <div className="text-gray-500 text-xs mt-1">
                            完成于 {new Date(task.completedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {(task.status === 'running' || task.status === 'completed') && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>
                            {task.status === 'running' ? '同步进度' : '已完成'}: {task.completedCount}/{task.totalCount} 台设备
                          </span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Task Details */}
                    {task.status === 'running' && task.completedCount > 0 && (
                      <div className="text-sm text-gray-500 border-t pt-2 mt-2">
                        已完成: {task.deviceNames.slice(0, task.completedCount).join(', ')}
                      </div>
                    )}

                    {task.status === 'pending' && (
                      <div className="text-sm text-gray-500 border-t pt-2 mt-2">
                        等待前序任务完成...
                      </div>
                    )}

                    {task.status === 'failed' && (
                      <div className="flex items-center justify-between border-t pt-2 mt-2">
                        <div className="text-sm text-red-600">
                          同步失败，请检查设备连接或重试
                        </div>
                        <button className="px-3 py-1 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors">
                          重新同步
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            共 {tasks.length} 条记录
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
