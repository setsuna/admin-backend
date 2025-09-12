/**
 * 服务层统一导出
 * 提供统一的API接口，保持向后兼容
 */

// 核心服务
export { httpClient } from './core/http.client'
export { authService } from './core/auth.service'
export { errorHandler, retryManager } from './core/error.handler'

// API服务
export { dictApiService } from './api/dict.api'
export { meetingApiService } from './api/meeting.api'
export { userApiService, permissionApiService } from './api/user.api'
export { permissionApi } from './api/permission.api'

// 类型导出
export type * from './types/api.types'
export type * from './types/dict.types'
export type * from './types/meeting.types'

// 兼容性API接口 - 保持现有调用方式不变
export const dictApi = {
  async getDictionaries(
    filters: any = {},
    page: number = 1,
    pageSize: number = 20
  ) {
    const { dictApiService } = await import('./api/dict.api')
    return dictApiService.getDictionaries(filters, page, pageSize)
  },

  async getDictionary(id: string) {
    const { dictApiService } = await import('./api/dict.api')
    return dictApiService.getDictionary(id)
  },

  async createDictionary(data: any) {
    const { dictApiService } = await import('./api/dict.api')
    return dictApiService.createDictionary(data)
  },

  async updateDictionary(id: string, data: any) {
    const { dictApiService } = await import('./api/dict.api')
    return dictApiService.updateDictionary(id, data)
  },

  async deleteDictionary(id: string) {
    const { dictApiService } = await import('./api/dict.api')
    return dictApiService.deleteDictionary(id)
  },

  async deleteDictionaries(ids: string[]) {
    const { dictApiService } = await import('./api/dict.api')
    return dictApiService.deleteDictionaries(ids)
  },

  async updateDictionaryStatus(id: string, status: 'enabled' | 'disabled') {
    const { dictApiService } = await import('./api/dict.api')
    return dictApiService.updateDictionaryStatus(id, status)
  },

  async getDictTypes() {
    const { dictApiService } = await import('./api/dict.api')
    return dictApiService.getDictTypes()
  },

  async syncToDevices(dictIds: string[]) {
    const { dictApiService } = await import('./api/dict.api')
    return dictApiService.syncToDevices(dictIds)
  },

  async exportDictionaries(dictIds?: string[]) {
    const { dictApiService } = await import('./api/dict.api')
    return dictApiService.exportDictionaries(dictIds)
  }
}

export const meetingApi = {
  async getMeetings(
    filters: any = {},
    page: number = 1,
    pageSize: number = 10
  ) {
    const { meetingApiService } = await import('./api/meeting.api')
    return meetingApiService.getMeetings(filters, page, pageSize)
  },

  async getMyMeetings(
    tabType: 'hosted' | 'participated' | 'all' = 'all',
    filters: any = {},
    page: number = 1,
    pageSize: number = 10,
    currentUserId: string = '1'
  ) {
    const { meetingApiService } = await import('./api/meeting.api')
    return meetingApiService.getMyMeetings(tabType, filters, page, pageSize)
  },

  async getMeetingById(id: string) {
    const { meetingApiService } = await import('./api/meeting.api')
    return meetingApiService.getMeetingById(id)
  },

  async createMeeting(meetingData: any) {
    const { meetingApiService } = await import('./api/meeting.api')
    return meetingApiService.createMeeting(meetingData)
  },

  async createMeetingFromRequest(request: any) {
    const { meetingApiService } = await import('./api/meeting.api')
    return meetingApiService.createMeetingFromRequest(request)
  },

  async updateMeeting(id: string, updates: any) {
    const { meetingApiService } = await import('./api/meeting.api')
    return meetingApiService.updateMeeting(id, updates)
  },

  async deleteMeeting(id: string) {
    const { meetingApiService } = await import('./api/meeting.api')
    return meetingApiService.deleteMeeting(id)
  },

  async batchUpdateMeetings(ids: string[], updates: any) {
    const { meetingApiService } = await import('./api/meeting.api')
    return meetingApiService.batchUpdateMeetings(ids, updates)
  },

  // 草稿会议相关
  async createDraftMeeting() {
    const { meetingApiService } = await import('./api/meeting.api')
    return meetingApiService.createDraftMeeting()
  },

  async saveDraftMeeting(meetingId: string, meetingData: any) {
    const { meetingApiService } = await import('./api/meeting.api')
    return meetingApiService.saveDraftMeeting(meetingId, meetingData)
  },

  async submitDraftMeeting(meetingId: string, meetingData: any) {
    const { meetingApiService } = await import('./api/meeting.api')
    return meetingApiService.submitDraftMeeting(meetingId, meetingData)
  },

  // 文件管理相关
  async uploadMeetingFile(meetingId: string, file: File, agendaId?: string) {
    const { meetingApiService } = await import('./api/meeting.api')
    return meetingApiService.uploadMeetingFile(meetingId, file, agendaId)
  },

  async getMeetingFiles(meetingId: string) {
    const { meetingApiService } = await import('./api/meeting.api')
    return meetingApiService.getMeetingFiles(meetingId)
  },

  async deleteMeetingFile(meetingId: string, fileId: string) {
    const { meetingApiService } = await import('./api/meeting.api')
    return meetingApiService.deleteMeetingFile(meetingId, fileId)
  }
}

export const permissionApi = {
  async getAllPermissions() {
    const { permissionApiService } = await import('./api/user.api')
    return permissionApiService.getAllPermissions()
  },

  async getAllRoles() {
    const { permissionApiService } = await import('./api/user.api')
    return permissionApiService.getAllRoles()
  },

  async getUserMenuConfig(user: any) {
    const { permissionApiService } = await import('./api/user.api')
    return permissionApiService.getUserMenuConfig(user)
  },

  async checkUserPermission(userId: string, permission: string) {
    const { permissionApiService } = await import('./api/user.api')
    return permissionApiService.checkUserPermission(userId, permission)
  }
}

// 环境检测和切换逻辑
const shouldUseMock = () => {
  return import.meta.env.VITE_ENABLE_MOCK === 'true' || 
         import.meta.env.NODE_ENV === 'development'
}

// 如果启用Mock模式，则切换到Mock API
if (shouldUseMock()) {
  // 可以在这里做动态导入切换到Mock服务
  console.log('🔧 Using Mock API services')
} else {
  console.log('🌐 Using Real API services')
}
