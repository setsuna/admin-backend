/**
 * 参会人员 API 服务
 */

import { httpClient } from '../core/http.client'
import { API_PATHS } from '@/config'
import type {
  MeetingParticipant,
  CreateParticipantRequest,
  BatchCreateParticipantRequest,
  UpdateParticipantRequest,
  UpdateParticipantStatusRequest,
  OperationResult
} from '@/types'

export class ParticipantApiService {
  /**
   * 获取会议参会人员列表
   */
  async listParticipants(meetingId: string): Promise<MeetingParticipant[]> {
    const participants = await httpClient.get<any[]>(
      `${API_PATHS.MEETINGS}/${meetingId}/participants`
    )
    
    // 字段映射：security_level -> securityLevel, user_id -> userId 等
    return participants.map(p => ({
      ...p,
      userId: p.user_id || p.userId,
      userName: p.user_name || p.userName,
      securityLevel: p.security_level || p.securityLevel,
      joinedAt: p.joined_at || p.joinedAt,
      leftAt: p.left_at || p.leftAt,
      createdAt: p.created_at || p.createdAt,
      updatedAt: p.updated_at || p.updatedAt
    }))
  }

  /**
   * 获取参会人员详情
   */
  async getParticipant(meetingId: string, participantId: string): Promise<MeetingParticipant> {
    return await httpClient.get<MeetingParticipant>(
      `${API_PATHS.MEETINGS}/${meetingId}/participants/${participantId}`
    )
  }

  /**
   * 创建参会人员
   */
  async createParticipant(
    meetingId: string,
    data: CreateParticipantRequest
  ): Promise<MeetingParticipant> {
    return await httpClient.post<MeetingParticipant>(
      `${API_PATHS.MEETINGS}/${meetingId}/participants`,
      data
    )
  }

  /**
   * 批量创建参会人员
   */
  async batchCreateParticipants(
    meetingId: string,
    data: BatchCreateParticipantRequest
  ): Promise<MeetingParticipant[]> {
    const participants = await httpClient.post<any[]>(
      `${API_PATHS.MEETINGS}/${meetingId}/participants/batch`,
      data
    )
    
    // 字段映射
    return participants.map(p => ({
      ...p,
      userId: p.user_id || p.userId,
      userName: p.user_name || p.userName,
      securityLevel: p.security_level || p.securityLevel,
      joinedAt: p.joined_at || p.joinedAt,
      leftAt: p.left_at || p.leftAt,
      createdAt: p.created_at || p.createdAt,
      updatedAt: p.updated_at || p.updatedAt
    }))
  }

  /**
   * 更新参会人员
   */
  async updateParticipant(
    meetingId: string,
    participantId: string,
    data: UpdateParticipantRequest
  ): Promise<MeetingParticipant> {
    return await httpClient.put<MeetingParticipant>(
      `${API_PATHS.MEETINGS}/${meetingId}/participants/${participantId}`,
      data
    )
  }

  /**
   * 更新参会人员状态
   */
  async updateParticipantStatus(
    meetingId: string,
    participantId: string,
    data: UpdateParticipantStatusRequest
  ): Promise<MeetingParticipant> {
    return await httpClient.patch<MeetingParticipant>(
      `${API_PATHS.MEETINGS}/${meetingId}/participants/${participantId}/status`,
      data
    )
  }

  /**
   * 删除参会人员
   */
  async deleteParticipant(meetingId: string, participantId: string): Promise<OperationResult> {
    return await httpClient.delete<OperationResult>(
      `${API_PATHS.MEETINGS}/${meetingId}/participants/${participantId}`
    )
  }
}

export const participantApi = new ParticipantApiService()
