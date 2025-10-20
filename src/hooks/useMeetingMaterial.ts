/**
 * 会议材料管理 Hook
 * 负责文件的上传、删除、排序和密级管理
 */

import { meetingApi } from '@/services/meeting'
import { detectSecurityLevelFromFilename, transformFileFromApi } from '@/utils/meeting.utils'
import type { MeetingMaterial, MeetingSecurityLevel, MeetingAgenda } from '@/types'

export function useMeetingMaterial(
  meetingId: string | null,
  agendas: MeetingAgenda[],
  setAgendas: React.Dispatch<React.SetStateAction<MeetingAgenda[]>>
) {
  /**
   * 上传文件到指定议题
   */
  const uploadFiles = async (agendaId: string, files: File[], defaultSecurityLevel: MeetingSecurityLevel) => {
    if (!files || files.length === 0 || !meetingId) return

    // 为每个文件智能识别密级
    const filesWithSecurityLevel = files.map(file => ({
      file,
      securityLevel: detectSecurityLevelFromFilename(file.name) || defaultSecurityLevel
    }))

    const uploadPromises = filesWithSecurityLevel.map(async ({ file, securityLevel }) => {
      const uploadedFile = await meetingApi.uploadMeetingFile(
        meetingId, 
        file, 
        agendaId,
        securityLevel ?? undefined
      )
      
      return transformFileFromApi(uploadedFile, meetingId, agendaId, securityLevel)
    })

    const newMaterials = await Promise.all(uploadPromises)
    
    // 检查文件是否已存在
    const currentAgenda = agendas.find(a => a.id === agendaId)
    const existingMaterialIds = new Set(currentAgenda?.materials.map(m => m.id) || [])
    
    const materialsToAdd: MeetingMaterial[] = []
    
    newMaterials.forEach(material => {
      if (!existingMaterialIds.has(material.id)) {
        materialsToAdd.push(material)
      }
    })
    
    // 更新议题材料
    if (materialsToAdd.length > 0) {
      setAgendas(prev =>
        prev.map(agenda => 
          agenda.id === agendaId 
            ? { ...agenda, materials: [...agenda.materials, ...materialsToAdd] }
            : agenda
        )
      )
    }
  }

  /**
   * 删除文件
   */
  const removeMaterial = async (agendaId: string, materialId: string) => {
    if (!meetingId) return

    await meetingApi.deleteMeetingFile(meetingId, materialId)
    
    setAgendas(prev =>
      prev.map(agenda => 
        agenda.id === agendaId 
          ? { ...agenda, materials: agenda.materials.filter(m => m.id !== materialId) }
          : agenda
      )
    )
  }

  /**
   * 更新文件密级
   */
  const updateMaterialSecurity = (agendaId: string, materialId: string, securityLevel: MeetingSecurityLevel) => {
    setAgendas(prev =>
      prev.map(agenda => 
        agenda.id === agendaId 
          ? {
              ...agenda,
              materials: agenda.materials.map(material =>
                material.id === materialId ? { ...material, securityLevel } : material
              )
            }
          : agenda
      )
    )
  }

  /**
   * 重新排序文件
   */
  const reorderMaterials = async (agendaId: string, newMaterials: MeetingMaterial[]) => {
    if (!meetingId) return

    // 先更新本地状态
    setAgendas(prev =>
      prev.map(agenda => 
        agenda.id === agendaId 
          ? { ...agenda, materials: newMaterials }
          : agenda
      )
    )
    
    // TODO: 调用后端 API 更新排序
    // const materialIds = newMaterials.map(m => m.id)
    // await meetingApi.updateMaterialOrder(meetingId, agendaId, materialIds)
  }

  return {
    uploadFiles,
    removeMaterial,
    updateMaterialSecurity,
    reorderMaterials
  }
}
