/**
 * 会议材料管理 Hook
 * 负责文件的上传、删除、排序和密级管理
 * ✅ 重构：使用 TanStack Query
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { meetingApi } from '@/services/meeting'
import { detectSecurityLevelFromFilename, transformFileFromApi } from '@/utils/meeting.utils'
import { useNotifications } from './useNotifications'
import type { MeetingMaterial, MeetingSecurityLevel } from '@/types'

export function useMeetingMaterial(
  meetingId: string | null
) {
  const queryClient = useQueryClient()
  const { showError } = useNotifications()

  /**
   * 上传文件到指定议题
   * ✅ 重构：使用 useMutation
   */
  const uploadFilesMutation = useMutation({
    mutationFn: async ({ 
      agendaId, 
      files, 
      defaultSecurityLevel 
    }: { 
      agendaId: string
      files: File[]
      defaultSecurityLevel: MeetingSecurityLevel 
    }) => {
      if (!files || files.length === 0 || !meetingId) {
        throw new Error('参数不完整')
      }

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

      return await Promise.all(uploadPromises)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-agendas', meetingId] })
    },
    onError: (error: any) => {
      showError('上传失败', error.message)
    }
  })

  const uploadFiles = async (
    agendaId: string, 
    files: File[], 
    defaultSecurityLevel: MeetingSecurityLevel
  ) => {
    await uploadFilesMutation.mutateAsync({ agendaId, files, defaultSecurityLevel })
  }

  /**
   * 删除文件
   * ✅ 重构：使用 useMutation
   */
  const removeMaterialMutation = useMutation({
    mutationFn: async ({ materialId }: { agendaId: string; materialId: string }) => {
      if (!meetingId) throw new Error('会议ID不存在')
      await meetingApi.deleteMeetingFile(meetingId, materialId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-agendas', meetingId] })
    },
    onError: (error: any) => {
      showError('删除失败', error.message)
    }
  })

  const removeMaterial = async (agendaId: string, materialId: string) => {
    await removeMaterialMutation.mutateAsync({ agendaId, materialId })
  }

  /**
   * 更新文件密级
   * ✅ 重构：使用 useMutation 调用后端 API
   */
  const updateMaterialSecurityMutation = useMutation({
    mutationFn: async ({
      materialId,
      securityLevel
    }: {
      agendaId: string
      materialId: string
      securityLevel: MeetingSecurityLevel
    }) => {
      if (!meetingId) throw new Error('会议ID不存在')
      
      // ✅ 调用后端 API 更新密级
      await meetingApi.updateFileSecurityLevel(meetingId, materialId, securityLevel)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-agendas', meetingId] })
    },
    onError: (error: any) => {
      showError('更新密级失败', error.message)
    }
  })

  const updateMaterialSecurity = async (
    agendaId: string,
    materialId: string,
    securityLevel: MeetingSecurityLevel
  ) => {
    await updateMaterialSecurityMutation.mutateAsync({ agendaId, materialId, securityLevel })
  }

  /**
   * 重新排序文件
   * ✅ 重构：使用 useMutation
   */
  const reorderMaterialsMutation = useMutation({
    mutationFn: async ({ agendaId, newMaterials }: { 
      agendaId: string
      newMaterials: MeetingMaterial[] 
    }) => {
      if (!meetingId) throw new Error('会议ID不存在')
      
      // ✅ 调用后端 API 更新排序
      const fileIds = newMaterials.map(m => m.id)
      await meetingApi.updateFileOrder(meetingId, agendaId, fileIds)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-agendas', meetingId] })
    },
    onError: (error: any) => {
      showError('排序失败', error.message)
      queryClient.invalidateQueries({ queryKey: ['meeting-agendas', meetingId] })
    }
  })

  const reorderMaterials = async (agendaId: string, newMaterials: MeetingMaterial[]) => {
    await reorderMaterialsMutation.mutateAsync({ agendaId, newMaterials })
  }

  return {
    uploadFiles,
    removeMaterial,
    updateMaterialSecurity,
    reorderMaterials
  }
}
