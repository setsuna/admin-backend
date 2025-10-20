/**
 * 会议议题管理 Hook
 * 负责议题的增删改查和排序
 */

import { useState } from 'react'
import { meetingApi } from '@/services/meeting'
import { transformAgendaFromApi, generateAgendaTitle } from '@/utils/meeting.utils'
import type { MeetingAgenda } from '@/types'

export function useMeetingAgenda(meetingId: string | null) {
  const [agendas, setAgendas] = useState<MeetingAgenda[]>([])

  /**
   * 加载议题列表（包含文件）
   */
  const loadAgendas = async () => {
    if (!meetingId) return

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
          // 即使加载文件失败，也返回议题
          const agenda = transformAgendaFromApi(a, meetingId)
          agenda.materials = []
          return agenda
        }
      })
    )
    
    setAgendas(agendasWithFiles)
    return agendasWithFiles
  }

  /**
   * 创建默认议题
   */
  const createDefaultAgenda = async () => {
    if (!meetingId) return

    const agendaData = {
      title: '议题一',
      description: '',
      duration: 30,
      order_num: 1
    }
    
    const createdAgenda = await meetingApi.createAgenda(meetingId, agendaData)
    const newAgenda = transformAgendaFromApi(createdAgenda, meetingId)
    
    setAgendas([newAgenda])
    return newAgenda
  }

  /**
   * 添加议题
   */
  const addAgenda = async () => {
    if (!meetingId) return

    const agendaData = {
      title: generateAgendaTitle(agendas.length),
      description: '',
      duration: 30,
      order_num: agendas.length + 1
    }
    
    const createdAgenda = await meetingApi.createAgenda(meetingId, agendaData)
    const newAgenda = transformAgendaFromApi(createdAgenda, meetingId)
    
    setAgendas(prev => [...prev, newAgenda])
    return newAgenda
  }

  /**
   * 删除议题
   */
  const removeAgenda = async (agendaId: string) => {
    if (!meetingId) return

    await meetingApi.deleteAgenda(meetingId, agendaId)
    setAgendas(prev => prev.filter(a => a.id !== agendaId))
  }

  /**
   * 更新议题标题
   */
  const updateAgendaName = async (agendaId: string, title: string) => {
    if (!meetingId) return

    // 先更新本地状态（立即响应）
    setAgendas(prev => 
      prev.map(agenda => 
        agenda.id === agendaId ? { ...agenda, title } : agenda
      )
    )

    // 后台同步到后端（静默失败）
    try {
      await meetingApi.updateAgenda(meetingId, agendaId, { title })
    } catch (error) {
      console.error('更新议题名称失败:', error)
    }
  }

  /**
   * 重新排序议题
   */
  const reorderAgendas = async (newAgendas: MeetingAgenda[]) => {
    if (!meetingId) return

    // 先更新本地状态
    setAgendas(newAgendas)
    
    // TODO: 调用后端 API 更新排序
    // const agendaIds = newAgendas.map(a => a.id)
    // await meetingApi.updateAgendaOrder(meetingId, agendaIds)
  }

  return {
    agendas,
    setAgendas,
    loadAgendas,
    createDefaultAgenda,
    addAgenda,
    removeAgenda,
    updateAgendaName,
    reorderAgendas
  }
}
