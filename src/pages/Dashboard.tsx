import { Calendar, FileText, RefreshCw, AlertCircle, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

const Dashboard = () => {
  // Mock数据 - 后续替换为真实API
  const meetingStats = {
    total: 156,
    thisWeek: 12,
    inProgress: 3,
    scheduled: 8
  }

  const documentStats = {
    total: 2840,
    thisMonth: 156,
    pending: 12,
    approved: 128
  }

  const syncStats = {
    online: 45,
    offline: 8,
    lastSync: '2025-01-15 14:30:25',
    conflicts: 2
  }

  const alertStats = {
    total: 5,
    high: 1,
    medium: 2,
    low: 2
  }

  const stats = [
    {
      title: '会议总数',
      value: meetingStats.total,
      description: '本周新增 ' + meetingStats.thisWeek + ' 个',
      icon: Calendar,
      trend: {
        value: 8.2,
        isPositive: true,
      },
    },
    {
      title: '进行中会议',
      value: meetingStats.inProgress,
      description: '已安排 ' + meetingStats.scheduled + ' 个',
      icon: Clock,
    },
    {
      title: '文档总数',
      value: documentStats.total,
      description: '本月新增 ' + documentStats.thisMonth + ' 个',
      icon: FileText,
      trend: {
        value: 12.5,
        isPositive: true,
      },
    },
    {
      title: '在线设备',
      value: syncStats.online,
      description: syncStats.offline + ' 个设备离线',
      icon: RefreshCw,
    },
  ]

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">仪表板</h1>
        <p className="text-muted-foreground">
          会议文档管理系统概览
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{stat.description}</span>
                {stat.trend && (
                  <div className={`flex items-center ${
                    stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>+{stat.trend.value}%</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 详细信息区域 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* 会议状态 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">会议状态</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>进行中</span>
              </div>
              <span className="font-medium">{meetingStats.inProgress}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-yellow-500" />
                <span>已安排</span>
              </div>
              <span className="font-medium">{meetingStats.scheduled}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>本周完成</span>
              </div>
              <span className="font-medium">{meetingStats.thisWeek}</span>
            </div>
          </CardContent>
        </Card>

        {/* 文档状态 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">文档状态</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span>待审核</span>
              </div>
              <span className="font-medium">{documentStats.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>已通过</span>
              </div>
              <span className="font-medium">{documentStats.approved}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span>本月新增</span>
              </div>
              <span className="font-medium">{documentStats.thisMonth}</span>
            </div>
          </CardContent>
        </Card>

        {/* 同步状态 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">同步状态</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 text-green-500" />
                <span>在线设备</span>
              </div>
              <span className="font-medium">{syncStats.online}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span>离线设备</span>
              </div>
              <span className="font-medium">{syncStats.offline}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>最后同步</span>
              </div>
              <span className="text-xs font-medium">14:30</span>
            </div>
            {syncStats.conflicts > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span>同步冲突</span>
                </div>
                <span className="font-medium text-orange-600">{syncStats.conflicts}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 异常告警 */}
      {alertStats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span>异常告警</span>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {alertStats.total}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{alertStats.high}</div>
                <div className="text-sm text-muted-foreground">高风险</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{alertStats.medium}</div>
                <div className="text-sm text-muted-foreground">中风险</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{alertStats.low}</div>
                <div className="text-sm text-muted-foreground">低风险</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Dashboard
