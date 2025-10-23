/**
 * 创建会议表单管理 Hook
 * 整合表单状态、草稿初始化、表单验证等逻辑
 */

import { useState, useEffect } from 'react'
import { meetingApi } from '@/services/meeting'
import { useMeetingDraft } from './useMeetingDraft'
import { useMeetingAgenda } from './useMeetingAgenda'
import { useMeetingMaterial } from './useMeetingMaterial'
import { useNotifications } from './useNotifications'
import { 
  getInitialFormData, 
  convertDraftDataToFormData, 
  validateMeetingForm 
} from '@/utils/meeting.utils'
import type { MeetingFormData } from '@/types'

export function useCreateMeetingForm() {
  const { showWarning, showSuccess } = useNotifications()
  
  // 草稿管理
  const { 
    draftMeetingId, 
    isInitialized, 
    loading, 
    initializeDraft, 
    saveDraft, 
    submitDraft 
  } = useMeetingDraft()
  
  // 议题管理
  const { 
    agendas, 
    setAgendas,
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
  } = useMeetingMaterial(draftMeetingId, agendas, setAgendas)
  
  // 表单数据状态
  const [formData, setFormData] = useState<MeetingFormData>(getInitialFormData)

  // 初始化草稿会议
  useEffect(() => {
    const init = async () => {
      const result = await initializeDraft()
      if (!result) return
      
      const { draftData } = result
      
      // 只恢复有效的草稿数据，忽略后端零值
      if (draftData) {
        const convertedData = convertDraftDataToFormData(draftData)
        
        // 只有当有有效字段时才更新
        if (Object.keys(convertedData).length > 0) {
          setFormData(prev => ({
            ...prev,
            ...convertedData,
            // 保持原有的 agendas，不从 draftData 中恢复
            agendas: prev.agendas
          }))
        }
      }
    }
    
    init()
  }, [])
  
  // 当草稿 ID 初始化后，查询议题
  useEffect(() => {
    if (!draftMeetingId || !isInitialized) return
    
    const checkAndCreateAgenda = async () => {
      try {
        // 查询当前草稿是否已有议题
        const existingAgendas = await meetingApi.getAgendas(draftMeetingId)
        
        if (!existingAgendas || existingAgendas.length === 0) {
          // 没有议题，创建默认议题
          await createDefaultAgenda()
        } else {
          // 有议题，加载它们
          await loadAgendas()
        }
      } catch (error) {
        console.error('查询议题失败:', error)
      }
    }
    
    checkAndCreateAgenda()
  }, [draftMeetingId, isInitialized])

  // 同步 agendas 到 formData
  useEffect(() => {
    setFormData(prev => ({ ...prev, agendas }))
  }, [agendas])

  // 表单数据更新
  const handleFormDataChange = (field: string, value: any) => {
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
