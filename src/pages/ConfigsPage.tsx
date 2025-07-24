import React, { useState } from 'react'
import { Plus, Search, FileText, Download, Upload } from 'lucide-react'
import { 
  Button, 
  Input, 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  DataTable,
  YamlEditor
} from '@/components'
import { useConfigs, useConfigOperations } from '@/hooks'
import { formatDate } from '@/utils'
import type { ConfigItem, PaginationParams, TableColumn } from '@/types'

export function ConfigsPage() {
  const [searchText, setSearchText] = useState('')
  const [selectedConfig, setSelectedConfig] = useState<ConfigItem | null>(null)
  const [editingConfig, setEditingConfig] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: 20,
  })
  
  const { data: configsData, isLoading } = useConfigs({
    ...pagination,
    search: searchText,
  })
  
  const { updateConfig } = useConfigOperations()
  
  const handleSearch = (value: string) => {
    setSearchText(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }
  
  const handleSelectConfig = (config: ConfigItem) => {
    setSelectedConfig(config)
    setEditingConfig(config.content)
    setIsEditing(false)
  }
  
  const handleSaveConfig = async () => {
    if (selectedConfig) {
      updateConfig.mutate({
        id: selectedConfig.id,
        data: { content: editingConfig }
      }, {
        onSuccess: () => {
          setSelectedConfig({ ...selectedConfig, content: editingConfig })
          setIsEditing(false)
        }
      })
    }
  }
  
  const handleCancelEdit = () => {
    if (selectedConfig) {
      setEditingConfig(selectedConfig.content)
    }
    setIsEditing(false)
  }
  
  const columns: TableColumn<ConfigItem>[] = [
    {
      key: 'name',
      title: '配置名称',
      width: 200,
      render: (name: string, record: ConfigItem) => (
        <button
          onClick={() => handleSelectConfig(record)}
          className="flex items-center gap-2 text-left hover:text-primary"
        >
          <FileText className="h-4 w-4" />
          {name}
        </button>
      ),
    },
    {
      key: 'type',
      title: '类型',
      width: 100,
      render: (type: string) => (
        <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium">
          {type.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'description',
      title: '描述',
      render: (description?: string) => (
        <span className="text-muted-foreground">
          {description || '暂无描述'}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      title: '更新时间',
      width: 180,
      render: (updatedAt: string) => formatDate(updatedAt),
    },
    {
      key: 'actions',
      title: '操作',
      width: 120,
      align: 'center',
      render: (_, record: ConfigItem) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Upload className="h-4 w-4" />
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
          <h1 className="text-3xl font-bold tracking-tight">配置管理</h1>
          <p className="text-muted-foreground">
            管理系统和设备配置文件
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新建配置
        </Button>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 配置列表 */}
        <div className="space-y-4">
          {/* 搜索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索配置..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* 配置表格 */}
          <Card>
            <CardHeader>
              <CardTitle>配置列表</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                data={configsData?.data?.items || []}
                columns={columns}
                loading={isLoading}
                pagination={{
                  ...pagination,
                  total: configsData?.data?.pagination?.total || 0,
                }}
                onPaginationChange={setPagination}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* 配置编辑器 */}
        <div className="space-y-4">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedConfig ? selectedConfig.name : '配置编辑器'}
                </CardTitle>
                {selectedConfig && (
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          取消
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveConfig}
                          loading={updateConfig.isPending}
                        >
                          保存
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        编辑
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {selectedConfig ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">类型：</span>
                      <span className="ml-2">{selectedConfig.type.toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">更新时间：</span>
                      <span className="ml-2">{formatDate(selectedConfig.updatedAt)}</span>
                    </div>
                  </div>
                  
                  <YamlEditor
                    value={editingConfig}
                    onChange={setEditingConfig}
                    readOnly={!isEditing}
                    height={500}
                  />
                </div>
              ) : (
                <div className="flex h-[500px] items-center justify-center text-muted-foreground">
                  选择一个配置文件开始编辑
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
