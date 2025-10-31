/**
 * 投票管理API服务
 */

import { httpClient } from '@/services/core/http.client'
import { API_PATHS } from '@/config'
import type {
  MeetingVote,
  OperationResult
} from '@/types'

export class VoteApiService {
  private basePath = API_PATHS.MEETINGS

  /**
   * 获取议题的投票列表
   */
  async getVotes(meetingId: string, agendaId: string): Promise<MeetingVote[]> {
    return await httpClient.get<MeetingVote[]>(
      `${this.basePath}/${meetingId}/agendas/${agendaId}/votes`
    )
  }

  /**
   * 获取会议的所有投票
   */
  async getMeetingVotes(meetingId: string): Promise<MeetingVote[]> {
    return await httpClient.get<MeetingVote[]>(
      `${this.basePath}/${meetingId}/votes`
    )
  }

  /**
   * 创建投票
   */
  async createVote(
    meetingId: string,
    agendaId: string,
    voteData: {
      title: string
      vote_type: 'simple' | 'custom'
      options: Array<{ id: string; label: string; order_num: number }>
      is_anonymous: boolean
      allow_multiple?: boolean
      security_level: string | null
      order_num: number
    }
  ): Promise<MeetingVote> {
    return await httpClient.post<MeetingVote>(
      `${this.basePath}/${meetingId}/agendas/${agendaId}/votes`,
      voteData
    )
  }

  /**
   * 更新投票
   */
  async updateVote(
    meetingId: string,
    agendaId: string,
    voteId: string,
    updates: {
      title?: string
      vote_type?: 'simple' | 'custom'
      options?: Array<{ id: string; label: string; order_num: number }>
      is_anonymous?: boolean
      allow_multiple?: boolean
      security_level?: string | null
      order_num?: number
    }
  ): Promise<MeetingVote> {
    return await httpClient.put<MeetingVote>(
      `${this.basePath}/${meetingId}/agendas/${agendaId}/votes/${voteId}`,
      updates
    )
  }

  /**
   * 删除投票
   */
  async deleteVote(
    meetingId: string,
    agendaId: string,
    voteId: string
  ): Promise<OperationResult> {
    return await httpClient.delete<OperationResult>(
      `${this.basePath}/${meetingId}/agendas/${agendaId}/votes/${voteId}`
    )
  }

  /**
   * 更新投票排序
   */
  async updateVoteOrder(
    meetingId: string,
    agendaId: string,
    voteIds: string[]
  ): Promise<OperationResult> {
    return await httpClient.patch<OperationResult>(
      `${this.basePath}/${meetingId}/agendas/${agendaId}/votes/order`,
      { vote_ids: voteIds }
    )
  }
}

export const voteApiService = new VoteApiService()
export const voteApi = voteApiService
