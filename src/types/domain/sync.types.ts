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

// WebSocket 进度消息
export interface SyncProgressMessage {
  type: 'sync_progress'
  data: {
    task_id: string
    device_id: string
    meeting_id: string
    progress: number
    speed: string
    eta: string
    current_file?: string
  }
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
}
