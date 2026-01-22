import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Search, Tablet, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DataTable } from '@/components/features/DataTable'
import { Modal } from '@/components/ui/Modal'
import { deviceApi } from '@/services/api/device.api'
import { debounce, formatDate } from '@/utils'
import { useDialog } from '@/hooks/useModal'
import { useNotifications } from '@/hooks/useNotifications'
import { DialogComponents } from '@/components/ui/DialogComponents'
import { useDevices } from '@/hooks/useDevices'
import type { 
  Device, 
  DeviceFilters, 
  DeviceStatus, 
  UpdateDeviceRequest,
  TableColumn 
} from '@/types'

// 设备状态配置
const statusConfig: Record<DeviceStatus, { label: string; color: string; bgColor: string }> = {
  '-1': { label: '未注册', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  0: { label: '离线', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  1: { label: '在线', color: 'text-green-600', bgColor: 'bg-green-100' },
  2: { label: '维护中', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  3: { label: '已禁用', color: 'text-red-600', bgColor: 'bg-red-100' },
}

const DeviceListPage: React.FC = () => {
  const dialog = useDialog()
  const { showSuccess, showError } = useNotifications()
  const queryClient = useQueryClient()

  // 搜索和筛选状态
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | ''>('')
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
  })

  // 弹窗状态
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [formData, setFormData] = useState({
    serial_number: '',
    number: undefined as number | undefined,
    department: '',
    manager: '',
    remark: '',
  })
  const [submitting, setSubmitting] = useState(false)

  // 防抖搜索
  const debouncedSearch = debounce((keyword: string) => {
    setSearchText(keyword)
    setPagination(prev => ({ ...prev, page: 1 }))
  }, 500)

  // 构建筛选条件
  const filters: DeviceFilters = {
    keyword: searchText || undefined,
    status: statusFilter !== '' ? statusFilter : undefined,
  }

  // 使用 TanStack Query 获取数据
  const { devices, total, isLoading, isError, error } = useDevices(
    filters,
    pagination.page,
    pagination.pageSize
  )

  // 刷新列表
  const refreshList = () => {
    queryClient.invalidateQueries({ queryKey: ['devices'] })
  }

  // 打开编辑弹窗
  const handleEdit = (device: Device) => {
    setEditingDevice(device)
    setFormData({
      serial_number: device.serialNumber,
      number: device.number,
      department: device.department || '',
      manager: device.manager || '',
      remark: device.remark || '',
    })
    setModalOpen(true)
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!formData.serial_number.trim()) {
      showError('验证失败', '序列号不能为空')
      return
    }

    if (!editingDevice) return

    setSubmitting(true)
    try {
      const updateData: UpdateDeviceRequest = {
        serial_number: formData.serial_number,
        number: formData.number,
        department: formData.department || undefined,
        manager: formData.manager || undefined,
        remark: formData.remark || undefined,
      }
      await deviceApi.updateDevice(editingDevice.id, updateData)
      showSuccess('更新成功', '设备信息已更新')
      setModalOpen(false)
      refreshList()
    } catch (err: any) {
      showError('更新失败', err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // 删除设备
  const handleDelete = async (device: Device) => {
    const confirmed = await dialog.confirm({
      title: '删除设备',
      message: `确定要删除设备「${device.serialNumber}」吗？`,
      content: '此操作不可恢复。',
      type: 'danger',
      confirmText: '删除',
      cancelText: '取消',
    })

    if (!confirmed) return

    try {
      await deviceApi.deleteDevice(device.id)
      showSuccess('删除成功')
      refreshList()
    } catch (err: any) {
      showError('删除失败', err.message)
    }
  }

  // 渲染状态标签
  const renderStatus = (status: DeviceStatus) => {
    const config = statusConfig[status]
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.bgColor} ${config.color}`}>
        {status === -1 && <AlertCircle className="w-3 h-3 mr-1" />}
        {config.label}
      </span>
    )
  }

  // 表格列定义
  const columns: TableColumn<Device>[] = [
    {
      key: 'serialNumber',
      title: '序列号',
      width: 180,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Tablet className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono">{record.serialNumber}</span>
        </div>
      ),
    },
    {
      key: 'typeName',
      title: '设备类型',
      width: 100,
    },
    {
      key: 'department',
      title: '所属部门',
      width: 120,
      render: (value) => value || '-',
    },
    {
      key: 'manager',
      title: '管理人',
      width: 100,
      render: (value) => value || '-',
    },
    {
      key: 'status',
      title: '状态',
      width: 100,
      render: (status: DeviceStatus) => renderStatus(status),
    },
    {
      key: 'lastLogin',
      title: '最后在线',
      width: 160,
      render: (value) => value ? formatDate(value) : '-',
    },
    {
      key: 'ip',
      title: 'IP地址',
      width: 130,
      render: (value) => value || '-',
    },
    {
      key: 'actions',
      title: '操作',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(record)}
            className="text-red-600 hover:text-red-700"
          >
            删除
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          {/* 搜索框 */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索序列号、部门、管理人..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* 筛选器 */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value !== '' ? Number(e.target.value) as DeviceStatus : '')
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">全部状态</option>
            <option value="-1">未注册</option>
          </select>
        </div>
      </div>

      {/* 错误提示 */}
      {isError && (
        <div className="mx-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
          <p className="font-medium">加载失败</p>
          <p className="text-sm mt-1">{error?.message || '未知错误'}</p>
        </div>
      )}

      {/* 设备列表 */}
      <div className="px-4">
        <DataTable
          data={devices}
          columns={columns}
          loading={isLoading}
          pagination={{
            page: pagination.page,
            pageSize: pagination.pageSize,
            total: total,
          }}
          onPaginationChange={(p) => {
            setPagination({ page: p.page, pageSize: p.pageSize })
          }}
          bordered
          compact
        />
      </div>

      {/* 编辑弹窗 */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="编辑设备"
      >
        <div className="space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              序列号 <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.serial_number}
              onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
              placeholder="请输入设备序列号"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">设备编号</label>
            <Input
              type="number"
              value={formData.number ?? ''}
              onChange={(e) => setFormData({ ...formData, number: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="请输入设备编号"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">所属部门</label>
            <Input
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="请输入所属部门"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">管理人</label>
            <Input
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              placeholder="请输入设备管理人"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">备注</label>
            <textarea
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              placeholder="请输入备注信息"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[80px] resize-none"
            />
          </div>

          {/* 未注册设备提示 */}
          {editingDevice && editingDevice.status === -1 && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
              <p className="text-sm text-orange-700">
                <AlertCircle className="inline w-4 h-4 mr-1" />
                此设备为未注册状态，保存后将自动注册为离线状态。
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? '保存中...' : '保存'}
          </Button>
        </div>
      </Modal>

      {/* 对话框组件 */}
      <DialogComponents dialog={dialog} />
    </div>
  )
}

export default DeviceListPage
