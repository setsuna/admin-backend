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

// 导入Mock数据
import { mockDictItems, mockDataDicts } from './mock/dictData'

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
      const completeItems: DictItem[] = data.items.map((item, index) => ({
        id: `${Date.now()}_${index}`,
        code: item.code,
        name: item.name,
        value: item.value,
        status: item.status,
        sort: item.sort,
        remark: item.remark,
        createdAt: now,
        updatedAt: now,
      }))
      updatedDict.items = completeItems
      updatedDict.itemCount = completeItems.length
    }
    
    const completeDict: DataDict = {
      ...updatedDict,
      items: updatedDict.items as DictItem[] || []
    }
    
    mockDataDicts[dictIndex] = completeDict
    return completeDict
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
