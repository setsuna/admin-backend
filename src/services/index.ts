/**
 * 服务层统一导出
 * 重构后的简洁架构，移除Mock和懒加载复杂逻辑
 */

// ========================================
// 核心服务导出
// ========================================
export { httpClient } from './core/http.client'

// 延迟导入其他核心服务，避免初始化问题
export * from './core/auth.service'
export * from './core/error.handler'

// ========================================
// API服务导出 (services/api/*.ts)
// ========================================
export { dictApiService } from './api/dict.api'
export { meetingApiService } from './api/meeting.api'
export { userApiService, permissionApiService } from './api/user.api'
export { policyApi } from './api/policy.api'
export { departmentApiService } from './api/department.api'

// ========================================
// 业务服务导出 (services/*.ts)
// ========================================
export { departmentService } from './department'
export { userService } from './user'
export { policyService } from './policy'
export { dictService } from './dict'
export { meetingService } from './meeting'
export { permissionService } from './permission'
export { deviceService } from './device'
export { websocketService } from './websocket'

// ========================================
// 类型导出
// ========================================
export type * from './types/api.types'
export type * from './types/dict.types'  
export type * from './types/meeting.types'
export type * from '../types'

// ========================================
// 兼容性API接口 - 简化版本
// ========================================

// 字典API兼容接口
export const dictApi = {
  async getDictionaries(filters = {}, page = 1, pageSize = 20) {
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

// 会议API兼容接口
export const meetingApi = {
  async getMeetings(filters = {}, page = 1, pageSize = 10) {
    const { meetingApiService } = await import('./api/meeting.api')
    return meetingApiService.getMeetings(filters, page, pageSize)
  },
  
  async getMyMeetings(tabType: 'hosted' | 'participated' | 'all' = 'all', filters = {}, page = 1, pageSize = 10) {
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
  
  async updateMeeting(id: string, updates: any) {
    const { meetingApiService } = await import('./api/meeting.api')
    return meetingApiService.updateMeeting(id, updates)
  },
  
  async deleteMeeting(id: string) {
    const { meetingApiService } = await import('./api/meeting.api')
    return meetingApiService.deleteMeeting(id)
  }
}

// 权限API兼容接口
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
