import { httpClient } from '../core/http.client'
import type { 
  CreateSyncTaskRequest, 
  SyncTaskResponse, 
  TaskProgress, 
  TaskStatus 
} from '@/types'

class SyncApiService {
  private basePath = '/mount/sync'

  /**
   * 创建同步任务（同步会议包到指定设备）
   */
  async createSyncTask(
    meetingId: string, 
    serialNumber: string
  ): Promise<SyncTaskResponse> {
    return await httpClient.post<SyncTaskResponse>(
      `${this.basePath}/meeting-package`,
      { meetingId, serialNumber }
    )
  }

  /**
   * 查询任务进度
   */
  async getTaskProgress(taskId: string): Promise<TaskProgress> {
    return await httpClient.get<TaskProgress>(
      `${this.basePath}/tasks/${taskId}/progress`
    )
  }

  /**
   * 查询任务状态
   */
  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    return await httpClient.get<TaskStatus>(
      `${this.basePath}/tasks/${taskId}/status`
    )
  }

  /**
   * 确认任务完成
   */
  async acknowledgeTask(taskId: string): Promise<{ taskId: string; status: string }> {
    return await httpClient.post<{ taskId: string; status: string }>(
      `${this.basePath}/tasks/${taskId}/acknowledge`,
      {}
    )
  }
}

export const syncApi = new SyncApiService()
