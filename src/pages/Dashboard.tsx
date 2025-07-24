import React from 'react'
import { Server, Wifi, AlertTriangle, Activity } from 'lucide-react'
import { StatsGrid, Card, CardHeader, CardTitle, CardContent } from '@/components'
import { useDeviceStats, useWebSocket, useDeviceStatus } from '@/hooks'

export function Dashboard() {
  useWebSocket()
  useDeviceStatus()
  
  const { data: deviceStats } = useDeviceStats()
  
  const stats = [
    {
      title: '设备总数',
      value: deviceStats?.data?.total || 0,
      description: '已注册设备数量',
      icon: Server,
    },
    {
      title: '在线设备',
      value: deviceStats?.data?.online || 0,
      description: '当前在线设备',
      icon: Wifi,
      trend: {
        value: 12,
        isPositive: true,
      },
    },
    {
      title: '离线设备',
      value: deviceStats?.data?.offline || 0,
      description: '当前离线设备',
      icon: AlertTriangle,
    },
    {
      title: '异常设备',
      value: (deviceStats?.data?.warning || 0) + (deviceStats?.data?.error || 0),
      description: '需要关注的设备',
      icon: Activity,
    },
  ]
  
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">仪表板</h1>
        <p className="text-muted-foreground">
          系统运行状态概览
        </p>
      </div>
      
      {/* 统计卡片 */}
      <StatsGrid stats={stats} />
      
      {/* 详细信息 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 设备状态分布 */}
        <Card>
          <CardHeader>
            <CardTitle>设备状态分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceStats?.data && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span className="text-sm">在线</span>
                    </div>
                    <span className="text-sm font-medium">
                      {deviceStats.data.online}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-gray-400" />
                      <span className="text-sm">离线</span>
                    </div>
                    <span className="text-sm font-medium">
                      {deviceStats.data.offline}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <span className="text-sm">警告</span>
                    </div>
                    <span className="text-sm font-medium">
                      {deviceStats.data.warning}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <span className="text-sm">错误</span>
                    </div>
                    <span className="text-sm font-medium">
                      {deviceStats.data.error}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* 系统信息 */}
        <Card>
          <CardHeader>
            <CardTitle>系统信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">系统版本</span>
                <span className="text-sm font-medium">v1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">运行时间</span>
                <span className="text-sm font-medium">7天 12小时</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">最后更新</span>
                <span className="text-sm font-medium">2分钟前</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">数据库状态</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">正常</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
