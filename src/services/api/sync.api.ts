import { httpClient } from '../core/http.client'
import type { 
  SyncTaskResponse, 
  TaskProgress, 
  TaskStatus,
  BatchSyncResponse,
  TaskStatusDetail
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

  /**
   * 批量同步会议包到多个设备
   */
  async batchSyncMeetingPackage(
    meetingIds: string[],
    serialNumbers: string[],
    metadata?: Record<string, any>
  ): Promise<BatchSyncResponse> {
    return await httpClient.post<BatchSyncResponse>(
      `${this.basePath}/meeting-package/batch`,
      {
        meetingIds,
        serialNumbers,
        metadata
      }
    )
  }

  /**
   * 获取同步任务状态
   */
  async getSyncTaskStatus(
    taskId: string,
    serialNumber: string
  ): Promise<TaskStatusDetail> {
    return await httpClient.get<TaskStatusDetail>(
      `${this.basePath}/tasks/${taskId}/status`,
      { serialNumber }
    )
  }
}

export const syncApi = new SyncApiService()
