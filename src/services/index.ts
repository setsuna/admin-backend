/**
 * 服务层统一导出
 * 提供统一的API接口，保持向后兼容
 */

import { envConfig } from '@/config/env.config'

// 核心服务
export { httpClient } from './core/http.client'
export { authService, auth } from './auth'
export { errorHandler, retryManager } from './core/error.handler'

// 业务服务
export { departmentService } from './department'
export { userService } from './user'
export { policyService } from './policy'

// API服务 - 移除静态导入，只在需要时动态导入
// export { dictApiService } from './api/dict.api'
// export { meetingApiService } from './api/meeting.api'
// export { userApiService, permissionApiService } from './api/user.api'

// 类型导出
export type * from './types/api.types'
export type * from './types/dict.types'
export type * from './types/meeting.types'

// 动态API服务 - 按需加载
let dictApiService: any = null
let meetingApiService: any = null
let permissionApiService: any = null

// 懒加载API服务
const getDictApiService = async () => {
  if (!dictApiService) {
    const module = await import('./api/dict.api')
    dictApiService = module.dictApiService
  }
  return dictApiService
}

const getMeetingApiService = async () => {
  if (!meetingApiService) {
    const module = await import('./api/meeting.api')
    meetingApiService = module.meetingApiService
  }
  return meetingApiService
}

const getPermissionApiService = async () => {
  if (!permissionApiService) {
    const module = await import('./api/user.api')
    permissionApiService = module.permissionApiService
  }
  return permissionApiService
}

// 兼容性API接口 - 保持现有调用方式不变
export const dictApi = {
  async getDictionaries(
    filters: any = {},
    page: number = 1,
    pageSize: number = 20
  ) {
    const service = await getDictApiService()
    return service.getDictionaries(filters, page, pageSize)
  },

  async getDictionary(id: string) {
    const service = await getDictApiService()
    return service.getDictionary(id)
  },

  async createDictionary(data: any) {
    const service = await getDictApiService()
    return service.createDictionary(data)
  },

  async updateDictionary(id: string, data: any) {
    const service = await getDictApiService()
    return service.updateDictionary(id, data)
  },

  async deleteDictionary(id: string) {
    const service = await getDictApiService()
    return service.deleteDictionary(id)
  },

  async deleteDictionaries(ids: string[]) {
    const service = await getDictApiService()
    return service.deleteDictionaries(ids)
  },

  async updateDictionaryStatus(id: string, status: 'enabled' | 'disabled') {
    const service = await getDictApiService()
    return service.updateDictionaryStatus(id, status)
  },

  async getDictTypes() {
    const service = await getDictApiService()
    return service.getDictTypes()
  },

  async syncToDevices(dictIds: string[]) {
    const service = await getDictApiService()
    return service.syncToDevices(dictIds)
  },

  async exportDictionaries(dictIds?: string[]) {
    const service = await getDictApiService()
    return service.exportDictionaries(dictIds)
  }
}

export const meetingApi = {
  async getMeetings(
    filters: any = {},
    page: number = 1,
    pageSize: number = 10
  ) {
    const service = await getMeetingApiService()
    return service.getMeetings(filters, page, pageSize)
  },

  async getMyMeetings(
    tabType: 'hosted' | 'participated' | 'all' = 'all',
    filters: any = {},
    page: number = 1,
    pageSize: number = 10
  ) {
    const service = await getMeetingApiService()
    return service.getMyMeetings(tabType, filters, page, pageSize)
  },

  async getMeetingById(id: string) {
    const service = await getMeetingApiService()
    return service.getMeetingById(id)
  },

  async createMeeting(meetingData: any) {
    const service = await getMeetingApiService()
    return service.createMeeting(meetingData)
  },

  async createMeetingFromRequest(request: any) {
    const service = await getMeetingApiService()
    return service.createMeetingFromRequest(request)
  },

  async updateMeeting(id: string, updates: any) {
    const service = await getMeetingApiService()
    return service.updateMeeting(id, updates)
  },

  async deleteMeeting(id: string) {
    const service = await getMeetingApiService()
    return service.deleteMeeting(id)
  },

  async batchUpdateMeetings(ids: string[], updates: any) {
    const service = await getMeetingApiService()
    return service.batchUpdateMeetings(ids, updates)
  },

  // 草稿会议相关
  async createDraftMeeting() {
    const service = await getMeetingApiService()
    return service.createDraftMeeting()
  },

  async saveDraftMeeting(meetingId: string, meetingData: any) {
    const service = await getMeetingApiService()
    return service.saveDraftMeeting(meetingId, meetingData)
  },

  async submitDraftMeeting(meetingId: string, meetingData: any) {
    const service = await getMeetingApiService()
    return service.submitDraftMeeting(meetingId, meetingData)
  },

  // 文件管理相关
  async uploadMeetingFile(meetingId: string, file: File, agendaId?: string) {
    const service = await getMeetingApiService()
    return service.uploadMeetingFile(meetingId, file, agendaId)
  },

  async getMeetingFiles(meetingId: string) {
    const service = await getMeetingApiService()
    return service.getMeetingFiles(meetingId)
  },

  async deleteMeetingFile(meetingId: string, fileId: string) {
    const service = await getMeetingApiService()
    return service.deleteMeetingFile(meetingId, fileId)
  }
}

export const permissionApi = {
  async getAllPermissions() {
    const service = await getPermissionApiService()
    return service.getAllPermissions()
  },

  async getAllRoles() {
    const service = await getPermissionApiService()
    return service.getAllRoles()
  },

  async getUserMenuConfig(user: any) {
    const service = await getPermissionApiService()
    return service.getUserMenuConfig(user)
  },

  async checkUserPermission(userId: string, permission: string) {
    const service = await getPermissionApiService()
    return service.checkUserPermission(userId, permission)
  }
}

// 环境检测和切换逻辑
const shouldUseMock = () => {
  return envConfig.ENABLE_MOCK
}

// 如果启用Mock模式，则切换到Mock API
if (shouldUseMock()) {
  // 可以在这里做动态导入切换到Mock服务
  console.log('🔧 Using Mock API services')
} else {
  console.log('🌐 Using Real API services')
}
