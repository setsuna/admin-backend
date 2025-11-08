// 在线设备信息
export interface OnlineDevice {
  serial_number: string
  status: -1 | 0 | 1  // -1=未注册, 0=离线, 1=在线
  status_name: string
  last_login?: string
  mount_path?: string
}

// 已同步会议
export interface SyncedMeeting {
  meetingId: string
  title: string
  securityLevel: string
  size: number  // MB
  fileCount: number
  syncTime: string
  meetingDate: string
}

// 同步选项
export interface SyncOptions {
  includeMaterials: boolean
  includeAgenda: boolean
  includeRecording: boolean
  overwriteExisting: boolean
}

// 同步任务（用于历史记录）
export interface SyncTask {
  id: string
  meetingId: string
  meetingTitle: string
  deviceIds: string[]
  deviceNames: string[]
  status: 'pending' | 'running' | 'completed' | 'failed'
  completedCount: number
  totalCount: number
  createdAt: string
  completedAt?: string
}

// 同步任务创建请求
export interface CreateSyncTaskRequest {
  meetingId: string
  serialNumber: string
  metadata?: {
    priority?: 'high' | 'normal' | 'low'
    notification?: boolean
  }
}

// 同步任务响应
export interface SyncTaskResponse {
  taskId: string
  meetingId: string
  serialNumber: string
  devicePath: string
  packagePath: string
  status: 'pending' | 'processing' | 'done' | 'failed'
  createdAt: string
  message?: string
}

// WebSocket 进度消息数据
export interface SyncProgressData {
  task_id: string
  device_id?: string
  meeting_id?: string
  progress: number
  speed?: string
  eta?: string
  current_file?: string
}

// WebSocket 进度消息
export interface SyncProgressMessage {
  type: 'sync_progress'
  data: SyncProgressData
  timestamp: number
}

// 任务进度信息
export interface TaskProgress {
  task_id: string
  total_bytes: number
  copied_bytes: number
  progress_percent: number
  speed_bytes_per_sec: number
  eta_seconds: number
  current_file: string
  updated_at: string
}

// 任务状态
export interface TaskStatus {
  task_id: string
  state: 'pending' | 'ready' | 'processing' | 'done' | 'failed' | 'acked' | 'archived'
  message: string
  progress: number
  updated_at: string
  metadata?: {
    meeting_id?: string
    package_id?: string
  }
}

// 设备同步状态
export interface DeviceSyncState {
  deviceId: string
  tasks: Map<string, SyncTaskProgress>
  isActive: boolean
}

// 单个任务进度
export interface SyncTaskProgress {
  taskId: string
  meetingId: string
  meetingName: string
  status: 'pending' | 'processing' | 'done' | 'failed'
  progress: number
  speed?: string
  eta?: string
  startTime?: string
  endTime?: string
  error?: string  // 失败时的错误信息
}

// 批量同步请求
export interface BatchSyncRequest {
  meetingIds: string[]
  serialNumbers: string[]
  metadata?: Record<string, any>
}

// 批量同步响应
export interface BatchSyncResponse {
  totalRequests: number
  successCount: number
  failureCount: number
  results: BatchSyncTaskResult[]
  summary: {
    meetingCount: number
    deviceCount: number
    successRate: number
  }
}

// 批量同步单个任务结果
export interface BatchSyncTaskResult {
  meetingId: string
  serialNumber: string
  success: boolean
  taskId?: string
  errorCode?: number
  errorMessage?: string
  devicePath?: string
  createdAt?: number
}

// 任务状态详情（用于 GetSyncTaskStatus）
export interface TaskStatusDetail {
  taskId: string
  state: 'pending' | 'ready' | 'processing' | 'done' | 'failed' | 'acked' | 'archived'
  message: string
  progress: number
  updatedAt: string
  metadata?: {
    meetingId?: string
    packageId?: string
    serialNumber?: string
    [key: string]: any
  }
}
