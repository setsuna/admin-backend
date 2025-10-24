/**
 * 统一的会议表单管理 Hook
 * 支持创建和编辑两种模式
 */

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMeetingDraft } from './useMeetingDraft'
import { useMeetingAgenda } from './useMeetingAgenda'
import { useMeetingMaterial } from './useMeetingMaterial'
import { useNotifications } from './useNotifications'
import { meetingApi } from '@/services/meeting'
import { 
  getInitialFormData, 
  convertDraftDataToFormData, 
  validateMeetingForm,
  validateMeetingMaterialsSecurity
} from '@/utils/meeting.utils'
import { autoAdjustMeetingTimes } from '@/utils/time.utils'
import type { MeetingFormData } from '@/types'

export function useMeetingForm(
  mode: 'create' | 'edit' | 'view',
  meetingId?: string
) {
  const queryClient = useQueryClient()
  const { showWarning, showSuccess } = useNotifications()
  
  // ===== 创建模式：草稿管理 =====
  const { 
    draftMeetingId, 
    isInitialized: draftInitialized, 
    loading: draftLoading,
    draftData,
    saveDraft, 
    submitDraft 
  } = useMeetingDraft()
  
  // ===== 编辑/查看模式：加载会议数据 =====
  const { data: meeting, isLoading: meetingLoading, isError } = useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: () => meetingApi.getMeetingById(meetingId!),
    enabled: (mode === 'edit' || mode === 'view') && !!meetingId,
    retry: 1,
  })
  
  // 确定当前使用的会议ID
  const currentMeetingId = mode === 'create' ? draftMeetingId : meetingId
  
  // 议题管理
  const { 
    agendas, 
    isLoading: agendasLoading,
    loadAgendas,
    createDefaultAgenda,
    addAgenda, 
    removeAgenda, 
    updateAgendaName,
    updateAgendaPresenter,
    reorderAgendas 
  } = useMeetingAgenda(currentMeetingId)
  
  // 文件管理
  const { 
    uploadFiles, 
    removeMaterial, 
    updateMaterialSecurity, 
    reorderMaterials 
  } = useMeetingMaterial(currentMeetingId, agendas)
  
  // 表单数据状态
  const [formData, setFormData] = useState<MeetingFormData>(getInitialFormData)
  
  const agendasInitializedRef = useRef(false)
  const prevAgendasLengthRef = useRef(0)
  
  // ===== 创建模式：恢复草稿数据 =====
  useEffect(() => {
    if (mode !== 'create' || !draftData) return
    
    const convertedData = convertDraftDataToFormData(draftData.draftData)
    
    if (Object.keys(convertedData).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...convertedData,
        agendas: prev.agendas
      }))
    }
  }, [mode, draftData])
  
  // ===== 编辑/查看模式：加载会议数据 =====
  useEffect(() => {
    if ((mode !== 'edit' && mode !== 'view') || !meeting) return
    
    const convertedData: Partial<MeetingFormData> = {
      name: meeting.name || meeting.title || '',
      description: meeting.description || '',
      securityLevel: meeting.securityLevel || 'internal',
      type: meeting.type || 'standard',
      category: meeting.category || '部门例会',
      location: meeting.location || '',
      organizer: meeting.organizer || '',
      host: meeting.host || '',
      password: meeting.password || '',
      expiryType: (meeting.expiryType || 'none') as 'none' | 'today' | 'custom',
      expiryDate: meeting.expiryDate || '',
      signInType: (meeting.signInType || 'none') as 'none' | 'manual' | 'password',
      startTime: meeting.startTime ? meeting.startTime.slice(0, 16) : formData.startTime,
      endTime: meeting.endTime ? meeting.endTime.slice(0, 16) : formData.endTime,
      participants: []
    }
    
    setFormData(prev => ({
      ...prev,
      ...convertedData
    }))
    
    loadAgendas()
  }, [mode, meeting])
  
  // ===== 创建模式：初始化议题 =====
  useEffect(() => {
    if (mode !== 'create') return
    if (!draftMeetingId || !draftInitialized) return
    if (!draftData || agendasLoading) return
    if (agendasInitializedRef.current) return
    
    const initAgendas = async () => {
      if (!agendas || agendas.length === 0) {
        await createDefaultAgenda()
        agendasInitializedRef.current = true
      } else {
        agendasInitializedRef.current = true
      }
    }
    
    initAgendas()
  }, [mode, draftMeetingId, draftInitialized, draftData, agendasLoading])
  
  // 同步 agendas 到 formData
  useEffect(() => {
    if (agendas.length !== prevAgendasLengthRef.current) {
      setFormData(prev => ({ ...prev, agendas }))
      prevAgendasLengthRef.current = agendas.length
    }
  }, [agendas.length])
  
  // ===== 更新 Mutation =====
  const updateMutation = useMutation({
    mutationFn: (updateData: any) => meetingApi.updateMeeting(meetingId!, updateData),
    onSuccess: () => {
      showSuccess('保存成功', '会议信息已更新')
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] })
    },
  })
  
  // 表单数据更新
  const handleFormDataChange = (field: string, value: any) => {
    if (field === 'startTime' && value) {
      const { startTime, endTime } = autoAdjustMeetingTimes(value)
      setFormData(prev => ({ 
        ...prev, 
        startTime, 
        endTime 
      }))
      return
    }
    
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  // 参会人员管理
  const handleParticipantsChange = (participants: any[]) => {
    setFormData(prev => ({ ...prev, participants }))
  }
  
  const removeParticipant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== id)
    }))
  }
  
  // 文件上传处理
  const handleFileUpload = async (agendaId: string, files: File[]) => {
    await uploadFiles(agendaId, files, formData.securityLevel)
  }
  
  // 表单验证
  const validateForm = (): boolean => {
    const validation = validateMeetingForm(formData)
    if (!validation.valid) {
      showWarning(validation.title!, validation.message!)
      return false
    }
    
    const materialsValidation = validateMeetingMaterialsSecurity(agendas)
    if (!materialsValidation.valid) {
      showWarning(materialsValidation.title!, materialsValidation.message!)
      return false
    }
    
    return true
  }
  
  // 保存草稿（仅创建模式）
  const handleSaveDraft = async () => {
    if (mode !== 'create') return
    
    const result = await saveDraft(formData)
    if (result) {
      showSuccess('保存成功', '草稿已保存')
    }
  }
  
  // 提交处理
  const handleSubmit = async () => {
    if (mode === 'view') return false
    if (!validateForm()) return false
    
    if (mode === 'create') {
      await submitDraft(formData)
      return true
    } else if (mode === 'edit') {
      const updateData: any = {
        name: formData.name,
        description: formData.description,
        security_level: formData.securityLevel,
        type: formData.type,
        start_time: `${formData.startTime}:00+08:00`,
        end_time: `${formData.endTime}:00+08:00`,
        location: formData.location,
        category: formData.category,
        organizer: formData.organizer,
        host: formData.host,
        password: formData.password,
        expiry_type: formData.expiryType,
        expiry_date: formData.expiryDate,
        sign_in_type: formData.signInType
      }
      
      updateMutation.mutate(updateData)
      return true
    }
  }
  
  // 确定加载和初始化状态
  const isLoading = mode === 'create' ? draftLoading : meetingLoading
  const isInitialized = mode === 'create' ? draftInitialized : !!meeting
  const submitPending = mode === 'edit' ? updateMutation.isPending : draftLoading
  
  return {
    mode,
    formData,
    isInitialized,
    isLoading,
    isError,
    submitPending,
    
    agendas,
    addAgenda,
    removeAgenda,
    updateAgendaName,
    updateAgendaPresenter,
    reorderAgendas,
    
    handleFormDataChange,
    handleParticipantsChange,
    removeParticipant,
    
    handleFileUpload,
    removeMaterial,
    updateMaterialSecurity,
    reorderMaterials,
    
    handleSaveDraft,
    handleSubmit
  }
}
