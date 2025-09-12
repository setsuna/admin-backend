import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import type { DataDict, DictItem, DictStatus, CreateDictRequest } from '@/types'

interface DictEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateDictRequest) => Promise<void>
  dict?: DataDict | null
}

const DictEditModal: React.FC<DictEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  dict
}) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    dictCode: '',
    dictName: '',
    dictType: '',
    status: 'enabled' as DictStatus,
    remark: ''
  })
  const [items, setItems] = useState<Omit<DictItem, 'id' | 'createdAt' | 'updatedAt'>[]>([])

  useEffect(() => {
    if (dict) {
      setFormData({
        dictCode: dict.dictCode,
        dictName: dict.dictName,
        dictType: dict.dictType,
        status: dict.status,
        remark: dict.remark || ''
      })
      // 安全处理 dict.items，防止 undefined 错误
      const dictItems = dict.items || []
      setItems(dictItems.map(item => ({
        code: item.code,
        name: item.name,
        value: item.value,
        status: item.status,
        sort: item.sort,
        remark: item.remark
      })))
    } else {
      setFormData({
        dictCode: '',
        dictName: '',
        dictType: '',
        status: 'enabled',
        remark: ''
      })
      setItems([])
    }
  }, [dict, isOpen])

  const handleAddItem = () => {
    setItems(prev => [...prev, {
      code: '',
      name: '',
      value: '',
      status: 'enabled',
      sort: prev.length + 1,
      remark: ''
    }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const handleSave = async () => {
    if (!formData.dictCode || !formData.dictName || !formData.dictType) {
      alert('请填写必填字段')
      return
    }

    try {
      setLoading(true)
      await onSave({
        ...formData,
        items
      })
      onClose()
    } catch (error) {
      console.error('Save failed:', error)
      alert('保存失败')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {dict ? '编辑数据字典' : '新建数据字典'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 基础信息 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>基础信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">字典编码 *</label>
                  <Input
                    value={formData.dictCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, dictCode: e.target.value }))}
                    placeholder="请输入字典编码"
                    disabled={!!dict}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">字典名称 *</label>
                  <Input
                    value={formData.dictName}
                    onChange={(e) => setFormData(prev => ({ ...prev, dictName: e.target.value }))}
                    placeholder="请输入字典名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">字典类型 *</label>
                  <Input
                    value={formData.dictType}
                    onChange={(e) => setFormData(prev => ({ ...prev, dictType: e.target.value }))}
                    placeholder="请输入字典类型"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">状态</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as DictStatus }))}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="enabled">启用</option>
                    <option value="disabled">禁用</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">备注</label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
                  placeholder="请输入备注信息"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* 字典项 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>字典项</CardTitle>
                <Button variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加项
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无字典项，点击添加项按钮开始添加
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">字典项 {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">项编码 *</label>
                          <Input
                            value={item.code}
                            onChange={(e) => handleItemChange(index, 'code', e.target.value)}
                            placeholder="请输入项编码"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">项名称 *</label>
                          <Input
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            placeholder="请输入项名称"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">项值 *</label>
                          <Input
                            value={item.value}
                            onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                            placeholder="请输入项值"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">状态</label>
                          <select
                            value={item.status}
                            onChange={(e) => handleItemChange(index, 'status', e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                          >
                            <option value="enabled">启用</option>
                            <option value="disabled">禁用</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">排序</label>
                          <Input
                            type="number"
                            value={item.sort}
                            onChange={(e) => handleItemChange(index, 'sort', parseInt(e.target.value) || 0)}
                            placeholder="排序序号"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">备注</label>
                          <Input
                            value={item.remark || ''}
                            onChange={(e) => handleItemChange(index, 'remark', e.target.value)}
                            placeholder="请输入备注"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-2 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DictEditModal