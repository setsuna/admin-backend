/**
 * 创建会议表单管理 Hook
 * 整合表单状态、草稿初始化、表单验证等逻辑
 */

import { useState, useEffect, useRef } from 'react'
import { useMeetingDraft } from './useMeetingDraft'
import { useMeetingAgenda } from './useMeetingAgenda'
import { useMeetingMaterial } from './useMeetingMaterial'
import { useNotifications } from './useNotifications'
import { 
  getInitialFormData, 
  convertDraftDataToFormData, 
  validateMeetingForm 
} from '@/utils/meeting.utils'
import { autoAdjustMeetingTimes } from '@/utils/time.utils'
import type { MeetingFormData } from '@/types'

export function useCreateMeetingForm() {
  const { showWarning, showSuccess } = useNotifications()
  
  // ✅ 草稿管理（使用 TanStack Query）
  const { 
    draftMeetingId, 
    isInitialized, 
    loading,
    draftData,
    saveDraft, 
    submitDraft 
  } = useMeetingDraft()
  
  // 议题管理
  const { 
    agendas, 
    isLoading: agendasLoading,
    loadAgendas,
    createDefaultAgenda,
    addAgenda, 
    removeAgenda, 
    updateAgendaName, 
    reorderAgendas 
  } = useMeetingAgenda(draftMeetingId)
  
  // 文件管理
  const { 
    uploadFiles, 
    removeMaterial, 
    updateMaterialSecurity, 
    reorderMaterials 
  } = useMeetingMaterial(draftMeetingId, agendas)
  
  // 表单数据状态
  const [formData, setFormData] = useState<MeetingFormData>(getInitialFormData)
  
  // 标记议题是否已初始化（避免无限循环）
  const agendasInitializedRef = useRef(false)
  // 记录上一次的 agendas 长度，避免无限更新
  const prevAgendasLengthRef = useRef(0)

  // ✅ 初始化成功后，恢复草稿数据
  useEffect(() => {
    if (!draftData) return
    
    // 只恢复有效的草稿数据，忽略后端零值
    const convertedData = convertDraftDataToFormData(draftData.draftData)
    
    // 只有当有有效字段时才更新
    if (Object.keys(convertedData).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...convertedData,
        // 保持原有的 agendas，不从 draftData 中恢复
        agendas: prev.agendas
      }))
    }
  }, [draftData])
  
  // ✅ 初始化后处理议题：如果有已存在的议题则加载，否则创建默认议题
  useEffect(() => {
    if (!draftMeetingId || !isInitialized) return
    if (!draftData) return
    // 等待 agendas 加载完成
    if (agendasLoading) return
    // 已经初始化过，不再重复
    if (agendasInitializedRef.current) return
    
    const initAgendas = async () => {
      if (!agendas || agendas.length === 0) {
        // 没有议题，创建默认议题
        await createDefaultAgenda()
        agendasInitializedRef.current = true
      } else {
        // 已有议题，标记为已初始化
        agendasInitializedRef.current = true
      }
    }
    
    initAgendas()
  }, [draftMeetingId, isInitialized, draftData, agendasLoading])

  // 同步 agendas 到 formData（只在真正变化时）
  useEffect(() => {
    // 只在议题数量变化或内容变化时才更新
    if (agendas.length !== prevAgendasLengthRef.current) {
      setFormData(prev => ({ ...prev, agendas }))
      prevAgendasLengthRef.current = agendas.length
    }
  }, [agendas.length])

  // 表单数据更新
  const handleFormDataChange = (field: string, value: any) => {
    // 🕐 特殊处理：开始时间变化时自动调整时间
    if (field === 'startTime' && value) {
      const { startTime, endTime } = autoAdjustMeetingTimes(value)
      setFormData(prev => ({ 
        ...prev, 
        startTime, 
        endTime 
      }))
      return
    }
    
    // 其他字段正常更新
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

  // 保存草稿
  const handleSaveDraft = async () => {
    const result = await saveDraft(formData)
    if (result) {
      showSuccess('保存成功', '草稿已保存')
    }
  }

  // 提交会议
  const handleSubmit = async () => {
    // 验证表单
    const validation = validateMeetingForm(formData)
    if (!validation.valid) {
      showWarning(validation.title!, validation.message!)
      return false
    }

    // 提交
    await submitDraft(formData)
    return true
  }

  return {
    // 状态
    formData,
    isInitialized,
    loading,
    draftMeetingId,
    
    // 议题相关
    agendas,
    addAgenda,
    removeAgenda,
    updateAgendaName,
    reorderAgendas,
    
    // 表单操作
    handleFormDataChange,
    handleParticipantsChange,
    removeParticipant,
    
    // 文件操作
    handleFileUpload,
    removeMaterial,
    updateMaterialSecurity,
    reorderMaterials,
    
    // 提交操作
    handleSaveDraft,
    handleSubmit
  }
}
