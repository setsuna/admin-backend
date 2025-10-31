/**
 * 投票管理API服务
 */

import { httpClient } from '@/services/core/http.client'
import { API_PATHS } from '@/config'
import type {
  MeetingVote,
  PaginatedResponse
} from '@/types'

// ===== 请求类型 =====
export interface VoteFilters {
  agenda_id?: string
  status?: string
  keyword?: string
  page?: number
  size?: number
}

export interface CreateVoteRequest {
  title: string
  vote_type: 'simple' | 'custom'
  options: Array<{ id: string; label: string; order_num: number }>
  is_anonymous: boolean
  allow_multiple?: boolean
  security_level: string | null
  agenda_id?: string
}

export interface UpdateVoteRequest {
  title?: string
  vote_type?: 'simple' | 'custom'
  options?: Array<{ id: string; label: string; order_num: number }>
  is_anonymous?: boolean
  allow_multiple?: boolean
  security_level?: string | null
}

export interface UpdateVoteStatusRequest {
  status: string
}

export interface BatchCreateVoteRequest {
  votes: CreateVoteRequest[]
}

export interface SubmitVoteRequest {
  option_ids: string[]
}

// ===== 响应类型 =====
export interface VoteDetailResponse extends MeetingVote {
  statistics?: VoteStatistics
  my_status?: MyVoteStatus
}

export interface VoteStatistics {
  total_voters: number
  voted_count: number
  not_voted_count: number
  option_stats: Array<{
    option_id: string
    vote_count: number
    percentage: number
  }>
}

export interface MyVoteStatus {
  has_voted: boolean
  voted_at?: string
  selected_option_ids?: string[]
}

export class VoteApiService {
  private basePath = API_PATHS.MEETINGS

  /**
   * 获取投票列表
   */
  async listVotes(meetingId: string, filters?: VoteFilters): Promise<PaginatedResponse<MeetingVote>> {
    return await httpClient.get<PaginatedResponse<MeetingVote>>(
      `${this.basePath}/${meetingId}/votes`,
      filters
    )
  }

  /**
   * 创建投票
   */
  async createVote(meetingId: string, data: CreateVoteRequest): Promise<MeetingVote> {
    return await httpClient.post<MeetingVote>(
      `${this.basePath}/${meetingId}/votes`,
      data
    )
  }

  /**
   * 批量创建投票
   */
  async batchCreateVotes(meetingId: string, data: BatchCreateVoteRequest): Promise<MeetingVote[]> {
    return await httpClient.post<MeetingVote[]>(
      `${this.basePath}/${meetingId}/votes/batch`,
      data
    )
  }

  /**
   * 获取投票详情
   */
  async getVote(meetingId: string, voteId: string): Promise<MeetingVote> {
    return await httpClient.get<MeetingVote>(
      `${this.basePath}/${meetingId}/votes/${voteId}`
    )
  }

  /**
   * 获取投票详情（含统计）
   */
  async getVoteDetail(meetingId: string, voteId: string, participantId?: string): Promise<VoteDetailResponse> {
    const params = participantId ? { participant_id: participantId } : undefined
    return await httpClient.get<VoteDetailResponse>(
      `${this.basePath}/${meetingId}/votes/${voteId}/detail`,
      params
    )
  }

  /**
   * 更新投票
   */
  async updateVote(meetingId: string, voteId: string, data: UpdateVoteRequest): Promise<MeetingVote> {
    return await httpClient.put<MeetingVote>(
      `${this.basePath}/${meetingId}/votes/${voteId}`,
      data
    )
  }

  /**
   * 更新投票状态
   */
  async updateVoteStatus(meetingId: string, voteId: string, data: UpdateVoteStatusRequest): Promise<void> {
    return await httpClient.patch<void>(
      `${this.basePath}/${meetingId}/votes/${voteId}/status`,
      data
    )
  }

  /**
   * 删除投票
   */
  async deleteVote(meetingId: string, voteId: string): Promise<void> {
    return await httpClient.delete<void>(
      `${this.basePath}/${meetingId}/votes/${voteId}`
    )
  }

  /**
   * 提交投票
   */
  async submitVote(meetingId: string, voteId: string, participantId: string, data: SubmitVoteRequest): Promise<void> {
    return await httpClient.post<void>(
      `${this.basePath}/${meetingId}/votes/${voteId}/submit?participant_id=${participantId}`,
      data
    )
  }

  /**
   * 取消投票
   */
  async cancelVote(meetingId: string, voteId: string, participantId: string): Promise<void> {
    return await httpClient.post<void>(
      `${this.basePath}/${meetingId}/votes/${voteId}/cancel?participant_id=${participantId}`,
      {}
    )
  }

  /**
   * 获取投票统计
   */
  async getVoteStatistics(meetingId: string, voteId: string): Promise<VoteStatistics> {
    return await httpClient.get<VoteStatistics>(
      `${this.basePath}/${meetingId}/votes/${voteId}/statistics`
    )
  }

  /**
   * 获取我的投票状态
   */
  async getMyVoteStatus(meetingId: string, voteId: string, participantId: string): Promise<MyVoteStatus> {
    return await httpClient.get<MyVoteStatus>(
      `${this.basePath}/${meetingId}/votes/${voteId}/my-status?participant_id=${participantId}`
    )
  }
}

export const voteApiService = new VoteApiService()
export const voteApi = voteApiService
