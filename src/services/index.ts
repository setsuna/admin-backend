/**
 * 服务层统一导出
 * 重构后的简洁架构，移除Mock和懒加载复杂逻辑
 */

// ========================================
// 核心服务导出
// ========================================
export { httpClient } from './core/http.client'
export { authService, auth } from './core/auth.service' 
export { errorHandler, retryManager } from './core/error.handler'

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
// API服务导出 (services/api/*.ts)
// ========================================
export { dictApiService } from './api/dict.api'
export { meetingApiService } from './api/meeting.api'
export { userApiService, permissionApiService } from './api/user.api'

// ========================================
// 类型导出
// ========================================
export type * from './types/api.types'
export type * from './types/dict.types'
export type * from './types/meeting.types'
export type * from '../types'

// ========================================
// 统一API接口 (兼容性导出)
// ========================================

// 字典API - 直接导出，无需懒加载
export const dictApi = {
  getDictionaries: dictApiService.getDictionaries.bind(dictApiService),
  getDictionary: dictApiService.getDictionary.bind(dictApiService),
  createDictionary: dictApiService.createDictionary.bind(dictApiService),
  updateDictionary: dictApiService.updateDictionary.bind(dictApiService),
  deleteDictionary: dictApiService.deleteDictionary.bind(dictApiService),
  deleteDictionaries: dictApiService.deleteDictionaries.bind(dictApiService),
  updateDictionaryStatus: dictApiService.updateDictionaryStatus.bind(dictApiService),
  getDictTypes: dictApiService.getDictTypes.bind(dictApiService),
  syncToDevices: dictApiService.syncToDevices.bind(dictApiService),
  exportDictionaries: dictApiService.exportDictionaries.bind(dictApiService)
}

// 会议API - 直接导出，无需懒加载
export const meetingApi = {
  getMeetings: meetingApiService.getMeetings.bind(meetingApiService),
  getMyMeetings: meetingApiService.getMyMeetings.bind(meetingApiService),
  getMeetingById: meetingApiService.getMeetingById.bind(meetingApiService),
  createMeeting: meetingApiService.createMeeting.bind(meetingApiService),
  createMeetingFromRequest: meetingApiService.createMeetingFromRequest.bind(meetingApiService),
  updateMeeting: meetingApiService.updateMeeting.bind(meetingApiService),
  deleteMeeting: meetingApiService.deleteMeeting.bind(meetingApiService),
  batchUpdateMeetings: meetingApiService.batchUpdateMeetings.bind(meetingApiService),
  
  // 草稿会议相关
  createDraftMeeting: meetingApiService.createDraftMeeting.bind(meetingApiService),
  saveDraftMeeting: meetingApiService.saveDraftMeeting.bind(meetingApiService),
  submitDraftMeeting: meetingApiService.submitDraftMeeting.bind(meetingApiService),
  
  // 文件管理相关
  uploadMeetingFile: meetingApiService.uploadMeetingFile.bind(meetingApiService),
  getMeetingFiles: meetingApiService.getMeetingFiles.bind(meetingApiService),
  deleteMeetingFile: meetingApiService.deleteMeetingFile.bind(meetingApiService)
}

// 权限API - 直接导出，无需懒加载
export const permissionApi = {
  getAllPermissions: permissionApiService.getAllPermissions.bind(permissionApiService),
  getAllRoles: permissionApiService.getAllRoles.bind(permissionApiService),
  getUserMenuConfig: permissionApiService.getUserMenuConfig.bind(permissionApiService),
  checkUserPermission: permissionApiService.checkUserPermission.bind(permissionApiService)
}
