import React, { useState } from 'react'
import { Plus, Search, Filter, MoreHorizontal, Power, Settings2 } from 'lucide-react'
import { 
  Button, 
  Input, 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatusIndicator,
  DataTable 
} from '@/components'
import { useDevices, useDeviceOperations } from '@/hooks'
import { formatDate } from '@/utils'
import type { Device, PaginationParams, TableColumn } from '@/types'

export function DevicesPage() {
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: 20,
  })
  
  const { data: devicesData, isLoading } = useDevices({
    ...pagination,
    search: searchText,
    status: statusFilter,
  })
  
  const { deleteDevice } = useDeviceOperations()
  
  const handleSearch = (value: string) => {
    setSearchText(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }
  
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setPagination(prev => ({ ...prev, page: 1 }))
  }
  
  const handleDeleteDevice = async (id: string) => {
    if (window.confirm('确定要删除这个设备吗？')) {
      deleteDevice.mutate(id)
    }
  }
  
  const columns: TableColumn<Device>[] = [
    {
      key: 'name',
      title: '设备名称',
      width: 200,
    },
    {
      key: 'type',
      title: '设备类型',
      width: 120,
    },
    {
      key: 'status',
      title: '状态',
      width: 120,
      render: (status: Device['status']) => (
        <StatusIndicator status={status} showPulse={status === 'online'} />
      ),
    },
    {
      key: 'ip',
      title: 'IP地址',
      width: 150,
    },
    {
      key: 'port',
      title: '端口',
      width: 80,
    },
    {
      key: 'lastSeen',
      title: '最后在线',
      width: 180,
      render: (lastSeen: string) => formatDate(lastSeen),
    },
    {
      key: 'actions',
      title: '操作',
      width: 120,
      align: 'center',
      render: (_, record: Device) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Power className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => handleDeleteDevice(record.id)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]
  
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">设备管理</h1>
          <p className="text-muted-foreground">
            管理和监控所有设备状态
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          添加设备
        </Button>
      </div>
      
      {/* 工具栏 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索设备名称或IP..."
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">全部状态</option>
                <option value="online">在线</option>
                <option value="offline">离线</option>
                <option value="warning">警告</option>
                <option value="error">错误</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 设备列表 */}
      <Card>
        <CardHeader>
          <CardTitle>设备列表</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={devicesData?.data?.items || []}
            columns={columns}
            loading={isLoading}
            pagination={{
              ...pagination,
              total: devicesData?.data?.pagination?.total || 0,
            }}
            onPaginationChange={setPagination}
          />
        </CardContent>
      </Card>
    </div>
  )
}
