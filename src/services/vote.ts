/**
 * 投票服务 - 封装投票相关的业务逻辑
 */

import { voteApiService } from './api/vote.api'
import type { MeetingVote, VoteType, VoteOption, MeetingSecurityLevel } from '@/types'

/**
 * 投票服务类
 */
class VoteService {
  /**
   * 获取议题的投票列表
   */
  async getVotes(meetingId: string, agendaId: string): Promise<MeetingVote[]> {
    return voteApiService.getVotes(meetingId, agendaId)
  }

  /**
   * 获取会议的所有投票
   */
  async getMeetingVotes(meetingId: string): Promise<MeetingVote[]> {
    return voteApiService.getMeetingVotes(meetingId)
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
      orderNum: number
    }
  ): Promise<MeetingVote> {
    // 转换为后端格式（下划线）
    const apiData: any = {
      title: voteData.title,
      vote_type: voteData.voteType,
      options: voteData.options.map(opt => ({
        id: opt.id,
        label: opt.label,
        order_num: opt.orderNum
      })),
      is_anonymous: voteData.isAnonymous,
      security_level: voteData.securityLevel,
      order_num: voteData.orderNum
    }
    
    // 只在自定义类型且有值时添加 allow_multiple
    if (voteData.voteType === 'custom' && voteData.allowMultiple !== undefined) {
      apiData.allow_multiple = voteData.allowMultiple
    }

    const result = await voteApiService.createVote(meetingId, agendaId, apiData)
    return this.transformVoteFromApi(result)
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
      voteType?: VoteType
      options?: VoteOption[]
      isAnonymous?: boolean
      allowMultiple?: boolean
      securityLevel?: MeetingSecurityLevel | null
    }
  ): Promise<MeetingVote> {
    // 转换为后端格式
    const apiUpdates: any = {}
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

    const result = await voteApiService.updateVote(meetingId, agendaId, voteId, apiUpdates)
    return this.transformVoteFromApi(result)
  }

  /**
   * 删除投票
   */
  async deleteVote(meetingId: string, agendaId: string, voteId: string): Promise<boolean> {
    const result = await voteApiService.deleteVote(meetingId, agendaId, voteId)
    return result.success
  }

  /**
   * 更新投票排序
   */
  async updateVoteOrder(
    meetingId: string,
    agendaId: string,
    voteIds: string[]
  ): Promise<boolean> {
    const result = await voteApiService.updateVoteOrder(meetingId, agendaId, voteIds)
    return result.success
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

// 兼容性导出
export const voteApi = {
  getVotes: voteService.getVotes.bind(voteService),
  getMeetingVotes: voteService.getMeetingVotes.bind(voteService),
  createVote: voteService.createVote.bind(voteService),
  updateVote: voteService.updateVote.bind(voteService),
  deleteVote: voteService.deleteVote.bind(voteService),
  updateVoteOrder: voteService.updateVoteOrder.bind(voteService)
}
