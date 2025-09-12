/**
 * 数据字典类型定义
 */

import { BaseEntity, EntityStatus, FilterParams } from './api.types'

// 字典项状态
export type DictStatus = EntityStatus

// 字典项
export interface DictItem extends BaseEntity {
  code: string
  name: string
  value: string | number
  status: DictStatus
  sort: number
  remark?: string
}

// 数据字典
export interface DataDict extends BaseEntity {
  dictCode: string
  dictName: string
  dictType: string
  status: DictStatus
  itemCount: number
  remark?: string
  items?: DictItem[]
}

// 字典筛选参数
export interface DictFilters extends FilterParams {
  dictType?: string
  status?: DictStatus
}

// 创建字典请求
export interface CreateDictRequest {
  dictCode: string
  dictName: string
  dictType: string
  status: DictStatus
  remark?: string
  items: Omit<DictItem, keyof BaseEntity>[]
}

// 更新字典请求
export interface UpdateDictRequest extends Partial<CreateDictRequest> {
  id: string
}

// 字典项创建请求
export interface CreateDictItemRequest {
  code: string
  name: string
  value: string | number
  status: DictStatus
  sort: number
  remark?: string
}

// 字典项更新请求
export interface UpdateDictItemRequest extends Partial<CreateDictItemRequest> {
  id: string
}

// 字典同步请求
export interface DictSyncRequest {
  dictIds: string[]
  deviceIds?: string[]
  force?: boolean
}

// 字典同步状态
export type SyncStatus = 'pending' | 'syncing' | 'completed' | 'failed'

// 字典同步结果
export interface DictSyncResult {
  dictId: string
  dictName: string
  status: SyncStatus
  syncedAt?: string
  error?: string
  deviceResults?: Array<{
    deviceId: string
    deviceName: string
    status: SyncStatus
    error?: string
  }>
}

// 字典导出配置
export interface DictExportConfig {
  dictIds?: string[]
  includeItems: boolean
  format: 'json' | 'excel' | 'csv'
  encoding?: 'utf8' | 'gbk'
}

// 字典导入结果
export interface DictImportResult {
  total: number
  created: number
  updated: number
  failed: number
  errors: Array<{
    row: number
    dictCode?: string
    field?: string
    message: string
  }>
}

// 字典统计信息
export interface DictStats {
  totalDicts: number
  enabledDicts: number
  disabledDicts: number
  totalItems: number
  dictTypeStats: Array<{
    type: string
    count: number
  }>
  recentUpdates: Array<{
    dictId: string
    dictName: string
    updatedAt: string
    operation: 'created' | 'updated' | 'deleted'
  }>
}

// 字典类型配置
export interface DictTypeConfig {
  type: string
  name: string
  description?: string
  icon?: string
  color?: string
  allowedValueTypes: Array<'string' | 'number' | 'boolean'>
  defaultStatus: DictStatus
  sortable: boolean
}

// 字典验证规则
export interface DictValidationRule {
  dictCode: {
    pattern: RegExp
    message: string
  }
  itemCode: {
    pattern: RegExp
    message: string
  }
  duplicateCheck: boolean
  valueTypeValidation: boolean
}
