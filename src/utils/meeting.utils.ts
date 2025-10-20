/**
 * 会议相关工具函数
 */

import type { MeetingSecurityLevel, MeetingAgenda } from '@/types'

/**
 * 智能识别文件名中的密级
 */
export function detectSecurityLevelFromFilename(filename: string): MeetingSecurityLevel | null {
  const lowerFilename = filename.toLowerCase()
  
  if (lowerFilename.includes('秘密') || lowerFilename.includes('secret')) {
    return 'secret'
  }
  if (lowerFilename.includes('机密') || lowerFilename.includes('confidential')) {
    return 'confidential'
  }
  if (lowerFilename.includes('内部') || lowerFilename.includes('internal')) {
    return 'internal'
  }
  
  return null
}

/**
 * 转换后端议题数据为前端格式
 */
export function transformAgendaFromApi(apiAgenda: any, meetingId: string): MeetingAgenda {
  return {
    id: apiAgenda.id,
    meetingId: meetingId,
    title: apiAgenda.title || '',
    description: apiAgenda.description || '',
    duration: apiAgenda.duration,
    presenter: apiAgenda.presenter,
    materials: [],
    order: apiAgenda.order_num || apiAgenda.order || 0,
    status: 'pending' as const,
    createdAt: apiAgenda.created_at || apiAgenda.createdAt || new Date().toISOString(),
    updatedAt: apiAgenda.updated_at || apiAgenda.updatedAt || new Date().toISOString()
  }
}

/**
 * 转换后端文件数据为前端格式
 */
export function transformFileFromApi(apiFile: any, meetingId: string, agendaId: string, securityLevel: MeetingSecurityLevel) {
  return {
    id: apiFile.id,
    meetingId: meetingId,
    agendaId: agendaId,
    name: apiFile.original_name || apiFile.originalName || apiFile.name || '未命名文件',  // ✅ 添加默认值
    originalName: apiFile.original_name || apiFile.originalName || apiFile.name || '未命名文件',  // ✅ 添加默认值
    size: apiFile.file_size || apiFile.fileSize || apiFile.size || 0,
    type: apiFile.mime_type || apiFile.mimeType || apiFile.type || 'application/octet-stream',
    url: apiFile.file_path || apiFile.filePath || apiFile.url || '',
    securityLevel: securityLevel,
    uploadedBy: apiFile.uploaded_by || apiFile.uploadedBy || '',
    uploadedByName: '',
    downloadCount: 0,
    version: 1,
    isPublic: false,
    createdAt: apiFile.created_at || apiFile.createdAt || new Date().toISOString(),
    updatedAt: apiFile.updated_at || apiFile.updatedAt || new Date().toISOString()
  }
}

/**
 * 生成默认议题标题
 */
export function generateAgendaTitle(currentCount: number): string {
  const titles = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  return currentCount < 10 
    ? `议题${titles[currentCount]}` 
    : `议题${currentCount + 1}`
}
