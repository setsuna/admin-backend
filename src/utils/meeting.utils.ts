/**
 * 会议相关工具函数
 */

import type { MeetingFormData } from '@/types'

/**
 * 计算默认会议时间
 * 规则：取当日整半小时，结束时间比开始时间晚30分钟
 */
export function getDefaultMeetingTimes() {
  const now = new Date()
  
  // 向上取整到最近的半小时
  const minutes = now.getMinutes()
  const roundedMinutes = minutes <= 30 ? 30 : 60
  
  const startTime = new Date(now)
  startTime.setMinutes(roundedMinutes)
  startTime.setSeconds(0)
  startTime.setMilliseconds(0)
  
  // 如果是60分钟，则进位到下一个小时的0分
  if (roundedMinutes === 60) {
    startTime.setHours(startTime.getHours() + 1)
    startTime.setMinutes(0)
  }
  
  // 结束时间 = 开始时间 + 30分钟
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000)
  
  return {
    startTime: startTime.toISOString().slice(0, 16),
    endTime: endTime.toISOString().slice(0, 16)
  }
}

/**
 * 获取会议表单的初始值
 */
export function getInitialFormData(): MeetingFormData {
  const { startTime, endTime } = getDefaultMeetingTimes()
  
  return {
    name: '',
    securityLevel: 'internal',
    category: '部门例会',
    startTime,
    endTime,
    type: 'standard',
    description: '',
    participants: [],
    agendas: [],
    password: '',
    expiryType: 'none',
    expiryDate: '',
    signInType: 'none',
    location: '',
    organizer: '',
    host: ''
  }
}

/**
 * 检查字符串是否有效（非空且非零值）
 */
export function isValidString(value: string | undefined | null): boolean {
  return !!value && value.trim() !== ''
}

/**
 * 检查时间是否有效（非Go零值）
 */
export function isValidTime(time: string | undefined | null): boolean {
  if (!time) return false
  // Go 零值是 "0001-01-01T00:00:00Z"
  return !time.startsWith('0001-01-01')
}

/**
 * 转换后端草稿数据为前端表单格式
 * 只转换有效字段，忽略后端零值
 */
export function convertDraftDataToFormData(draftData: any): Partial<MeetingFormData> {
  const convertedData: Partial<MeetingFormData> = {}
  
  // 基本信息字段
  if (isValidString(draftData.name)) {
    convertedData.name = draftData.name
  }
  
  if (isValidString(draftData.description)) {
    convertedData.description = draftData.description
  }
  
  if (isValidString(draftData.security_level)) {
    convertedData.securityLevel = draftData.security_level
  }
  
  if (isValidString(draftData.type)) {
    convertedData.type = draftData.type
  }
  
  if (isValidString(draftData.category)) {
    convertedData.category = draftData.category
  }
  
  if (isValidString(draftData.location)) {
    convertedData.location = draftData.location
  }
  
  if (isValidString(draftData.organizer)) {
    convertedData.organizer = draftData.organizer
  }
  
  if (isValidString(draftData.host)) {
    convertedData.host = draftData.host
  }
  
  // 高级设置字段
  if (isValidString(draftData.password)) {
    convertedData.password = draftData.password
  }
  
  if (isValidString(draftData.expiry_type)) {
    convertedData.expiryType = draftData.expiry_type as 'none' | 'today' | 'custom'
  }
  
  if (isValidString(draftData.expiry_date)) {
    convertedData.expiryDate = draftData.expiry_date
  }
  
  if (isValidString(draftData.sign_in_type)) {
    convertedData.signInType = draftData.sign_in_type as 'none' | 'manual' | 'password'
  }
  
  // 时间字段：只有非零值时才使用
  if (isValidTime(draftData.start_time)) {
    convertedData.startTime = draftData.start_time.slice(0, 16)
  }
  
  if (isValidTime(draftData.end_time)) {
    convertedData.endTime = draftData.end_time.slice(0, 16)
  }
  
  return convertedData
}

/**
 * 生成议题标题
 * @param currentCount - 当前议题数量
 * @returns 议题标题，如 "议题一"、"议题二" 等
 */
export function generateAgendaTitle(currentCount: number): string {
  const numbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  
  // 如果超过10个，使用数字
  if (currentCount >= 10) {
    return `议题${currentCount + 1}`
  }
  
  return `议题${numbers[currentCount]}`
}

/**
 * 转换后端议题数据为前端格式
 * @param apiAgenda - 后端返回的议题数据
 * @param meetingId - 会议ID
 * @returns 前端格式的议题数据
 */
export function transformAgendaFromApi(apiAgenda: any, meetingId: string): any {
  return {
    id: apiAgenda.id,
    meetingId: meetingId,
    title: apiAgenda.title || '',
    description: apiAgenda.description || '',
    duration: apiAgenda.duration || 30,
    orderNum: apiAgenda.order_num || apiAgenda.orderNum || 0,
    materials: [] // 材料需要单独加载
  }
}

/**
 * 从文件名检测密级
 * @param filename - 文件名
 * @returns 检测到的密级，如果未检测到则返回 null
 */
export function detectSecurityLevelFromFilename(filename: string): 'internal' | 'confidential' | 'secret' | null {
  const lowerName = filename.toLowerCase()
  
  if (lowerName.includes('机密') || lowerName.includes('secret')) {
    return 'secret'
  }
  
  if (lowerName.includes('秘密') || lowerName.includes('confidential')) {
    return 'confidential'
  }
  
  if (lowerName.includes('内部') || lowerName.includes('internal')) {
    return 'internal'
  }
  
  return null
}

/**
 * 转换后端文件数据为前端格式
 * @param apiFile - 后端返回的文件数据
 * @param meetingId - 会议ID
 * @param agendaId - 议题ID
 * @param securityLevel - 密级
 * @returns 前端格式的文件数据
 */
export function transformFileFromApi(
  apiFile: any, 
  meetingId: string, 
  agendaId: string, 
  securityLevel: 'internal' | 'confidential' | 'secret' | null
): any {
  return {
    id: apiFile.id,
    meetingId: meetingId,
    agendaId: agendaId,
    name: apiFile.original_name || apiFile.originalName || apiFile.name || '',
    originalName: apiFile.original_name || apiFile.originalName || apiFile.name || '',
    size: apiFile.file_size || apiFile.fileSize || apiFile.size || 0,
    type: apiFile.mime_type || apiFile.mimeType || apiFile.type || '',
    url: apiFile.file_path || apiFile.filePath || apiFile.url || '',
    securityLevel: securityLevel,
    uploadedBy: apiFile.uploaded_by || apiFile.uploadedBy || '',
    uploadedByName: apiFile.uploaded_by_name || apiFile.uploadedByName || '',
    downloadCount: apiFile.download_count || apiFile.downloadCount || 0,
    version: apiFile.version || 1,
    isPublic: apiFile.is_public || apiFile.isPublic || false,
    createdAt: apiFile.created_at || apiFile.createdAt || new Date().toISOString(),
    updatedAt: apiFile.updated_at || apiFile.updatedAt || new Date().toISOString()
  }
}

/**
 * 验证会议表单数据
 */
export function validateMeetingForm(formData: MeetingFormData): { valid: boolean; message?: string; title?: string } {
  if (!formData.name.trim()) {
    return {
      valid: false,
      title: '请填写会议名称',
      message: '会议名称不能为空'
    }
  }
  
  if (formData.type === 'standard' && formData.participants.length === 0) {
    return {
      valid: false,
      title: '请添加参会人员',
      message: '标准会议需要添加参会人员'
    }
  }
  
  if (new Date(formData.startTime) >= new Date(formData.endTime)) {
    return {
      valid: false,
      title: '时间设置有误',
      message: '结束时间必须晚于开始时间'
    }
  }
  
  return { valid: true }
}
