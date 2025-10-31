/**
 * 投票服务 - 封装投票相关的业务逻辑
 */

import { voteApiService } from './api/vote.api'
import type { 
  CreateVoteRequest, 
  UpdateVoteRequest, 
  VoteFilters,
  VoteDetailResponse,
  VoteStatistics,
  MyVoteStatus
} from './api/vote.api'
import type { MeetingVote, VoteType, VoteOption, MeetingSecurityLevel } from '@/types'

/**
 * 投票服务类
 */
class VoteService {
  /**
   * 获取投票列表（可选按议题过滤）
   */
  async getVotes(meetingId: string, agendaId?: string): Promise<MeetingVote[]> {
    const filters: VoteFilters = agendaId ? { agenda_id: agendaId } : {}
    const response = await voteApiService.listVotes(meetingId, filters)
    return response.items || []
  }

  /**
   * 获取会议的所有投票
   */
  async getMeetingVotes(meetingId: string): Promise<MeetingVote[]> {
    return this.getVotes(meetingId)
  }

  /**
   * 获取投票详情
   */
  async getVote(meetingId: string, voteId: string): Promise<MeetingVote> {
    const result = await voteApiService.getVote(meetingId, voteId)
    return this.transformVoteFromApi(result)
  }

  /**
   * 获取投票详情（含统计）
   */
  async getVoteDetail(meetingId: string, voteId: string, participantId?: string): Promise<VoteDetailResponse> {
    return await voteApiService.getVoteDetail(meetingId, voteId, participantId)
  }

  /**
   * 创建投票
   */
  async createVote(
    meetingId: string,
    agendaId: string,
    voteData: {
      title: string
      voteType: VoteType
      options: VoteOption[]
      isAnonymous: boolean
      allowMultiple?: boolean
      securityLevel: MeetingSecurityLevel | null
      orderNum?: number
    }
  ): Promise<MeetingVote> {
    const apiData: CreateVoteRequest = {
      title: voteData.title,
      vote_type: voteData.voteType,
      options: voteData.options.map(opt => ({
        id: opt.id,
        label: opt.label,
        order_num: opt.orderNum
      })),
      is_anonymous: voteData.isAnonymous,
      security_level: voteData.securityLevel,
      agenda_id: agendaId
    }
    
    if (voteData.voteType === 'custom' && voteData.allowMultiple !== undefined) {
      apiData.allow_multiple = voteData.allowMultiple
    }

    const result = await voteApiService.createVote(meetingId, apiData)
    return this.transformVoteFromApi(result)
  }

  /**
   * 批量创建投票
   */
  async batchCreateVotes(
    meetingId: string,
    votes: Array<{
      title: string
      voteType: VoteType
      options: VoteOption[]
      isAnonymous: boolean
      allowMultiple?: boolean
      securityLevel: MeetingSecurityLevel | null
      agendaId: string
    }>
  ): Promise<MeetingVote[]> {
    const apiData = {
      votes: votes.map(v => ({
        title: v.title,
        vote_type: v.voteType,
        options: v.options.map(opt => ({
          id: opt.id,
          label: opt.label,
          order_num: opt.orderNum
        })),
        is_anonymous: v.isAnonymous,
        allow_multiple: v.allowMultiple,
        security_level: v.securityLevel,
        agenda_id: v.agendaId
      }))
    }

    const results = await voteApiService.batchCreateVotes(meetingId, apiData)
    return results.map(r => this.transformVoteFromApi(r))
  }

  /**
   * 更新投票
   */
  async updateVote(
    meetingId: string,
    voteId: string,
    updates: {
      title?: string
      voteType?: VoteType
      options?: VoteOption[]
      isAnonymous?: boolean
      allowMultiple?: boolean
      securityLevel?: MeetingSecurityLevel | null
    }
  ): Promise<MeetingVote> {
    const apiUpdates: UpdateVoteRequest = {}
    if (updates.title !== undefined) apiUpdates.title = updates.title
    if (updates.voteType !== undefined) apiUpdates.vote_type = updates.voteType
    if (updates.options !== undefined) {
      apiUpdates.options = updates.options.map(opt => ({
        id: opt.id,
        label: opt.label,
        order_num: opt.orderNum
      }))
    }
    if (updates.isAnonymous !== undefined) apiUpdates.is_anonymous = updates.isAnonymous
    if (updates.allowMultiple !== undefined) apiUpdates.allow_multiple = updates.allowMultiple
    if (updates.securityLevel !== undefined) apiUpdates.security_level = updates.securityLevel

    const result = await voteApiService.updateVote(meetingId, voteId, apiUpdates)
    return this.transformVoteFromApi(result)
  }

  /**
   * 更新投票状态
   */
  async updateVoteStatus(meetingId: string, voteId: string, status: string): Promise<void> {
    await voteApiService.updateVoteStatus(meetingId, voteId, { status })
  }

  /**
   * 删除投票
   */
  async deleteVote(meetingId: string, voteId: string): Promise<void> {
    await voteApiService.deleteVote(meetingId, voteId)
  }

  /**
   * 提交投票
   */
  async submitVote(meetingId: string, voteId: string, participantId: string, optionIds: string[]): Promise<void> {
    await voteApiService.submitVote(meetingId, voteId, participantId, { option_ids: optionIds })
  }

  /**
   * 取消投票
   */
  async cancelVote(meetingId: string, voteId: string, participantId: string): Promise<void> {
    await voteApiService.cancelVote(meetingId, voteId, participantId)
  }

  /**
   * 获取投票统计
   */
  async getVoteStatistics(meetingId: string, voteId: string): Promise<VoteStatistics> {
    return await voteApiService.getVoteStatistics(meetingId, voteId)
  }

  /**
   * 获取我的投票状态
   */
  async getMyVoteStatus(meetingId: string, voteId: string, participantId: string): Promise<MyVoteStatus> {
    return await voteApiService.getMyVoteStatus(meetingId, voteId, participantId)
  }

  /**
   * 转换后端投票数据为前端格式
   */
  private transformVoteFromApi(apiVote: any): MeetingVote {
    return {
      id: apiVote.id,
      meetingId: apiVote.meeting_id || apiVote.meetingId,
      agendaId: apiVote.agenda_id || apiVote.agendaId,
      title: apiVote.title,
      voteType: apiVote.vote_type || apiVote.voteType,
      options: (apiVote.options || []).map((opt: any) => ({
        id: opt.id,
        label: opt.label,
        orderNum: opt.order_num ?? opt.orderNum ?? 0
      })),
      isAnonymous: apiVote.is_anonymous ?? apiVote.isAnonymous ?? false,
      allowMultiple: apiVote.allow_multiple ?? apiVote.allowMultiple,
      securityLevel: apiVote.security_level ?? apiVote.securityLevel ?? null,
      orderNum: apiVote.order_num ?? apiVote.orderNum ?? 0,
      createdAt: apiVote.created_at || apiVote.createdAt || new Date().toISOString(),
      updatedAt: apiVote.updated_at || apiVote.updatedAt || new Date().toISOString()
    }
  }
}

export const voteService = new VoteService()

export const voteApi = {
  getVotes: voteService.getVotes.bind(voteService),
  getMeetingVotes: voteService.getMeetingVotes.bind(voteService),
  getVote: voteService.getVote.bind(voteService),
  getVoteDetail: voteService.getVoteDetail.bind(voteService),
  createVote: voteService.createVote.bind(voteService),
  batchCreateVotes: voteService.batchCreateVotes.bind(voteService),
  updateVote: voteService.updateVote.bind(voteService),
  updateVoteStatus: voteService.updateVoteStatus.bind(voteService),
  deleteVote: voteService.deleteVote.bind(voteService),
  submitVote: voteService.submitVote.bind(voteService),
  cancelVote: voteService.cancelVote.bind(voteService),
  getVoteStatistics: voteService.getVoteStatistics.bind(voteService),
  getMyVoteStatus: voteService.getMyVoteStatus.bind(voteService)
}
