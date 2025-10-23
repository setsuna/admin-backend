/**
 * 会议草稿管理 Hook
 * 负责草稿的初始化、保存、提交
 * 重构：使用 TanStack Query 的 useMutation
 */

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { meetingApi } from '@/services/meeting'
import { formatToBackendDateTime } from '@/utils/time.utils'
import { useNotifications } from './useNotifications'
import type { MeetingFormData, MeetingAgenda, MeetingParticipant } from '@/types'

export function useMeetingDraft() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useNotifications()
  const [draftMeetingId, setDraftMeetingId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  /**
   * 初始化草稿会议
   * 重构：使用 useMutation 处理创建操作
   */
  const initializeDraftMutation = useMutation({
    mutationFn: async () => {
      // 后端幂等接口：有草稿返回现有，无则创建新的
      const draftMeeting = await meetingApi.createDraftMeeting()
      
      // 查询是否已有议题
      const existingAgendas = await meetingApi.getAgendas(draftMeeting.id)
      
      return {
        meetingId: draftMeeting.id,
        draftData: draftMeeting,
        existingAgendas: existingAgendas || []
      }
    },
    onSuccess: (data) => {
      setDraftMeetingId(data.meetingId)
      setIsInitialized(true)
    },
    onError: (error: any) => {
      showError('初始化失败', error.message)
    }
  })

  const initializeDraft = async (): Promise<{ 
    meetingId: string
    draftData: any
    existingAgendas: MeetingAgenda[] 
  } | null> => {
    const result = await initializeDraftMutation.mutateAsync()
    return result
  }

  /**
   * 保存草稿
   * 重构：使用 useMutation 处理保存操作
   */
  const saveDraftMutation = useMutation({
    mutationFn: async (formData: Partial<MeetingFormData>) => {
      if (!draftMeetingId) throw new Error('草稿未初始化')
      
      //只发送有值的字段，避免用空值覆盖后端数据
      const draftData: any = {}
      
      // 基本信息字段
      if (formData.name?.trim()) {
        draftData.name = formData.name
      }
      
      if (formData.description?.trim()) {
        draftData.description = formData.description
      }
      
      if (formData.securityLevel) {
        draftData.security_level = formData.securityLevel
      }
      
      if (formData.type) {
        draftData.type = formData.type
      }
      
      if (formData.category?.trim()) {
        draftData.category = formData.category
      }
      
      if (formData.location?.trim()) {
        draftData.location = formData.location
      }
      
      if (formData.organizer?.trim()) {
        draftData.organizer = formData.organizer
      }
      
      if (formData.host?.trim()) {
        draftData.host = formData.host
      }
      
      // 🕐 时间字段：转换为后端需要的 ISO 8601 格式
      if (formData.startTime) {
        draftData.start_time = formatToBackendDateTime(formData.startTime)
      }
      
      if (formData.endTime) {
        draftData.end_time = formatToBackendDateTime(formData.endTime)
      }
      
      // 高级设置字段（可选）
      if (formData.password?.trim()) {
        draftData.password = formData.password
      }
      
      if (formData.expiryType && formData.expiryType !== 'none') {
        draftData.expiry_type = formData.expiryType
      }
      
      if (formData.expiryDate?.trim()) {
        draftData.expiry_date = formData.expiryDate
      }
      
      if (formData.signInType && formData.signInType !== 'none') {
        draftData.sign_in_type = formData.signInType
      }

      return await meetingApi.saveDraftMeeting(draftMeetingId, draftData)
    },
    onSuccess: () => {
      showSuccess('保存成功', '草稿已保存')
    },
    onError: (error: any) => {
      showError('保存失败', error.message)
    }
  })

  const saveDraft = async (formData: Partial<MeetingFormData>): Promise<boolean> => {
    if (!draftMeetingId) return false
    
    try {
      await saveDraftMutation.mutateAsync(formData)
      return true
    } catch (error) {
      console.error('保存草稿失败:', error)
      return false
    }
  }

  /**
   * 提交草稿（发布会议）
   * 重构：使用 useMutation 处理提交操作
   */
  const submitDraftMutation = useMutation({
    mutationFn: async (formData: MeetingFormData) => {
      if (!draftMeetingId) throw new Error('草稿未初始化')
      
      // 🔧 修复：添加缺失的字段
      const meetingRequest: any = {
        name: formData.name,
        security_level: formData.securityLevel,
        type: formData.type,
        status: 'preparation',
        start_time: formatToBackendDateTime(formData.startTime),  // 🕐 使用格式化函数
        end_time: formatToBackendDateTime(formData.endTime),      // 🕐 使用格式化函数
        location: formData.location,
        description: formData.description,
        category: formData.category,           // ✅ 添加：会议类别
        password: formData.password,           // ✅ 添加：会议密码
        expiry_type: formData.expiryType,      // ✅ 添加：过期类型
        expiry_date: formData.expiryDate,      // ✅ 添加：过期日期
        sign_in_type: formData.signInType,     // ✅ 添加：签到方式
        organizer: formData.organizer,         // ✅ 添加：组织单位
        host: formData.host,                   // ✅ 添加：会议主持
        participants: formData.participants
          .filter((p: MeetingParticipant) => p.role !== 'host')
          .map((p: MeetingParticipant) => ({
            userId: p.userId,
            role: p.role as 'participant' | 'observer'
          }))
      }

      return await meetingApi.submitDraftMeeting(draftMeetingId, meetingRequest)
    },
    onSuccess: () => {
      showSuccess('创建成功', '会议已创建')
      // ✅ 刷新会议列表
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    },
    onError: (error: any) => {
      showError('创建失败', error.message)
    }
  })

  const submitDraft = async (formData: MeetingFormData) => {
    const meeting = await submitDraftMutation.mutateAsync(formData)
    return meeting
  }

  return {
    draftMeetingId,
    isInitialized,
    loading: initializeDraftMutation.isPending || saveDraftMutation.isPending || submitDraftMutation.isPending,
    initializeDraft,
    saveDraft,
    submitDraft
  }
}
