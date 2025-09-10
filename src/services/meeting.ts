import type { Meeting, MeetingFilters, PaginatedResponse, CreateMeetingRequest, MeetingAgenda } from '@/types'

// Mock数据 - 后续替换为真实API
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
    createdAt: '2025-09-01T15:00:00Z',
    updatedAt: '2025-09-03T13:00:00Z'
  }
]

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

export const meetingApi = {
  // 获取会议列表
  async getMeetings(
    filters: MeetingFilters = {},
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Meeting>> {
    await delay(300)
    const filteredMeetings = filterMeetings(mockMeetings, filters)
    return paginateMeetings(filteredMeetings, page, pageSize)
  },

  // 获取我的会议
  async getMyMeetings(
    tabType: 'hosted' | 'participated' | 'all' = 'all',
    filters: MeetingFilters = {},
    page: number = 1,
    pageSize: number = 10,
    currentUserId: string = '1'
  ): Promise<PaginatedResponse<Meeting>> {
    await delay(300)
    
    let meetings = [...mockMeetings]
    
    // 根据标签页过滤
    if (tabType === 'hosted') {
      meetings = meetings.filter(meeting => meeting.hostId === currentUserId)
    } else if (tabType === 'participated') {
      // 这里应该根据参会人员信息过滤，暂时mock处理
      meetings = meetings.filter(meeting => meeting.hostId !== currentUserId)
    }
    
    const filteredMeetings = filterMeetings(meetings, filters)
    return paginateMeetings(filteredMeetings, page, pageSize)
  },

  // 获取单个会议详情
  async getMeetingById(id: string): Promise<Meeting | null> {
    await delay(200)
    return mockMeetings.find(meeting => meeting.id === id) || null
  },

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
  },

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
      hostId: '1', // 当前用户ID
      hostName: '当前用户', // 当前用户名
      location: request.location,
      description: request.description,
      participantCount: request.participants.length,
      agendaCount: request.agendas.length,
      materialCount: request.agendas.reduce((sum: number, agenda: MeetingAgenda) => sum + agenda.materials.length, 0),
      createdAt: now,
      updatedAt: now
    }
    mockMeetings.unshift(newMeeting)
    return newMeeting
  },

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
  },

  // 删除会议（仅关闭状态可删除）
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
  },

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
