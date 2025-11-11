import { httpClient } from '../core/http.client'
import type { 
  SyncTaskResponse, 
  TaskProgress, 
  TaskStatus,
  BatchSyncResponse,
  TaskStatusDetail,
  CreateBatchSyncRequest,
  CreateBatchSyncResponse,
  BatchTaskStatus,
  BatchTasksResponse,
  BatchTaskListResponse
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

  // ========== 新的批量同步API ==========

  /**
   * 创建批量同步任务（异步，立即返回）
   */
  async createBatchSync(
    request: CreateBatchSyncRequest
  ): Promise<CreateBatchSyncResponse> {
    return await httpClient.post<CreateBatchSyncResponse>(
      `${this.basePath}/batch`,
      request
    )
  }

  /**
   * 获取批量任务状态
   */
  async getBatchStatus(batchId: string): Promise<BatchTaskStatus> {
    return await httpClient.get<BatchTaskStatus>(
      `${this.basePath}/batch/${batchId}/status`
    )
  }

  /**
   * 获取批量任务的所有子任务
   */
  async getBatchTasks(batchId: string): Promise<BatchTasksResponse> {
    return await httpClient.get<BatchTasksResponse>(
      `${this.basePath}/batch/${batchId}/tasks`
    )
  }

  /**
   * 列出所有批量任务
   */
  async listBatchTasks(): Promise<BatchTaskListResponse> {
    return await httpClient.get<BatchTaskListResponse>(
      `${this.basePath}/batch`
    )
  }
}

export const syncApi = new SyncApiService()
