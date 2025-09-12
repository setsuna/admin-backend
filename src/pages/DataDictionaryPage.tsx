import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  RefreshCw, 
  Eye, 
  Edit, 
  Power,
  PowerOff,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DataTable } from '@/components/features/DataTable'
import { Card, CardContent } from '@/components/ui/Card'
import DictEditModal from '@/components/features/DictEditModal'
import { dictApi } from '@/services/dict'
import { debounce } from '@/utils'
import type { 
  DataDict, 
  DictItem, 
  DictFilters, 
  DictStatus, 
  TableColumn,
  CreateDictRequest 
} from '@/types'

const statusConfig = {
  enabled: { label: '启用', color: 'text-green-600', bgColor: 'bg-green-100', icon: Power },
  disabled: { label: '禁用', color: 'text-red-600', bgColor: 'bg-red-100', icon: PowerOff }
}

const DataDictionaryPage: React.FC = () => {
  const [dictionaries, setDictionaries] = useState<DataDict[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<DictStatus | ''>('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [expandedDict, setExpandedDict] = useState<string | null>(null)
  const [dictTypes, setDictTypes] = useState<{ label: string; value: string }[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingDict, setEditingDict] = useState<DataDict | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  })

  // 防抖搜索
  const debouncedSearch = debounce((keyword: string) => {
    setSearchText(keyword)
    setPagination(prev => ({ ...prev, page: 1 }))
  }, 500)

  // 加载数据字典列表
  const loadDictionaries = async () => {
    try {
      setLoading(true)
      const filters: DictFilters = {
        keyword: searchText || undefined,
        dictType: typeFilter || undefined,
        status: statusFilter || undefined
      }
      const response = await dictApi.getDictionaries(filters, pagination.page, pagination.pageSize)
      setDictionaries(response.items)
      setPagination(prev => ({ ...prev, total: response.pagination.total }))
    } catch (error) {
      console.error('Failed to load dictionaries:', error)
      setDictionaries([])
      setPagination(prev => ({ ...prev, total: 0 }))
    } finally {
      setLoading(false)
    }
  }

  // 加载字典类型选项
  const loadDictTypes = async () => {
    try {
      const types = await dictApi.getDictTypes()
      setDictTypes(types)
    } catch (error) {
      console.error('Failed to load dict types:', error)
    }
  }

  // 初始加载
  useEffect(() => {
    loadDictionaries()
  }, [pagination.page])

  // 筛选变化时重新加载
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
    loadDictionaries()
  }, [searchText, typeFilter, statusFilter])

  useEffect(() => {
    loadDictTypes()
  }, [])

  const handleSearch = (value: string) => {
    debouncedSearch(value)
  }

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status as DictStatus | '')
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(dictionaries.map(dict => dict.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id))
    }
  }

  const handleToggleExpand = (dictId: string) => {
    setExpandedDict(prev => prev === dictId ? null : dictId)
  }

  const handleEdit = (dict: DataDict) => {
    setEditingDict(dict)
    setIsEditModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个数据字典吗？删除后无法恢复。')) {
      try {
        const success = await dictApi.deleteDictionary(id)
        if (success) {
          loadDictionaries()
          setSelectedIds(prev => prev.filter(selectedId => selectedId !== id))
        } else {
          alert('删除失败')
        }
      } catch (error) {
        console.error('Delete dictionary failed:', error)
        alert('删除失败')
      }
    }
  }

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      alert('请选择要删除的数据字典')
      return
    }

    if (window.confirm(`确定要删除选中的 ${selectedIds.length} 个数据字典吗？删除后无法恢复。`)) {
      try {
        const success = await dictApi.deleteDictionaries(selectedIds)
        if (success) {
          loadDictionaries()
          setSelectedIds([])
        } else {
          alert('批量删除失败')
        }
      } catch (error) {
        console.error('Batch delete failed:', error)
        alert('批量删除失败')
      }
    }
  }

  const handleExport = async () => {
    try {
      const exportIds = selectedIds.length > 0 ? selectedIds : undefined
      const blob = await dictApi.exportDictionaries(exportIds)
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `data-dictionaries-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('导出失败')
    }
  }

  const handleSyncToDevices = async () => {
    if (selectedIds.length === 0) {
      alert('请选择要同步的数据字典')
      return
    }

    if (window.confirm(`确定要将选中的 ${selectedIds.length} 个数据字典同步到设备吗？`)) {
      try {
        const success = await dictApi.syncToDevices(selectedIds)
        if (success) {
          alert('同步成功')
        } else {
          alert('同步失败')
        }
      } catch (error) {
        console.error('Sync failed:', error)
        alert('同步失败')
      }
    }
  }

  const handleCreateNew = () => {
    setEditingDict(null)
    setIsEditModalOpen(true)
  }

  const handleSaveDict = async (data: CreateDictRequest) => {
    try {
      if (editingDict) {
        await dictApi.updateDictionary(editingDict.id, data)
      } else {
        await dictApi.createDictionary(data)
      }
      loadDictionaries()
      setIsEditModalOpen(false)
      setEditingDict(null)
    } catch (error) {
      console.error('Save dictionary failed:', error)
      throw error
    }
  }

  const renderStatus = (status: DictStatus) => {
    const config = statusConfig[status]
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.bgColor} ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    )
  }

  const renderDictItems = (items: DictItem[] = []) => {
    if (!items || items.length === 0) return null

    return (
      <div className="mt-4 border-t pt-4">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          字典项列表
          <Button variant="outline" size="sm">
            <Plus className="w-3 h-3 mr-1" />
            新增项
          </Button>
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left p-2 font-medium">项编码</th>
                <th className="text-left p-2 font-medium">项名称</th>
                <th className="text-left p-2 font-medium">项值</th>
                <th className="text-left p-2 font-medium">状态</th>
                <th className="text-center p-2 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b hover:bg-muted/10">
                  <td className="p-2 font-mono text-xs">{item.code}</td>
                  <td className="p-2">{item.name}</td>
                  <td className="p-2 font-mono text-xs">{item.value}</td>
                  <td className="p-2">{renderStatus(item.status)}</td>
                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const columns: TableColumn<DataDict>[] = [
    {
      key: 'select',
      title: '',
      width: 50,
      render: (_, record: DataDict) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(record.id)}
          onChange={(e) => handleSelectItem(record.id, e.target.checked)}
          className="rounded border-gray-300"
        />
      ),
    },
    {
      key: 'dictCode',
      title: '字典ID',
      width: 120,
      render: (dictCode: string) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">{dictCode}</code>
      ),
    },
    {
      key: 'dictName',
      title: '字典名称',
      width: 150,
      render: (dictName: string) => (
        <span className="font-medium">{dictName}</span>
      ),
    },
    {
      key: 'dictType',
      title: '字典类型',
      width: 100,
      render: (dictType: string) => (
        <span className="text-sm text-muted-foreground">{dictType}</span>
      ),
    },
    {
      key: 'itemCount',
      title: '子项数量',
      width: 80,
      align: 'center',
      render: (itemCount: number) => (
        <span className="font-medium">{itemCount}</span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      width: 80,
      render: (status: DictStatus) => renderStatus(status),
    },
    {
      key: 'actions',
      title: '操作',
      width: 200,
      align: 'center',
      render: (_, record: DataDict) => (
        <div className="flex items-center justify-center gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleToggleExpand(record.id)}
            title="查看详情"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleEdit(record)}
            title="编辑"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleDelete(record.id)}
            className="text-red-600 hover:text-red-700"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleExport()}
            title="下载"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  const isAllSelected = dictionaries.length > 0 && selectedIds.length === dictionaries.length
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < dictionaries.length

  return (
    <div className="space-y-4">
      {/* 标题区域 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">数据字典管理</h1>
          <p className="text-muted-foreground">管理系统数据字典配置</p>
        </div>
      </div>

      {/* 搜索和筛选工具栏 */}
      <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索字典名称或ID..."
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={typeFilter}
              onChange={(e) => handleTypeFilter(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">字典类型</option>
              {dictTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">状态</option>
              <option value="enabled">启用</option>
              <option value="disabled">禁用</option>
            </select>
          </div>
        </div>
      </div>

      {/* 操作按钮区域 */}
      <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={(el) => {
              if (el) el.indeterminate = isIndeterminate
            }}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-muted-foreground">
            {selectedIds.length > 0 && `已选择 ${selectedIds.length} 项`}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
            disabled={selectedIds.length === 0 && dictionaries.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleBatchDelete}
            disabled={selectedIds.length === 0}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            批量删除
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSyncToDevices}
            disabled={selectedIds.length === 0}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            同步到设备
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            新增字典
          </Button>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-background rounded-lg border">
        <DataTable
          data={dictionaries}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPaginationChange={(paginationParams) => {
            setPagination(prev => ({
              ...prev,
              page: paginationParams.page,
              pageSize: paginationParams.pageSize
            }))
          }}
          bordered={true}
          compact={true}
        />
        
        {/* 展开的字典详情 */}
        {expandedDict && (
          <div className="border-t">
            {dictionaries.map(dict => {
              if (dict.id !== expandedDict) return null
              
              return (
                <Card key={dict.id} className="m-4 border-0 shadow-none">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <span>字典详情: {dict.dictCode} - {dict.dictName}</span>
                      </h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setExpandedDict(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">字典类型：</span>
                        <span className="font-medium">{dict.dictType}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">状态：</span>
                        {renderStatus(dict.status)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">子项数量：</span>
                        <span className="font-medium">{dict.itemCount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">更新时间：</span>
                        <span className="font-medium">{new Date(dict.updatedAt).toLocaleString('zh-CN')}</span>
                      </div>
                    </div>
                    
                    {dict.remark && (
                      <div className="mb-4 text-sm">
                        <span className="text-muted-foreground">备注：</span>
                        <span>{dict.remark}</span>
                      </div>
                    )}
                    
                    {renderDictItems(dict.items || [])}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* 编辑弹窗 */}
      <DictEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingDict(null)
        }}
        onSave={handleSaveDict}
        dict={editingDict}
      />
    </div>
  )
}

export default DataDictionaryPage