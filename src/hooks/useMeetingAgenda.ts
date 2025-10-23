/**
 * 会议议题管理 Hook
 * 负责议题的增删改查和排序
 * ✅ 重构：使用 TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { meetingApi } from '@/services/meeting'
import { transformAgendaFromApi, generateAgendaTitle } from '@/utils/meeting.utils'
import { useNotifications } from './useNotifications'
import type { MeetingAgenda } from '@/types'

export function useMeetingAgenda(meetingId: string | null) {
  const queryClient = useQueryClient()
  const { showError } = useNotifications()

  /**
   * 加载议题列表（包含文件）
   * ✅ 重构：使用 useQuery
   */
  const {
    data: agendas = [],
    isLoading,
    isError,
    error,
    refetch: loadAgendas
  } = useQuery({
    queryKey: ['meeting-agendas', meetingId],
    queryFn: async () => {
      if (!meetingId) return []

      const existingAgendas = await meetingApi.getAgendas(meetingId)
      
      if (!existingAgendas || existingAgendas.length === 0) {
        return []
      }

      // 为每个议题加载文件
      const agendasWithFiles = await Promise.all(
        existingAgendas.map(async (a: any) => {
          try {
            const filesResponse = await meetingApi.getMeetingFiles(meetingId, {
              agendaId: a.id,
              page: 1,
              size: 100
            })
            
            const agenda = transformAgendaFromApi(a, meetingId)
            
            // ✅ 转换文件数据：后端下划线 → 前端驼峰
            agenda.materials = (filesResponse.items || []).map((file: any) => ({
              id: file.id,
              meetingId: meetingId,
              agendaId: a.id,
              name: file.original_name || file.originalName || file.name || '',
              originalName: file.original_name || file.originalName || file.name || '',
              size: file.file_size || file.fileSize || file.size || 0,
              type: file.mime_type || file.mimeType || file.type || '',
              url: file.file_path || file.filePath || file.url || '',
              securityLevel: file.security_level || file.securityLevel || null,
              uploadedBy: file.uploaded_by || file.uploadedBy || '',
              uploadedByName: file.uploaded_by_name || file.uploadedByName || '',
              downloadCount: file.download_count || file.downloadCount || 0,
              version: file.version || 1,
              isPublic: file.is_public || file.isPublic || false,
              createdAt: file.created_at || file.createdAt || new Date().toISOString(),
              updatedAt: file.updated_at || file.updatedAt || new Date().toISOString()
            }))
            
            return agenda
          } catch (error) {
            console.error(`加载议题 ${a.id} 的文件失败:`, error)
            const agenda = transformAgendaFromApi(a, meetingId)
            agenda.materials = []
            return agenda
          }
        })
      )
      
      return agendasWithFiles
    },
    enabled: !!meetingId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  })

  /**
   * 创建默认议题
   * ✅ 重构：使用 useMutation
   */
  const createDefaultAgendaMutation = useMutation({
    mutationFn: async () => {
      if (!meetingId) throw new Error('会议ID不存在')

      const agendaData = {
        title: '议题一',
        description: '',
        duration: 30,
        order_num: 1
      }
      
      const createdAgenda = await meetingApi.createAgenda(meetingId, agendaData)
      return transformAgendaFromApi(createdAgenda, meetingId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-agendas', meetingId] })
    },
    onError: (error: any) => {
      showError('创建议题失败', error.message)
    }
  })

  const createDefaultAgenda = async () => {
    return await createDefaultAgendaMutation.mutateAsync()
  }

  /**
   * 添加议题
   * ✅ 重构：使用 useMutation
   */
  const addAgendaMutation = useMutation({
    mutationFn: async () => {
      if (!meetingId) throw new Error('会议ID不存在')

      const agendaData = {
        title: generateAgendaTitle(agendas.length),
        description: '',
        duration: 30,
        order_num: agendas.length + 1
      }
      
      const createdAgenda = await meetingApi.createAgenda(meetingId, agendaData)
      return transformAgendaFromApi(createdAgenda, meetingId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-agendas', meetingId] })
    },
    onError: (error: any) => {
      showError('添加议题失败', error.message)
    }
  })

  const addAgenda = async () => {
    return await addAgendaMutation.mutateAsync()
  }

  /**
   * 删除议题
   * ✅ 重构：使用 useMutation
   */
  const removeAgendaMutation = useMutation({
    mutationFn: async (agendaId: string) => {
      if (!meetingId) throw new Error('会议ID不存在')
      await meetingApi.deleteAgenda(meetingId, agendaId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-agendas', meetingId] })
    },
    onError: (error: any) => {
      showError('删除议题失败', error.message)
    }
  })

  const removeAgenda = async (agendaId: string) => {
    await removeAgendaMutation.mutateAsync(agendaId)
  }

  /**
   * 更新议题标题
   * ✅ 重构：使用 useMutation
   */
  const updateAgendaNameMutation = useMutation({
    mutationFn: async ({ agendaId, title }: { agendaId: string; title: string }) => {
      if (!meetingId) throw new Error('会议ID不存在')
      await meetingApi.updateAgenda(meetingId, agendaId, { title })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-agendas', meetingId] })
    },
    onError: (error: any) => {
      console.error('更新议题名称失败:', error)
    }
  })

  const updateAgendaName = async (agendaId: string, title: string) => {
    await updateAgendaNameMutation.mutateAsync({ agendaId, title })
  }

  /**
   * 重新排序议题
   * ✅ 重构：使用 useMutation
   */
  const reorderAgendasMutation = useMutation({
    mutationFn: async (newAgendas: MeetingAgenda[]) => {
      if (!meetingId) throw new Error('会议ID不存在')
      // TODO: 调用后端 API 更新排序
      // const agendaIds = newAgendas.map(a => a.id)
      // await meetingApi.updateAgendaOrder(meetingId, agendaIds)
      return newAgendas
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-agendas', meetingId] })
    },
    onError: (error: any) => {
      showError('排序失败', error.message)
    }
  })

  const reorderAgendas = async (newAgendas: MeetingAgenda[]) => {
    await reorderAgendasMutation.mutateAsync(newAgendas)
  }

  return {
    agendas,
    isLoading,
    isError,
    error,
    loadAgendas,
    createDefaultAgenda,
    addAgenda,
    removeAgenda,
    updateAgendaName,
    reorderAgendas
  }
}
