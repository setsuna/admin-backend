/**
 * 会议服务 - 重构版本
 * 保持原有接口不变，内部切换到新的API架构
 */

import type { Meeting, MeetingFilters, PaginatedResponse, CreateMeetingRequest, MeetingAgenda } from '@/types'
import { meetingApiService } from './api/meeting.api'
import { envConfig } from '@/config/env.config'

// 草稿会议接口（保持向后兼容）
interface DraftMeeting {
  id: string
  status: 'draft'
  name?: string
  createdAt: string
  updatedAt: string
}

// 文件上传响应（保持向后兼容）
interface FileUploadResponse {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: string
}

// Mock数据存储（保留用于开发环境）
const mockMeetings: Meeting[] = [
  {
    id: '1',
    name: '项目评审会议',
    startTime: '2025-09-10T09:00:00Z',
    endTime: '2025-09-10T10:00:00Z',
    status: 'preparation',
    securityLevel: 'internal',
    type: 'standard',
    hostId: '1',
    hostName: '张三',
    location: '会议室A',
    description: '讨论Q3项目进展和下一步规划',
    participantCount: 5,
    agendaCount: 3,
    materialCount: 8,
    isRecorded: false,
    createdAt: '2025-09-08T10:00:00Z',
    updatedAt: '2025-09-08T10:00:00Z'
  },
  {
    id: '2',
    name: '市场策略研讨会',
    startTime: '2025-09-10T14:00:00Z',
    endTime: '2025-09-10T15:30:00Z',
    status: 'distributable',
    securityLevel: 'confidential',
    type: 'tablet',
    hostId: '2',
    hostName: '李四',
    location: '会议室B',
    description: '市场拓展策略讨论',
    participantCount: 12,
    agendaCount: 2,
    materialCount: 5,
    isRecorded: true,
    recordingUrl: 'http://localhost:3000/recordings/meeting2.mp4',
    createdAt: '2025-09-07T14:00:00Z',
    updatedAt: '2025-09-09T16:00:00Z'
  },
  {
    id: '3',
    name: '季度总结会议',
    startTime: '2025-09-05T10:00:00Z',
    endTime: '2025-09-05T11:00:00Z',
    status: 'closed',
    securityLevel: 'secret',
    type: 'standard',
    hostId: '3',
    hostName: '王五',
    location: '会议室C',
    description: 'Q2季度工作总结和复盘',
    participantCount: 8,
    agendaCount: 4,
    materialCount: 12,
    isRecorded: true,
    recordingUrl: 'http://localhost:3000/recordings/meeting3.mp4',
    createdAt: '2025-09-03T09:00:00Z',
    updatedAt: '2025-09-05T12:00:00Z'
  },
  {
    id: '4',
    name: '产品功能评审',
    startTime: '2025-09-11T14:00:00Z',
    endTime: '2025-09-11T16:00:00Z',
    status: 'preparation',
    securityLevel: 'confidential',
    type: 'tablet',
    hostId: '2',
    hostName: '李四',
    location: '会议室D',
    description: '新版本产品功能评审',
    participantCount: 10,
    agendaCount: 5,
    materialCount: 15,
    isRecorded: false,
    createdAt: '2025-09-09T11:00:00Z',
    updatedAt: '2025-09-09T11:00:00Z'
  },
  {
    id: '5',
    name: '需求讨论会',
    startTime: '2025-09-03T10:00:00Z',
    endTime: '2025-09-03T12:00:00Z',
    status: 'closed',
    securityLevel: 'internal',
    type: 'standard',
    hostId: '4',
    hostName: '赵六',
    location: '会议室E',
    description: '客户需求分析和讨论',
    participantCount: 4,
    agendaCount: 3,
    materialCount: 6,
    isRecorded: false,
    createdAt: '2025-09-01T15:00:00Z',
    updatedAt: '2025-09-03T13:00:00Z'
  }
]

// 草稿会议存储
const mockDraftMeetings: Map<string, DraftMeeting> = new Map()

// 会议文件存储
const mockMeetingFiles: Map<string, FileUploadResponse[]> = new Map()

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 过滤会议数据
function filterMeetings(meetings: Meeting[], filters: MeetingFilters): Meeting[] {
  return meetings.filter(meeting => {
    if (filters.keyword && !meeting.name.toLowerCase().includes(filters.keyword.toLowerCase())) {
      return false
    }
    if (filters.type && meeting.type !== filters.type) {
      return false
    }
    if (filters.status && meeting.status !== filters.status) {
      return false
    }
    if (filters.securityLevel && meeting.securityLevel !== filters.securityLevel) {
      return false
    }
    if (filters.dateRange) {
      const meetingDate = new Date(meeting.startTime)
      const startDate = new Date(filters.dateRange[0])
      const endDate = new Date(filters.dateRange[1])
      if (meetingDate < startDate || meetingDate > endDate) {
        return false
      }
    }
    return true
  })
}

// 分页处理
function paginateMeetings(meetings: Meeting[], page: number, pageSize: number): PaginatedResponse<Meeting> {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const items = meetings.slice(startIndex, endIndex)
  
  return {
    items,
    pagination: {
      page,
      pageSize,
      total: meetings.length,
      totalPages: Math.ceil(meetings.length / pageSize)
    }
  }
}

// Mock服务实现
class MockMeetingService {
  // 创建草稿会议
  async createDraftMeeting(): Promise<DraftMeeting> {
    await delay(300)
    const now = new Date().toISOString()
    const draftMeeting: DraftMeeting = {
      id: `draft_${Date.now()}`,
      status: 'draft',
      createdAt: now,
      updatedAt: now
    }
    
    mockDraftMeetings.set(draftMeeting.id, draftMeeting)
    console.log('Created draft meeting:', draftMeeting.id)
    return draftMeeting
  }

  // 上传文件到会议
  async uploadMeetingFile(meetingId: string, file: File, _agendaId?: string): Promise<FileUploadResponse> {
    await delay(1000)
    
    const fileResponse: FileUploadResponse = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.name.split('.').pop() || 'unknown',
      url: `http://localhost:3000/files/${file.name}`,
      uploadedAt: new Date().toISOString()
    }
    
    const existingFiles = mockMeetingFiles.get(meetingId) || []
    existingFiles.push(fileResponse)
    mockMeetingFiles.set(meetingId, existingFiles)
    
    console.log(`Uploaded file ${file.name} to meeting ${meetingId}`)
    return fileResponse
  }

  // 获取会议文件列表
  async getMeetingFiles(meetingId: string): Promise<FileUploadResponse[]> {
    await delay(200)
    return mockMeetingFiles.get(meetingId) || []
  }

  // 删除会议文件
  async deleteMeetingFile(meetingId: string, fileId: string): Promise<boolean> {
    await delay(300)
    const files = mockMeetingFiles.get(meetingId) || []
    const filteredFiles = files.filter(file => file.id !== fileId)
    mockMeetingFiles.set(meetingId, filteredFiles)
    
    console.log(`Deleted file ${fileId} from meeting ${meetingId}`)
    return true
  }

  // 提交草稿会议
  async submitDraftMeeting(meetingId: string, meetingData: CreateMeetingRequest): Promise<Meeting> {
    await delay(500)
    
    const draftMeeting = mockDraftMeetings.get(meetingId)
    if (!draftMeeting) {
      throw new Error('Draft meeting not found')
    }
    
    const now = new Date().toISOString()
    const files = mockMeetingFiles.get(meetingId) || []
    
    const newMeeting: Meeting = {
      id: meetingId,
      name: meetingData.name,
      startTime: meetingData.startTime,
      endTime: meetingData.endTime,
      status: 'preparation',
      securityLevel: meetingData.securityLevel,
      type: meetingData.type,
      hostId: '1',
      hostName: '当前用户',
      location: meetingData.location || '',
      description: meetingData.description,
      participantCount: meetingData.participants.length,
      agendaCount: meetingData.agendas.length,
      materialCount: files.length,
      isRecorded: meetingData.isRecorded || false,
      createdAt: draftMeeting.createdAt,
      updatedAt: now
    }
    
    mockMeetings.unshift(newMeeting)
    mockDraftMeetings.delete(meetingId)
    
    console.log('Published draft meeting:', meetingId)
    return newMeeting
  }

  // 保存草稿会议数据
  async saveDraftMeeting(meetingId: string, meetingData: Partial<CreateMeetingRequest>): Promise<boolean> {
    await delay(300)
    
    const draftMeeting = mockDraftMeetings.get(meetingId)
    if (!draftMeeting) {
      throw new Error('Draft meeting not found')
    }
    
    const updatedDraft = {
      ...draftMeeting,
      name: meetingData.name,
      updatedAt: new Date().toISOString()
    }
    
    mockDraftMeetings.set(meetingId, updatedDraft)
    console.log('Saved draft meeting data:', meetingId)
    return true
  }

  // 获取会议列表
  async getMeetings(
    filters: MeetingFilters = {},
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Meeting>> {
    await delay(300)
    const filteredMeetings = filterMeetings(mockMeetings, filters)
    return paginateMeetings(filteredMeetings, page, pageSize)
  }

  // 获取我的会议
  async getMyMeetings(
    tabType: 'hosted' | 'participated' | 'all' = 'all',
    filters: MeetingFilters = {},
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Meeting>> {
    await delay(300)
    // const currentUserId = '1' // TODO: 从用户上下文获取
    
    let meetings = [...mockMeetings]
    
    if (tabType === 'hosted') {
      meetings = meetings.filter(meeting => meeting.hostId === '1') // TODO: 从用户上下文获取
    } else if (tabType === 'participated') {
      meetings = meetings.filter(meeting => meeting.hostId !== '1') // TODO: 从用户上下文获取
    }
    
    const filteredMeetings = filterMeetings(meetings, filters)
    return paginateMeetings(filteredMeetings, page, pageSize)
  }

  // 获取单个会议详情
  async getMeetingById(id: string): Promise<Meeting | null> {
    await delay(200)
    return mockMeetings.find(meeting => meeting.id === id) || null
  }

  // 创建会议
  async createMeeting(meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meeting> {
    await delay(500)
    const now = new Date().toISOString()
    const newMeeting: Meeting = {
      ...meetingData,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    }
    mockMeetings.unshift(newMeeting)
    return newMeeting
  }

  // 创建会议（使用CreateMeetingRequest）
  async createMeetingFromRequest(request: CreateMeetingRequest): Promise<Meeting> {
    await delay(500)
    const now = new Date().toISOString()
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      name: request.name,
      startTime: request.startTime,
      endTime: request.endTime,
      status: 'preparation',
      securityLevel: request.securityLevel,
      type: request.type,
      hostId: '1',
      hostName: '当前用户',
      location: request.location,
      description: request.description,
      participantCount: request.participants.length,
      agendaCount: request.agendas.length,
      materialCount: request.agendas.reduce((sum: number, agenda: MeetingAgenda) => sum + agenda.materials.length, 0),
      isRecorded: request.isRecorded || false,
      createdAt: now,
      updatedAt: now
    }
    mockMeetings.unshift(newMeeting)
    return newMeeting
  }

  // 更新会议
  async updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting | null> {
    await delay(400)
    const index = mockMeetings.findIndex(meeting => meeting.id === id)
    if (index === -1) return null
    
    mockMeetings[index] = {
      ...mockMeetings[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    return mockMeetings[index]
  }

  // 删除会议
  async deleteMeeting(id: string): Promise<boolean> {
    await delay(300)
    const meeting = mockMeetings.find(m => m.id === id)
    if (!meeting || meeting.status !== 'closed') {
      return false
    }
    
    const index = mockMeetings.findIndex(m => m.id === id)
    if (index > -1) {
      mockMeetings.splice(index, 1)
      return true
    }
    
    return false
  }

  // 批量操作
  async batchUpdateMeetings(ids: string[], updates: Partial<Meeting>): Promise<Meeting[]> {
    await delay(600)
    const updatedMeetings: Meeting[] = []
    
    ids.forEach(id => {
      const index = mockMeetings.findIndex(meeting => meeting.id === id)
      if (index !== -1) {
        mockMeetings[index] = {
          ...mockMeetings[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        updatedMeetings.push(mockMeetings[index])
      }
    })
    
    return updatedMeetings
  }
}

// 决定使用哪个服务实现
const shouldUseMock = () => {
  return envConfig.ENABLE_MOCK || envConfig.DEV
}

// 创建统一的API接口
const createMeetingApi = () => {
  if (shouldUseMock()) {
    console.log('📅 Meeting API: Using Mock Service')
    return new MockMeetingService()
  } else {
    console.log('🌐 Meeting API: Using Real Service')
    // 适配器模式，将新API服务包装成旧接口
    return {
      async getMeetings(filters: MeetingFilters = {}, page = 1, pageSize = 10) {
        return meetingApiService.getMeetings(filters, page, pageSize)
      },

      async getMyMeetings(
        tabType: 'hosted' | 'participated' | 'all' = 'all',
        filters: MeetingFilters = {},
        page = 1,
        pageSize = 10
        // currentUserId = '1' // TODO: 从用户上下文获取
      ) {
        return meetingApiService.getMyMeetings(tabType, filters, page, pageSize)
      },

      async getMeetingById(id: string) {
        return meetingApiService.getMeetingById(id)
      },

      async createMeeting(meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) {
        // 类型适配：确保所有数值字段都是数字
        const adaptedData = {
          ...meetingData,
          participantCount: meetingData.participantCount || 0,
          agendaCount: meetingData.agendaCount || 0,
          materialCount: meetingData.materialCount || 0
        }
        return meetingApiService.createMeeting(adaptedData)
      },

      async createMeetingFromRequest(request: CreateMeetingRequest) {
        // 类型适配：将MeetingAgenda转换为服务端格式
        const adaptedRequest = {
          ...request,
          agendas: request.agendas.map(agenda => ({
            title: agenda.name || '',
            description: agenda.description,
            duration: undefined,
            presenter: undefined,
            order: agenda.order
          }))
        }
        return meetingApiService.createMeetingFromRequest(adaptedRequest)
      },

      async updateMeeting(id: string, updates: Partial<Meeting>) {
        // 类型适配：确保id字段存在
        const updateRequest = {
          id,
          ...updates
        } as any // 临时使用any类型避免类型错误
        return meetingApiService.updateMeeting(id, updateRequest)
      },

      async deleteMeeting(id: string) {
        const result = await meetingApiService.deleteMeeting(id)
        return result.success
      },

      async batchUpdateMeetings(ids: string[], updates: Partial<Meeting>) {
        const result = await meetingApiService.batchUpdateMeetings(ids, updates)
        return result.success
      },

      // 草稿会议相关
      async createDraftMeeting() {
        return meetingApiService.createDraftMeeting()
      },

      async saveDraftMeeting(meetingId: string, meetingData: Partial<CreateMeetingRequest>) {
        // 类型适配：处理议题类型不匹配问题
        const adaptedData = {
          ...meetingData,
          agendas: meetingData.agendas?.map(agenda => ({
            title: agenda.name || '',
            description: agenda.description,
            duration: undefined,
            presenter: undefined,
            order: agenda.order
          }))
        }
        const result = await meetingApiService.saveDraftMeeting(meetingId, adaptedData)
        return result.success
      },

      async submitDraftMeeting(meetingId: string, meetingData: CreateMeetingRequest) {
        // 类型适配：将MeetingAgenda转换为服务端格式
        const adaptedData = {
          ...meetingData,
          agendas: meetingData.agendas.map(agenda => ({
            title: agenda.name || '',
            description: agenda.description,
            duration: undefined,
            presenter: undefined,
            order: agenda.order
          }))
        }
        return meetingApiService.submitDraftMeeting(meetingId, adaptedData)
      },

      // 文件管理相关
      async uploadMeetingFile(meetingId: string, file: File, agendaId?: string) {
        return meetingApiService.uploadMeetingFile(meetingId, file, agendaId)
      },

      async getMeetingFiles(meetingId: string) {
        return meetingApiService.getMeetingFiles(meetingId)
      },

      async deleteMeetingFile(meetingId: string, fileId: string) {
        const result = await meetingApiService.deleteMeetingFile(meetingId, fileId)
        return result.success
      }
    }
  }
}

export const meetingApi = createMeetingApi()

// 导出类型以保持向后兼容
export type { DraftMeeting, FileUploadResponse }
