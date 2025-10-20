/**
 * 会议草稿管理 Hook
 * 负责草稿的初始化、保存、提交
 */

import { useState } from 'react'
import { meetingApi } from '@/services/meeting'
import type { MeetingFormData } from '@/types/domain/meeting.types'
import type { MeetingAgenda } from '@/types'

export function useMeetingDraft() {
  const [draftMeetingId, setDraftMeetingId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [loading, setLoading] = useState(false)

  /**
   * 初始化草稿会议
   * 注意：不需要 try-catch，httpClient 会自动处理错误并触发通知
   */
  const initializeDraft = async (): Promise<{ 
    meetingId: string
    draftData: any
    existingAgendas: MeetingAgenda[] 
  } | null> => {
    // 后端幂等接口：有草稿返回现有，无则创建新的
    const draftMeeting = await meetingApi.createDraftMeeting()
    setDraftMeetingId(draftMeeting.id)
    setIsInitialized(true)

    // 查询是否已有议题
    const existingAgendas = await meetingApi.getAgendas(draftMeeting.id)
    
    return {
      meetingId: draftMeeting.id,
      draftData: draftMeeting,  // ✅ 直接使用 draftMeeting，不要访问 .data
      existingAgendas: existingAgendas || []
    }
  }

  /**
   * 保存草稿
   */
  const saveDraft = async (formData: Partial<MeetingFormData>): Promise<boolean> => {
    if (!draftMeetingId) return false

    setLoading(true)
    
    try {
      // ✅ 按照 Swagger 接口定义，只发送这些字段
      const draftData: any = {
        name: formData.name,
        description: formData.description,
        security_level: formData.securityLevel,
        type: formData.type,
        start_time: formData.startTime ? `${formData.startTime}:00+08:00` : undefined,  // ✅ 添加秒和时区
        end_time: formData.endTime ? `${formData.endTime}:00+08:00` : undefined,        // ✅ 添加秒和时区
        location: formData.location,
        category: formData.category  // ✅ 添加 category 字段
        // ❌ 不发送 participants，后端不支持
      }

      await meetingApi.saveDraftMeeting(draftMeetingId, draftData)
      setLoading(false)
      return true
    } catch (error) {
      console.error('保存草稿失败:', error)
      setLoading(false)
      // ✅ 即使失败也返回 false，不阻断用户操作
      return false
    }
  }

  /**
   * 提交草稿（发布会议）
   */
  const submitDraft = async (formData: MeetingFormData) => {
    if (!draftMeetingId) throw new Error('草稿未初始化')

    setLoading(true)
    
    const meetingRequest: any = {
      name: formData.name,
      security_level: formData.securityLevel,
      type: formData.type,
      status: 'preparation',
      start_time: `${formData.startTime}:00+08:00`,  // ✅ 添加秒和时区
      end_time: `${formData.endTime}:00+08:00`,      // ✅ 添加秒和时区
      location: formData.location,
      description: formData.description,
      participants: formData.participants
        .filter(p => p.role !== 'host')
        .map(p => ({
          userId: p.userId,
          role: p.role as 'participant' | 'observer'
        }))
    }

    const meeting = await meetingApi.submitDraftMeeting(draftMeetingId, meetingRequest)
    setLoading(false)
    return meeting
  }

  return {
    draftMeetingId,
    isInitialized,
    loading,
    initializeDraft,
    saveDraft,
    submitDraft
  }
}
