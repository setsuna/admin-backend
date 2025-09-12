/**
 * 数据字典服务 - 重构版本
 * 保持原有接口不变，内部切换到新的API架构
 */

import type { 
  DataDict, 
  DictItem,
  DictFilters, 
  CreateDictRequest,
  UpdateDictRequest,
  PaginatedResponse 
} from '@/types'

// 导入新的API服务
import { dictApiService } from './api/dict.api'
import { envConfig } from '@/config/env.config'

// Mock数据（保留用于开发环境）
const mockDictItems: Record<string, DictItem[]> = {
  'DEVICE_TYPE': [
    { id: '1', code: 'TABLET', name: '平板设备', value: 1, status: 'enabled', sort: 1, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '2', code: 'PHONE', name: '手机设备', value: 2, status: 'enabled', sort: 2, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '3', code: 'PC', name: '电脑设备', value: 3, status: 'enabled', sort: 3, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '4', code: 'TV', name: '电视设备', value: 4, status: 'enabled', sort: 4, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '5', code: 'PROJECTOR', name: '投影设备', value: 5, status: 'disabled', sort: 5, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  ],
  'MEETING_STATUS': [
    { id: '6', code: 'PREPARATION', name: '准备中', value: 'preparation', status: 'enabled', sort: 1, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '7', code: 'DISTRIBUTABLE', name: '可下发', value: 'distributable', status: 'enabled', sort: 2, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '8', code: 'IN_PROGRESS', name: '进行中', value: 'in_progress', status: 'enabled', sort: 3, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '9', code: 'CLOSED', name: '已关闭', value: 'closed', status: 'enabled', sort: 4, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  ],
  'ROOM_TYPE': [
    { id: '10', code: 'CONFERENCE_ROOM', name: '会议室', value: 1, status: 'enabled', sort: 1, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '11', code: 'BOARD_ROOM', name: '董事会议室', value: 2, status: 'enabled', sort: 2, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '12', code: 'TRAINING_ROOM', name: '培训室', value: 3, status: 'disabled', sort: 3, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '13', code: 'AUDITORIUM', name: '礼堂', value: 4, status: 'enabled', sort: 4, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '14', code: 'VIDEO_ROOM', name: '视频会议室', value: 5, status: 'enabled', sort: 5, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '15', code: 'BREAK_ROOM', name: '茶歇室', value: 6, status: 'enabled', sort: 6, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '16', code: 'PHONE_BOOTH', name: '电话亭', value: 7, status: 'enabled', sort: 7, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '17', code: 'OUTDOOR_SPACE', name: '户外场地', value: 8, status: 'enabled', sort: 8, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  ],
  'FILE_FORMAT': [
    { id: '18', code: 'PDF', name: 'PDF文档', value: 'pdf', status: 'enabled', sort: 1, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '19', code: 'DOCX', name: 'Word文档', value: 'docx', status: 'enabled', sort: 2, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '20', code: 'PPTX', name: 'PowerPoint演示文稿', value: 'pptx', status: 'enabled', sort: 3, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '21', code: 'XLSX', name: 'Excel表格', value: 'xlsx', status: 'enabled', sort: 4, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '22', code: 'TXT', name: '文本文件', value: 'txt', status: 'enabled', sort: 5, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '23', code: 'JPG', name: 'JPEG图片', value: 'jpg', status: 'enabled', sort: 6, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '24', code: 'PNG', name: 'PNG图片', value: 'png', status: 'enabled', sort: 7, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '25', code: 'MP4', name: 'MP4视频', value: 'mp4', status: 'enabled', sort: 8, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '26', code: 'AVI', name: 'AVI视频', value: 'avi', status: 'disabled', sort: 9, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '27', code: 'MP3', name: 'MP3音频', value: 'mp3', status: 'enabled', sort: 10, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '28', code: 'WAV', name: 'WAV音频', value: 'wav', status: 'enabled', sort: 11, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '29', code: 'ZIP', name: 'ZIP压缩包', value: 'zip', status: 'enabled', sort: 12, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  ],
  'USER_ROLE': [
    { id: '30', code: 'ADMIN', name: '系统管理员', value: 'admin', status: 'enabled', sort: 1, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '31', code: 'MEETING_ADMIN', name: '会议管理员', value: 'meeting_admin', status: 'enabled', sort: 2, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '32', code: 'AUDITOR', name: '审计员', value: 'auditor', status: 'enabled', sort: 3, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '33', code: 'USER', name: '普通用户', value: 'user', status: 'enabled', sort: 4, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '34', code: 'GUEST', name: '访客用户', value: 'guest', status: 'disabled', sort: 5, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '35', code: 'VIP', name: 'VIP用户', value: 'vip', status: 'enabled', sort: 6, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  ]
}

const mockDataDicts: DataDict[] = [
  {
    id: '1',
    dictCode: 'DEVICE_TYPE',
    dictName: '设备类型',
    dictType: 'device',
    status: 'enabled',
    itemCount: 5,
    remark: '会议平板设备类型分类',
    items: mockDictItems['DEVICE_TYPE'],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    dictCode: 'MEETING_STATUS',
    dictName: '会议状态',
    dictType: 'meeting',
    status: 'enabled',
    itemCount: 4,
    remark: '会议流程状态定义',
    items: mockDictItems['MEETING_STATUS'],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '3',
    dictCode: 'ROOM_TYPE',
    dictName: '会议室类型',
    dictType: 'room',
    status: 'disabled',
    itemCount: 8,
    remark: '会议室场地类型分类',
    items: mockDictItems['ROOM_TYPE'],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '4',
    dictCode: 'FILE_FORMAT',
    dictName: '文件格式',
    dictType: 'file',
    status: 'enabled',
    itemCount: 12,
    remark: '支持的文件格式类型',
    items: mockDictItems['FILE_FORMAT'],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '5',
    dictCode: 'USER_ROLE',
    dictName: '用户角色',
    dictType: 'user',
    status: 'enabled',
    itemCount: 6,
    remark: '系统用户角色权限定义',
    items: mockDictItems['USER_ROLE'],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  }
]

// 模拟网络延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock服务实现
class MockDictService {
  async getDictionaries(
    filters: DictFilters = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<DataDict>> {
    await delay(300)
    
    let filteredData = [...mockDataDicts]
    
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      filteredData = filteredData.filter(dict =>
        dict.dictName.toLowerCase().includes(keyword) ||
        dict.dictCode.toLowerCase().includes(keyword)
      )
    }
    
    if (filters.dictType) {
      filteredData = filteredData.filter(dict => dict.dictType === filters.dictType)
    }
    
    if (filters.status) {
      filteredData = filteredData.filter(dict => dict.status === filters.status)
    }
    
    const total = filteredData.length
    const start = (page - 1) * pageSize
    const items = filteredData.slice(start, start + pageSize)
      .map(dict => ({
        ...dict,
        items: dict.items || []
      }))
    
    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }

  async getDictionary(id: string): Promise<DataDict | null> {
    await delay(200)
    const found = mockDataDicts.find(dict => dict.id === id)
    if (!found) return null
    
    return {
      ...found,
      items: found.items || []
    }
  }

  async createDictionary(data: CreateDictRequest): Promise<DataDict> {
    await delay(500)
    
    const now = new Date().toISOString()
    const newDict: DataDict = {
      id: Date.now().toString(),
      dictCode: data.dictCode,
      dictName: data.dictName,
      dictType: data.dictType,
      status: data.status,
      itemCount: data.items.length,
      remark: data.remark,
      items: data.items.map((item, index) => ({
        ...item,
        id: `${Date.now()}_${index}`,
        createdAt: now,
        updatedAt: now,
      })),
      createdAt: now,
      updatedAt: now,
    }
    
    mockDataDicts.push(newDict)
    return newDict
  }

  async updateDictionary(id: string, data: Partial<UpdateDictRequest>): Promise<DataDict | null> {
    await delay(500)
    
    const dictIndex = mockDataDicts.findIndex(dict => dict.id === id)
    if (dictIndex === -1) return null
    
    const now = new Date().toISOString()
    const updatedDict = {
      ...mockDataDicts[dictIndex],
      ...data,
      id,
      updatedAt: now,
    }
    
    if (data.items) {
      updatedDict.items = data.items.map((item, index) => ({
        ...item,
        id: item.id || `${Date.now()}_${index}`,
        createdAt: item.createdAt || now,
        updatedAt: now,
      }))
      updatedDict.itemCount = data.items.length
    }
    
    mockDataDicts[dictIndex] = updatedDict
    return updatedDict
  }

  async deleteDictionary(id: string): Promise<boolean> {
    await delay(300)
    
    const dictIndex = mockDataDicts.findIndex(dict => dict.id === id)
    if (dictIndex === -1) return false
    
    mockDataDicts.splice(dictIndex, 1)
    return true
  }

  async deleteDictionaries(ids: string[]): Promise<boolean> {
    await delay(500)
    
    for (const id of ids) {
      const dictIndex = mockDataDicts.findIndex(dict => dict.id === id)
      if (dictIndex !== -1) {
        mockDataDicts.splice(dictIndex, 1)
      }
    }
    return true
  }

  async updateDictionaryStatus(id: string, status: 'enabled' | 'disabled'): Promise<boolean> {
    await delay(300)
    
    const dict = mockDataDicts.find(dict => dict.id === id)
    if (!dict) return false
    
    dict.status = status
    dict.updatedAt = new Date().toISOString()
    return true
  }

  async getDictTypes(): Promise<{ label: string; value: string }[]> {
    await delay(100)
    
    const types = new Set(mockDataDicts.map(dict => dict.dictType))
    return Array.from(types).map(type => ({
      label: type,
      value: type
    }))
  }

  async syncToDevices(dictIds: string[]): Promise<boolean> {
    await delay(1000)
    console.log('Mock: Syncing dictionaries to devices:', dictIds)
    return true
  }

  async exportDictionaries(dictIds?: string[]): Promise<Blob> {
    await delay(500)
    
    const dataToExport = dictIds 
      ? mockDataDicts.filter(dict => dictIds.includes(dict.id))
      : mockDataDicts
    
    const exportData = {
      exportTime: new Date().toISOString(),
      count: dataToExport.length,
      data: dataToExport
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    
    return blob
  }
}

// 决定使用哪个服务实现
const shouldUseMock = () => {
  return envConfig.ENABLE_MOCK || envConfig.DEV
}

// 创建统一的API接口
const createDictApi = () => {
  if (shouldUseMock()) {
    console.log('📝 Dict API: Using Mock Service')
    return new MockDictService()
  } else {
    console.log('🌐 Dict API: Using Real Service')
    // 适配器模式，将新API服务包装成旧接口
    return {
      async getDictionaries(filters: DictFilters = {}, page = 1, pageSize = 20) {
        return dictApiService.getDictionaries(filters, page, pageSize)
      },

      async getDictionary(id: string) {
        return dictApiService.getDictionary(id)
      },

      async createDictionary(data: CreateDictRequest) {
        return dictApiService.createDictionary(data)
      },

      async updateDictionary(id: string, data: Partial<UpdateDictRequest>) {
        return dictApiService.updateDictionary(id, data)
      },

      async deleteDictionary(id: string) {
        const result = await dictApiService.deleteDictionary(id)
        return result.success
      },

      async deleteDictionaries(ids: string[]) {
        const result = await dictApiService.deleteDictionaries(ids)
        return result.successCount === ids.length
      },

      async updateDictionaryStatus(id: string, status: 'enabled' | 'disabled') {
        const result = await dictApiService.updateDictionaryStatus(id, status)
        return result.success
      },

      async getDictTypes() {
        return dictApiService.getDictTypes()
      },

      async syncToDevices(dictIds: string[]) {
        return dictApiService.syncToDevices(dictIds)
      },

      async exportDictionaries(dictIds?: string[]) {
        return dictApiService.exportDictionaries(dictIds)
      }
    }
  }
}

export const dictApi = createDictApi()
